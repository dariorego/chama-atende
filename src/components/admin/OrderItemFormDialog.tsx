import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderItem, OrderItemTag } from "@/hooks/useAdminOrderItems";

interface OrderItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: OrderItem | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    image_url?: string;
    price?: number;
    tags?: OrderItemTag[];
    is_active?: boolean;
  }) => void;
  isLoading?: boolean;
}

const TAG_TYPES = [
  { value: "positive", label: "Positivo", className: "bg-primary/20 text-primary" },
  { value: "neutral", label: "Neutro", className: "bg-blue-400/20 text-blue-300" },
  { value: "warning", label: "Alerta", className: "bg-orange-400/20 text-orange-300" },
];

export function OrderItemFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: OrderItemFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState<OrderItemTag[]>([]);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagType, setNewTagType] = useState<"positive" | "neutral" | "warning">("positive");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || "");
      setImageUrl(item.image_url || "");
      setPrice(item.price?.toString() || "");
      setIsActive(item.is_active);
      setTags(item.tags || []);
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
      setPrice("");
      setIsActive(true);
      setTags([]);
    }
  }, [item, open]);

  const handleAddTag = () => {
    if (newTagLabel.trim()) {
      setTags([...tags, { label: newTagLabel.trim(), type: newTagType }]);
      setNewTagLabel("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      image_url: imageUrl || undefined,
      price: price ? parseFloat(price) : undefined,
      tags,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item" : "Novo Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tapioca"
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
              placeholder="Descrição do item..."
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço Base (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={TAG_TYPES.find((t) => t.value === tag.type)?.className}
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder="Nova tag..."
                className="flex-1 bg-surface placeholder:text-surface-foreground"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Select value={newTagType} onValueChange={(v) => setNewTagType(v as any)}>
                <SelectTrigger className="w-28 bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="icon" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
