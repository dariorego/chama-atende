import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useWasteEntries,
  useCreateWaste,
  useDeleteWaste,
  WASTE_REASON_LABELS,
  type WasteReason,
} from "@/hooks/useWasteInventory";
import { useIngredients } from "@/hooks/useIngredients";
import { brl, num3 } from "@/lib/cmv";

export default function AdminWaste() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [range, setRange] = useState({ from: monthStart, to: today });
  const { data: entries = [], isLoading } = useWasteEntries(range.from, range.to);
  const { data: ingredients = [] } = useIngredients();
  const createWaste = useCreateWaste();
  const deleteWaste = useDeleteWaste();

  const [form, setForm] = useState({
    ingredient_id: "",
    quantity: "",
    reason: "ESTRAGOU" as WasteReason,
    entry_date: today,
    notes: "",
  });

  const total = useMemo(() => entries.reduce((s, e) => s + Number(e.total_value ?? 0), 0), [entries]);
  const byReason = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) map[e.reason] = (map[e.reason] ?? 0) + Number(e.total_value ?? 0);
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const handleCreate = async () => {
    const qty = Number(form.quantity.replace(",", "."));
    if (!form.ingredient_id || qty <= 0) {
      toast.error("Escolha o insumo e informe a quantidade");
      return;
    }
    try {
      await createWaste.mutateAsync({
        ingredient_id: form.ingredient_id,
        quantity: qty,
        reason: form.reason,
        entry_date: form.entry_date,
        notes: form.notes.trim() || null,
      });
      setForm({ ...form, ingredient_id: "", quantity: "", notes: "" });
      toast.success("Perda registrada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar perda");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Desperdício</h2>
        <p className="text-muted-foreground">Registro de perdas por insumo com valorização automática</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perda no período</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(total)}</CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription>Principais motivos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            {byReason.length === 0 && <span className="text-muted-foreground">Sem registros no período.</span>}
            {byReason.map(([reason, value]) => (
              <span key={reason} className="rounded-md border border-border px-2 py-1">
                {WASTE_REASON_LABELS[reason as WasteReason]}: <strong>{brl(value)}</strong>
              </span>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Registrar perda</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label className="text-xs">Insumo</Label>
            <Select value={form.ingredient_id} onValueChange={(v) => setForm({ ...form, ingredient_id: v })}>
              <SelectTrigger className="bg-surface">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Quantidade</Label>
            <Input
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0,500"
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div>
            <Label className="text-xs">Motivo</Label>
            <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v as WasteReason })}>
              <SelectTrigger className="bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WASTE_REASON_LABELS).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Data</Label>
            <Input
              type="date"
              value={form.entry_date}
              onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
              className="bg-surface"
            />
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs">Observação</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={createWaste.isPending} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Registrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Histórico</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="w-[150px] bg-surface"
            />
            <Input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="w-[150px] bg-surface"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Insumo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma perda registrada no período.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(`${e.entry_date}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{e.ingredients?.name ?? "—"}</TableCell>
                  <TableCell>{WASTE_REASON_LABELS[e.reason]}</TableCell>
                  <TableCell className="text-right">
                    {num3(e.quantity)} {e.ingredients?.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">{brl(e.total_value)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteWaste.mutate(e.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}