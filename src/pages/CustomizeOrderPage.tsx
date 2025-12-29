import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HelpCircle, Plus, Minus, Check, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const baseNames: Record<string, string> = {
  tapioca: "Tapioca",
  crepioca: "Crepioca",
  omelete: "Omelete",
  waffle: "Waffle",
};

const cheeseOptions = [
  { id: "mozzarella", name: "Mozzarella", description: "Leite de búfala fresco" },
  { id: "cheddar", name: "Cheddar Maturado", description: "Sabor intenso e encorpado" },
  { id: "feta", name: "Feta Grego", description: "Leve e salgado" },
  { id: "parmesao", name: "Parmesão", description: "Curado por 24 meses" },
];

const proteinOptions = [
  { id: "presunto", name: "Presunto Defumado", description: "Curado localmente" },
  { id: "bacon", name: "Bacon Crocante", description: "Defumado artesanal" },
  { id: "peru", name: "Peru Assado", description: "Temperado com ervas" },
  { id: "frango", name: "Frango Desfiado", description: "Grelhado na hora" },
];

const vegetableOptions = [
  { id: "espinafre", name: "Espinafre", emoji: "🥬" },
  { id: "cogumelos", name: "Cogumelos", emoji: "🍄" },
  { id: "tomate", name: "Tomate", emoji: "🍅" },
  { id: "cebola", name: "Cebola Roxa", emoji: "🧅" },
  { id: "pimentao", name: "Pimentão", emoji: "🫑" },
  { id: "rucula", name: "Rúcula", emoji: "🥗" },
];

const sauceOptions = [
  { id: "mostarda", name: "Mostarda Dijon", description: "Suave e aromática" },
  { id: "maionese", name: "Maionese Caseira", description: "Receita tradicional" },
  { id: "pesto", name: "Pesto de Manjericão", description: "Fresco e herbáceo" },
  { id: "chimichurri", name: "Chimichurri", description: "Picante e saboroso" },
];

const CustomizeOrderPage = () => {
  const navigate = useNavigate();
  const { baseId } = useParams<{ baseId: string }>();
  
  const [activeTab, setActiveTab] = useState("queijos");
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>([]);
  const [proteinQuantities, setProteinQuantities] = useState<Record<string, number>>({});
  const [selectedVegetables, setSelectedVegetables] = useState<string[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [chefNotes, setChefNotes] = useState("");

  const baseName = baseNames[baseId || ""] || "Prato";

  const handleBack = () => {
    navigate("/pedido-cozinha");
  };

  const handleCheeseToggle = (cheeseId: string) => {
    setSelectedCheeses((prev) => {
      if (prev.includes(cheeseId)) {
        return prev.filter((id) => id !== cheeseId);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, cheeseId];
    });
  };

  const handleProteinQuantity = (proteinId: string, delta: number) => {
    setProteinQuantities((prev) => {
      const current = prev[proteinId] || 0;
      const newValue = Math.max(0, Math.min(5, current + delta));
      if (newValue === 0) {
        const { [proteinId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [proteinId]: newValue };
    });
  };

  const handleVegetableToggle = (vegetableId: string) => {
    setSelectedVegetables((prev) => {
      if (prev.includes(vegetableId)) {
        return prev.filter((id) => id !== vegetableId);
      }
      return [...prev, vegetableId];
    });
  };

  const handleSauceToggle = (sauceId: string) => {
    setSelectedSauces((prev) => {
      if (prev.includes(sauceId)) {
        return prev.filter((id) => id !== sauceId);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, sauceId];
    });
  };

  const handleConfirm = () => {
    // TODO: Navigate to step 3 (review)
    console.log({
      base: baseId,
      cheeses: selectedCheeses,
      proteins: proteinQuantities,
      vegetables: selectedVegetables,
      sauces: selectedSauces,
      notes: chefNotes,
    });
  };

  const totalSelections = 
    selectedCheeses.length + 
    Object.values(proteinQuantities).reduce((a, b) => a + b, 0) + 
    selectedVegetables.length + 
    selectedSauces.length;

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
            Personalizar {baseName}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="sticky top-[73px] z-40 w-full justify-start gap-2 px-4 py-2 bg-background border-b border-border rounded-none h-auto">
          <TabsTrigger 
            value="queijos" 
            className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Queijos
          </TabsTrigger>
          <TabsTrigger 
            value="proteinas"
            className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Proteínas
          </TabsTrigger>
          <TabsTrigger 
            value="vegetais"
            className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Vegetais
          </TabsTrigger>
          <TabsTrigger 
            value="molhos"
            className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Molhos
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Queijos */}
          <TabsContent value="queijos" className="mt-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Escolha seus queijos</h2>
              <Badge variant="secondary" className="text-xs">
                Máx. 2
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecionados: {selectedCheeses.length}/2
            </p>
            
            <div className="space-y-3">
              {cheeseOptions.map((cheese) => (
                <button
                  key={cheese.id}
                  onClick={() => handleCheeseToggle(cheese.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    selectedCheeses.includes(cheese.id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                      selectedCheeses.includes(cheese.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedCheeses.includes(cheese.id) && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{cheese.name}</p>
                    <p className="text-sm text-muted-foreground">{cheese.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Proteínas */}
          <TabsContent value="proteinas" className="mt-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Adicione proteínas</h2>
              <Badge variant="secondary" className="text-xs">
                Opcional
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Use os botões para adicionar quantidades
            </p>
            
            <div className="space-y-3">
              {proteinOptions.map((protein) => {
                const quantity = proteinQuantities[protein.id] || 0;
                return (
                  <div
                    key={protein.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      quantity > 0
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{protein.name}</p>
                      <p className="text-sm text-muted-foreground">{protein.description}</p>
                    </div>
                    
                    {quantity === 0 ? (
                      <button
                        onClick={() => handleProteinQuantity(protein.id, 1)}
                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleProteinQuantity(protein.id, -1)}
                          className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-foreground">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleProteinQuantity(protein.id, 1)}
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
          </TabsContent>

          {/* Vegetais */}
          <TabsContent value="vegetais" className="mt-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Escolha seus vegetais</h2>
              <Badge variant="secondary" className="text-xs">
                Ilimitado
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Toque para selecionar
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {vegetableOptions.map((vegetable) => (
                <button
                  key={vegetable.id}
                  onClick={() => handleVegetableToggle(vegetable.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all relative",
                    selectedVegetables.includes(vegetable.id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  {selectedVegetables.includes(vegetable.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-3xl">{vegetable.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{vegetable.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Molhos */}
          <TabsContent value="molhos" className="mt-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Escolha seus molhos</h2>
              <Badge variant="secondary" className="text-xs">
                Máx. 2
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecionados: {selectedSauces.length}/2
            </p>
            
            <div className="space-y-3">
              {sauceOptions.map((sauce) => (
                <button
                  key={sauce.id}
                  onClick={() => handleSauceToggle(sauce.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    selectedSauces.includes(sauce.id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedSauces.includes(sauce.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedSauces.includes(sauce.id) && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{sauce.name}</p>
                    <p className="text-sm text-muted-foreground">{sauce.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Chef's Notes */}
          <div className="p-4 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Observações do Chef</h2>
            <Textarea
              placeholder="Ex: Bem passado, sem sal, extra crocante..."
              value={chefNotes}
              onChange={(e) => setChefNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </Tabs>

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

export default CustomizeOrderPage;
