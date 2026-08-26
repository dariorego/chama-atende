import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useIngredients } from "@/hooks/useIngredients";
import { today, useSaveShelfLifeItem, type ShelfLifeWithIngredient } from "@/hooks/useHygiene";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ShelfLifeWithIngredient | null;
};

const NONE = "__none__";

export function ShelfLifeFormDialog({ open, onOpenChange, item }: Props) {
  const { data: ingredients = [] } = useIngredients();
  const save = useSaveShelfLifeItem();
  const [form, setForm] = useState({
    product_name: "",
    ingredient_id: NONE,
    batch_code: "",
    opened_at: today(),
    expires_at: today(),
    storage_location: "",
    quantity: "",
    unit: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      product_name: item?.product_name ?? "",
      ingredient_id: item?.ingredient_id ?? NONE,
      batch_code: item?.batch_code ?? "",
      opened_at: item?.opened_at ?? today(),
      expires_at: item?.expires_at ?? today(),
      storage_location: item?.storage_location ?? "",
      quantity: item?.quantity === null || item?.quantity === undefined ? "" : String(item.quantity),
      unit: item?.unit ?? "",
    });
  }, [open, item]);

  const handleSubmit = async () => {
    if (!form.product_name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    if (form.expires_at < form.opened_at) {
      toast.error("A validade não pode ser anterior à data de manipulação");
      return;
    }
    try {
      await save.mutateAsync({
        id: item?.id,
        product_name: form.product_name.trim(),
        ingredient_id: form.ingredient_id === NONE ? null : form.ingredient_id,
        batch_code: form.batch_code.trim() || null,
        opened_at: form.opened_at,
        expires_at: form.expires_at,
        storage_location: form.storage_location.trim() || null,
        quantity: form.quantity === "" ? null : Number(form.quantity.replace(",", ".")),
        unit: form.unit.trim() || null,
      });
      toast.success("Registro salvo");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar registro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar validade" : "Novo controle de validade"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-xs">Produto</Label>
            <Input
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              placeholder="Ex.: Molho de tomate manipulado"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Insumo vinculado (opcional)</Label>
            <Select value={form.ingredient_id} onValueChange={(v) => setForm({ ...form, ingredient_id: v })}>
              <SelectTrigger className="bg-surface">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhum</SelectItem>
                {ingredients.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Lote</Label>
            <Input
              value={form.batch_code}
              onChange={(e) => setForm({ ...form, batch_code: e.target.value })}
              placeholder="L-001"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div>
            <Label className="text-xs">Armazenamento</Label>
            <Input
              value={form.storage_location}
              onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
              placeholder="Câmara fria 1"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div>
            <Label className="text-xs">Manipulado em</Label>
            <Input
              type="date"
              value={form.opened_at}
              onChange={(e) => setForm({ ...form, opened_at: e.target.value })}
              className="bg-surface"
            />
          </div>
          <div>
            <Label className="text-xs">Validade</Label>
            <Input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="bg-surface"
            />
          </div>
          <div>
            <Label className="text-xs">Quantidade</Label>
            <Input
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="2,5"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div>
            <Label className="text-xs">Unidade</Label>
            <Input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="KG"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={save.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
