import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CombinationGroup } from "@/hooks/useAdminCombinationGroups";

interface CombinationGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: CombinationGroup | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    selection_type?: "single" | "multiple" | "quantity";
    min_selections?: number;
    max_selections?: number | null;
    is_required?: boolean;
    is_active?: boolean;
  }) => void;
  isLoading?: boolean;
}

export function CombinationGroupFormDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
  isLoading,
}: CombinationGroupFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectionType, setSelectionType] = useState<"single" | "multiple" | "quantity">("multiple");
  const [minSelections, setMinSelections] = useState("");
  const [maxSelections, setMaxSelections] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setSelectionType(group.selection_type);
      setMinSelections(group.min_selections?.toString() || "0");
      setMaxSelections(group.max_selections?.toString() || "");
      setIsRequired(group.is_required);
      setIsActive(group.is_active);
    } else {
      setName("");
      setDescription("");
      setSelectionType("multiple");
      setMinSelections("0");
      setMaxSelections("");
      setIsRequired(false);
      setIsActive(true);
    }
  }, [group, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      selection_type: selectionType,
      min_selections: parseInt(minSelections) || 0,
      max_selections: maxSelections ? parseInt(maxSelections) : null,
      is_required: isRequired,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Queijos"
              required
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do grupo..."
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Seleção</Label>
            <Select value={selectionType} onValueChange={(v) => setSelectionType(v as any)}>
              <SelectTrigger className="bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Única (Radio)</SelectItem>
                <SelectItem value="multiple">Múltipla (Checkbox)</SelectItem>
                <SelectItem value="quantity">Quantidade (+/-)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectionType === "single" && "O cliente escolhe apenas uma opção"}
              {selectionType === "multiple" && "O cliente pode escolher várias opções"}
              {selectionType === "quantity" && "O cliente define a quantidade de cada opção"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min">Mínimo de seleções</Label>
              <Input
                id="min"
                type="number"
                min="0"
                value={minSelections}
                onChange={(e) => setMinSelections(e.target.value)}
                className="bg-surface"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Máximo de seleções</Label>
              <Input
                id="max"
                type="number"
                min="0"
                value={maxSelections}
                onChange={(e) => setMaxSelections(e.target.value)}
                placeholder="Ilimitado"
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="isRequired" checked={isRequired} onCheckedChange={setIsRequired} />
              <Label htmlFor="isRequired">Obrigatório</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
