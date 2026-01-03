import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { CombinationOption } from "@/hooks/useAdminCombinationGroups";

interface CombinationOptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option?: CombinationOption | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    emoji?: string;
    additional_price?: number;
    is_active?: boolean;
  }) => void;
  isLoading?: boolean;
}

export function CombinationOptionFormDialog({
  open,
  onOpenChange,
  option,
  onSubmit,
  isLoading,
}: CombinationOptionFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [additionalPrice, setAdditionalPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (option) {
      setName(option.name);
      setDescription(option.description || "");
      setEmoji(option.emoji || "");
      setAdditionalPrice(option.additional_price?.toString() || "");
      setIsActive(option.is_active);
    } else {
      setName("");
      setDescription("");
      setEmoji("");
      setAdditionalPrice("");
      setIsActive(true);
    }
  }, [option, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      emoji: emoji || undefined,
      additional_price: additionalPrice ? parseFloat(additionalPrice) : 0,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{option ? "Editar Opção" : "Nova Opção"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_80px] gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mozzarella"
                required
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🧀"
                maxLength={4}
                className="bg-surface placeholder:text-surface-foreground text-center text-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da opção..."
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço Adicional (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={additionalPrice}
              onChange={(e) => setAdditionalPrice(e.target.value)}
              placeholder="0.00"
              className="bg-surface placeholder:text-surface-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco ou 0 se não houver custo adicional
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Ativo</Label>
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
