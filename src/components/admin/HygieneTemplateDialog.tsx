import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ITEM_TYPE_LABELS,
  SHIFTS,
  SHIFT_LABELS,
  useDeleteChecklistItem,
  useSaveChecklist,
  useSaveChecklistItem,
  type HygieneChecklist,
  type HygieneChecklistItem,
  type HygieneItemType,
  type HygieneShift,
} from "@/hooks/useHygiene";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: (HygieneChecklist & { hygiene_checklist_items: HygieneChecklistItem[] }) | null;
};

const emptyItem = {
  label: "",
  item_type: "CONFORMIDADE" as HygieneItemType,
  unit: "",
  min_value: "",
  max_value: "",
  is_required: true,
};

export function HygieneTemplateDialog({ open, onOpenChange, checklist }: Props) {
  const saveChecklist = useSaveChecklist();
  const saveItem = useSaveChecklistItem();
  const deleteItem = useDeleteChecklistItem();

  const [form, setForm] = useState({
    name: "",
    shift: "MANHA" as HygieneShift,
    description: "",
    is_active: true,
  });
  const [newItem, setNewItem] = useState(emptyItem);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: checklist?.name ?? "",
      shift: (checklist?.shift as HygieneShift) ?? "MANHA",
      description: checklist?.description ?? "",
      is_active: checklist?.is_active ?? true,
    });
    setNewItem(emptyItem);
  }, [open, checklist]);

  const items = checklist?.hygiene_checklist_items ?? [];

  const handleSaveChecklist = async () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do checklist");
      return;
    }
    try {
      await saveChecklist.mutateAsync({
        id: checklist?.id,
        name: form.name.trim(),
        shift: form.shift,
        description: form.description.trim() || null,
        is_active: form.is_active,
      });
      toast.success("Modelo salvo");
      if (!checklist) onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar modelo");
    }
  };

  const handleAddItem = async () => {
    if (!checklist) {
      toast.error("Salve o modelo antes de adicionar itens");
      return;
    }
    if (!newItem.label.trim()) {
      toast.error("Descreva o item");
      return;
    }
    const min = newItem.min_value === "" ? null : Number(newItem.min_value.replace(",", "."));
    const max = newItem.max_value === "" ? null : Number(newItem.max_value.replace(",", "."));
    if (min !== null && max !== null && min > max) {
      toast.error("Faixa inválida: mínimo maior que o máximo");
      return;
    }
    try {
      await saveItem.mutateAsync({
        checklist_id: checklist.id,
        label: newItem.label.trim(),
        item_type: newItem.item_type,
        unit: newItem.unit.trim() || null,
        min_value: newItem.item_type === "NUMERICO" ? min : null,
        max_value: newItem.item_type === "NUMERICO" ? max : null,
        is_required: newItem.is_required,
        position: items.length,
      });
      setNewItem(emptyItem);
      toast.success("Item adicionado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{checklist ? "Editar modelo de checklist" : "Novo modelo de checklist"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-xs">Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Higienização - Abertura"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div>
            <Label className="text-xs">Turno</Label>
            <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v as HygieneShift })}>
              <SelectTrigger className="bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SHIFT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <span className="text-sm">Ativo</span>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instruções gerais, referência ANVISA (RDC 216), etc."
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
        </div>

        {checklist && (
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-semibold">Itens do checklist ({items.length})</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border bg-surface p-2"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {item.label}
                      {item.is_required && <span className="text-destructive"> *</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ITEM_TYPE_LABELS[item.item_type as HygieneItemType]}
                      {item.item_type === "NUMERICO" && (
                        <>
                          {" · "}
                          {item.min_value ?? "-"} a {item.max_value ?? "-"} {item.unit ?? ""}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteItem.mutate(item.id)}
                    aria-label="Excluir item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item cadastrado ainda.</p>
              )}
            </div>

            <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label className="text-xs">Item</Label>
                <Input
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="Ex.: Temperatura do freezer"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={newItem.item_type}
                  onValueChange={(v) => setNewItem({ ...newItem, item_type: v as HygieneItemType })}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ITEM_TYPE_LABELS) as HygieneItemType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {ITEM_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newItem.item_type === "NUMERICO" && (
                <>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Mínimo</Label>
                    <Input
                      value={newItem.min_value}
                      onChange={(e) => setNewItem({ ...newItem, min_value: e.target.value })}
                      placeholder="-18"
                      className="bg-surface placeholder:text-surface-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Máximo</Label>
                    <Input
                      value={newItem.max_value}
                      onChange={(e) => setNewItem({ ...newItem, max_value: e.target.value })}
                      placeholder="-12"
                      className="bg-surface placeholder:text-surface-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Unidade</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="°C"
                      className="bg-surface placeholder:text-surface-foreground"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 sm:col-span-3">
                <Switch
                  checked={newItem.is_required}
                  onCheckedChange={(v) => setNewItem({ ...newItem, is_required: v })}
                />
                <span className="text-sm">Obrigatório</span>
              </div>
              <div className="sm:col-span-3 flex items-end justify-end">
                <Button onClick={handleAddItem} disabled={saveItem.isPending} className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar item
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleSaveChecklist} disabled={saveChecklist.isPending}>
            Salvar modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
