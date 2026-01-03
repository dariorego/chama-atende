import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HelpCircle, Plus, Minus, Check, ArrowRight, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClientItemCombinations, useClientOrderItem, CombinationGroup, CombinationOption } from "@/hooks/useClientItemCombinations";

// Selection state types
interface MultipleSelection {
  [optionId: string]: boolean;
}

interface QuantitySelection {
  [optionId: string]: number;
}

interface SingleSelection {
  selectedId: string | null;
}

type GroupSelection = MultipleSelection | QuantitySelection | SingleSelection;

const CustomizeOrderPage = () => {
  const navigate = useNavigate();
  const { baseId } = useParams<{ baseId: string }>();
  
  const { data: orderItem, isLoading: itemLoading } = useClientOrderItem(baseId);
  const { data: combinationGroups, isLoading: groupsLoading } = useClientItemCombinations(baseId);
  
  const [activeTab, setActiveTab] = useState<string>("");
  const [selections, setSelections] = useState<Record<string, GroupSelection>>({});
  const [chefNotes, setChefNotes] = useState("");

  // Initialize active tab when groups load
  useEffect(() => {
    if (combinationGroups && combinationGroups.length > 0 && !activeTab) {
      setActiveTab(combinationGroups[0].id);
    }
  }, [combinationGroups, activeTab]);

  // Initialize selections when groups load
  useEffect(() => {
    if (combinationGroups) {
      const initialSelections: Record<string, GroupSelection> = {};
      combinationGroups.forEach((group) => {
        if (group.selection_type === "single") {
          initialSelections[group.id] = { selectedId: null };
        } else if (group.selection_type === "quantity") {
          initialSelections[group.id] = {};
        } else {
          initialSelections[group.id] = {};
        }
      });
      setSelections(initialSelections);
    }
  }, [combinationGroups]);

  const handleBack = () => {
    navigate("/pedido-cozinha");
  };

  // Multiple selection handler
  const handleMultipleToggle = (groupId: string, optionId: string, maxSelections: number | null) => {
    setSelections((prev) => {
      const groupSel = prev[groupId] as MultipleSelection || {};
      const isSelected = groupSel[optionId];
      
      if (isSelected) {
        const { [optionId]: _, ...rest } = groupSel;
        return { ...prev, [groupId]: rest };
      }
      
      // Check max selections
      const currentCount = Object.values(groupSel).filter(Boolean).length;
      if (maxSelections && currentCount >= maxSelections) {
        return prev;
      }
      
      return { ...prev, [groupId]: { ...groupSel, [optionId]: true } };
    });
  };

  // Quantity selection handler
  const handleQuantityChange = (groupId: string, optionId: string, delta: number, maxPerOption: number = 10) => {
    setSelections((prev) => {
      const groupSel = prev[groupId] as QuantitySelection || {};
      const current = groupSel[optionId] || 0;
      const newValue = Math.max(0, Math.min(maxPerOption, current + delta));
      
      if (newValue === 0) {
        const { [optionId]: _, ...rest } = groupSel;
        return { ...prev, [groupId]: rest };
      }
      
      return { ...prev, [groupId]: { ...groupSel, [optionId]: newValue } };
    });
  };

  // Single selection handler
  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: { selectedId: optionId },
    }));
  };

  // Calculate total selections
  const getTotalSelections = () => {
    let total = 0;
    Object.entries(selections).forEach(([groupId, groupSel]) => {
      const group = combinationGroups?.find((g) => g.id === groupId);
      if (!group) return;
      
      if (group.selection_type === "single") {
        if ((groupSel as SingleSelection).selectedId) total += 1;
      } else if (group.selection_type === "quantity") {
        total += Object.values(groupSel as QuantitySelection).reduce((a, b) => a + b, 0);
      } else {
        total += Object.values(groupSel as MultipleSelection).filter(Boolean).length;
      }
    });
    return total;
  };

  // Get selections count for a group
  const getGroupSelectionCount = (groupId: string, group: CombinationGroup) => {
    const groupSel = selections[groupId];
    if (!groupSel) return 0;
    
    if (group.selection_type === "single") {
      return (groupSel as SingleSelection).selectedId ? 1 : 0;
    } else if (group.selection_type === "quantity") {
      return Object.values(groupSel as QuantitySelection).reduce((a, b) => a + b, 0);
    } else {
      return Object.values(groupSel as MultipleSelection).filter(Boolean).length;
    }
  };

  const handleConfirm = () => {
    // Build selections data for review page
    const formattedSelections: { optionId: string; optionName: string; quantity: number; additionalPrice: number }[] = [];
    
    Object.entries(selections).forEach(([groupId, groupSel]) => {
      const group = combinationGroups?.find((g) => g.id === groupId);
      if (!group) return;
      
      if (group.selection_type === "single") {
        const sel = groupSel as SingleSelection;
        if (sel.selectedId) {
          const option = group.options.find((o) => o.id === sel.selectedId);
          if (option) {
            formattedSelections.push({
              optionId: option.id,
              optionName: option.name,
              quantity: 1,
              additionalPrice: option.additional_price || 0,
            });
          }
        }
      } else if (group.selection_type === "quantity") {
        const sel = groupSel as QuantitySelection;
        Object.entries(sel).forEach(([optionId, qty]) => {
          if (qty > 0) {
            const option = group.options.find((o) => o.id === optionId);
            if (option) {
              formattedSelections.push({
                optionId: option.id,
                optionName: option.name,
                quantity: qty,
                additionalPrice: option.additional_price || 0,
              });
            }
          }
        });
      } else {
        const sel = groupSel as MultipleSelection;
        Object.entries(sel).forEach(([optionId, isSelected]) => {
          if (isSelected) {
            const option = group.options.find((o) => o.id === optionId);
            if (option) {
              formattedSelections.push({
                optionId: option.id,
                optionName: option.name,
                quantity: 1,
                additionalPrice: option.additional_price || 0,
              });
            }
          }
        });
      }
    });

    navigate(`/pedido-cozinha/${baseId}/revisao`, {
      state: {
        orderItemId: baseId,
        orderItemName: orderItem?.name,
        selections: formattedSelections,
        notes: chefNotes,
      },
    });
  };

  if (itemLoading || groupsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Item não encontrado</p>
      </div>
    );
  }

  const totalSelections = getTotalSelections();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <h1 className="text-base font-semibold text-foreground">
            Personalizar {orderItem.name}
          </h1>
          
          <button className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-1 px-4 pb-3">
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-primary" />
          <div className="flex-1 h-1 rounded-full bg-muted" />
        </div>
      </header>

      {/* Empty State */}
      {(!combinationGroups || combinationGroups.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-muted-foreground mb-4">Nenhuma opção de personalização disponível.</p>
          <Button onClick={handleConfirm}>
            Continuar sem personalização
          </Button>
        </div>
      ) : (
        /* Tabs */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="sticky top-[73px] z-40 w-full justify-start gap-2 px-4 py-2 bg-background border-b border-border rounded-none h-auto overflow-x-auto">
            {combinationGroups.map((group) => (
              <TabsTrigger 
                key={group.id}
                value={group.id}
                className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pb-32">
            {combinationGroups.map((group) => (
              <TabsContent key={group.id} value={group.id} className="mt-0 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {group.description || `Escolha ${group.name.toLowerCase()}`}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {group.max_selections 
                      ? `Máx. ${group.max_selections}` 
                      : group.selection_type === "single" 
                        ? "Escolha 1"
                        : "Ilimitado"
                    }
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecionados: {getGroupSelectionCount(group.id, group)}
                  {group.max_selections && `/${group.max_selections}`}
                </p>
                
                {/* Render based on selection type */}
                {group.selection_type === "single" && (
                  <SingleSelectGroup 
                    group={group} 
                    selection={selections[group.id] as SingleSelection}
                    onSelect={(optionId) => handleSingleSelect(group.id, optionId)}
                  />
                )}
                
                {group.selection_type === "quantity" && (
                  <QuantitySelectGroup 
                    group={group} 
                    selection={selections[group.id] as QuantitySelection}
                    onChange={(optionId, delta) => handleQuantityChange(group.id, optionId, delta)}
                  />
                )}
                
                {group.selection_type === "multiple" && (
                  <MultipleSelectGroup 
                    group={group} 
                    selection={selections[group.id] as MultipleSelection}
                    onToggle={(optionId) => handleMultipleToggle(group.id, optionId, group.max_selections)}
                  />
                )}
              </TabsContent>
            ))}

            {/* Chef's Notes */}
            <div className="p-4 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Observações do Chef</h2>
              <Textarea
                placeholder="Ex: Bem passado, sem sal, extra crocante..."
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                className="min-h-[100px] resize-none bg-surface placeholder:text-surface-foreground"
              />
            </div>
          </div>
        </Tabs>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 pb-6">
        <Button
          onClick={handleConfirm}
          className="w-full h-14 rounded-full text-base font-semibold gap-2"
          size="lg"
        >
          Confirmar Seleção
          {totalSelections > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground">
              {totalSelections}
            </Badge>
          )}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
};

// Single Select Component (Radio-like)
const SingleSelectGroup = ({ 
  group, 
  selection, 
  onSelect 
}: { 
  group: CombinationGroup; 
  selection: SingleSelection | undefined; 
  onSelect: (optionId: string) => void;
}) => {
  const selectedId = selection?.selectedId;
  
  return (
    <div className="space-y-3">
      {group.options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
            selectedId === option.id
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-muted-foreground/30"
          )}
        >
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedId === option.id
                ? "border-primary bg-primary"
                : "border-muted-foreground/30"
            )}
          >
            {selectedId === option.id && (
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">
              {option.emoji && `${option.emoji} `}{option.name}
            </p>
            {option.description && (
              <p className="text-sm text-muted-foreground">{option.description}</p>
            )}
          </div>
          {option.additional_price && option.additional_price > 0 && (
            <span className="text-sm text-primary font-medium">
              +R$ {option.additional_price.toFixed(2)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// Multiple Select Component (Checkbox-like)
const MultipleSelectGroup = ({ 
  group, 
  selection, 
  onToggle 
}: { 
  group: CombinationGroup; 
  selection: MultipleSelection | undefined; 
  onToggle: (optionId: string) => void;
}) => {
  // Use emoji-based grid layout if options have emojis
  const hasEmojis = group.options.some((o) => o.emoji);
  
  if (hasEmojis) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {group.options.map((option) => {
          const isSelected = selection?.[option.id] || false;
          return (
            <button
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all relative",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <span className="text-3xl">{option.emoji || "•"}</span>
              <span className="text-sm font-medium text-foreground">{option.name}</span>
              {option.additional_price && option.additional_price > 0 && (
                <span className="text-xs text-primary">+R$ {option.additional_price.toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {group.options.map((option) => {
        const isSelected = selection?.[option.id] || false;
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {isSelected && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{option.name}</p>
              {option.description && (
                <p className="text-sm text-muted-foreground">{option.description}</p>
              )}
            </div>
            {option.additional_price && option.additional_price > 0 && (
              <span className="text-sm text-primary font-medium">
                +R$ {option.additional_price.toFixed(2)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Quantity Select Component (+/- buttons)
const QuantitySelectGroup = ({ 
  group, 
  selection, 
  onChange 
}: { 
  group: CombinationGroup; 
  selection: QuantitySelection | undefined; 
  onChange: (optionId: string, delta: number) => void;
}) => {
  return (
    <div className="space-y-3">
      {group.options.map((option) => {
        const quantity = selection?.[option.id] || 0;
        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              quantity > 0
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {option.emoji && `${option.emoji} `}{option.name}
              </p>
              {option.description && (
                <p className="text-sm text-muted-foreground">{option.description}</p>
              )}
              {option.additional_price && option.additional_price > 0 && (
                <p className="text-xs text-primary mt-1">+R$ {option.additional_price.toFixed(2)}/un</p>
              )}
            </div>
            
            {quantity === 0 ? (
              <button
                onClick={() => onChange(option.id, 1)}
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChange(option.id, -1)}
                  className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => onChange(option.id, 1)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomizeOrderPage;
