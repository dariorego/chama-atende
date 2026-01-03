import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminCombinationGroups } from "@/hooks/useAdminCombinationGroups";
import { useItemGroups, useLinkItemGroup, useUnlinkItemGroup, useUpdateItemGroup } from "@/hooks/useAdminItemGroups";
import type { OrderItem } from "@/hooks/useAdminOrderItems";

interface ItemGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItem: OrderItem;
  restaurantId?: string;
}

export function ItemGroupsDialog({ open, onOpenChange, orderItem, restaurantId }: ItemGroupsDialogProps) {
  const { data: allGroups, isLoading: loadingGroups } = useAdminCombinationGroups(restaurantId);
  const { data: linkedGroups, isLoading: loadingLinked } = useItemGroups(orderItem.id);
  const linkGroup = useLinkItemGroup();
  const unlinkGroup = useUnlinkItemGroup();
  const updateLink = useUpdateItemGroup();

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const linkedGroupIds = new Set(linkedGroups?.map((lg: any) => lg.combination_group_id) || []);
  const availableGroups = allGroups?.filter((g) => !linkedGroupIds.has(g.id)) || [];

  const handleLink = async () => {
    if (selectedGroupId) {
      await linkGroup.mutateAsync({
        orderItemId: orderItem.id,
        combinationGroupId: selectedGroupId,
      });
      setSelectedGroupId("");
    }
  };

  const handleUnlink = async (id: string) => {
    await unlinkGroup.mutateAsync(id);
  };

  const handleToggleRequired = async (id: string, currentValue: boolean) => {
    await updateLink.mutateAsync({ id, isRequired: !currentValue });
  };

  const isLoading = loadingGroups || loadingLinked;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Grupos de Combinação - {orderItem.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add new group */}
            {availableGroups.length > 0 && (
              <div className="flex gap-2">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1 bg-surface">
                    <SelectValue placeholder="Selecione um grupo para vincular..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLink}
                  disabled={!selectedGroupId || linkGroup.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Linked groups */}
            {linkedGroups?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Nenhum grupo vinculado</p>
                <p className="text-sm">
                  Vincule grupos de combinação para personalizar este item
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedGroups?.map((link: any) => {
                  const group = link.order_combination_groups;
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between bg-surface rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{group.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {group.selection_type === "single" && "Única"}
                            {group.selection_type === "multiple" && "Múltipla"}
                            {group.selection_type === "quantity" && "Quantidade"}
                          </Badge>
                        </div>
                        {group.max_selections && (
                          <p className="text-xs text-muted-foreground">
                            Máx: {group.max_selections} seleções
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`required-${link.id}`}
                            checked={link.is_required}
                            onCheckedChange={() => handleToggleRequired(link.id, link.is_required)}
                          />
                          <Label htmlFor={`required-${link.id}`} className="text-xs">
                            Obrigatório
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleUnlink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {allGroups?.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum grupo de combinação cadastrado. Crie grupos primeiro em "Combinações".
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
