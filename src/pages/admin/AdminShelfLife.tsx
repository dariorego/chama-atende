import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ShelfLifeFormDialog } from "@/components/admin/ShelfLifeFormDialog";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  SHELF_STATUS_LABELS,
  daysUntil,
  shelfSeverity,
  useDeleteShelfLifeItem,
  useShelfLifeItems,
  useUpdateShelfStatus,
  type HygieneShelfStatus,
  type ShelfLifeWithIngredient,
} from "@/hooks/useHygiene";

export default function AdminShelfLife() {
  const [statusFilter, setStatusFilter] = useState<HygieneShelfStatus | "ALL">("ATIVO");
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useShelfLifeItems(statusFilter);
  const updateStatus = useUpdateShelfStatus();
  const remove = useDeleteShelfLifeItem();
  const [dialog, setDialog] = useState<{ open: boolean; item: ShelfLifeWithIngredient | null }>({
    open: false,
    item: null,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (i) =>
        i.product_name.toLowerCase().includes(term) ||
        (i.batch_code ?? "").toLowerCase().includes(term) ||
        (i.storage_location ?? "").toLowerCase().includes(term),
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.status === "ATIVO");
    return {
      active: active.length,
      expired: active.filter((i) => shelfSeverity(i.expires_at) === "expired").length,
      warning: active.filter((i) => shelfSeverity(i.expires_at) === "warning").length,
    };
  }, [items]);

  const discard = async (item: ShelfLifeWithIngredient) => {
    const reason = window.prompt("Motivo do descarte:", "Vencimento");
    if (reason === null) return;
    try {
      await updateStatus.mutateAsync({ id: item.id, status: "DESCARTADO", discarded_reason: reason || null });
      toast.success("Item marcado como descartado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao descartar");
    }
  };

  const exportCSV = () => {
    downloadCSV(
      "controle-validade.csv",
      toCSV(
        ["Produto", "Lote", "Manipulado", "Validade", "Dias", "Armazenamento", "Quantidade", "Unidade", "Status"],
        filtered.map((i) => [
          i.product_name,
          i.batch_code ?? "",
          i.opened_at,
          i.expires_at,
          daysUntil(i.expires_at),
          i.storage_location ?? "",
          i.quantity ?? "",
          i.unit ?? "",
          SHELF_STATUS_LABELS[i.status as HygieneShelfStatus],
        ]),
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Controle de Validade</h2>
          <p className="text-muted-foreground">
            Produtos manipulados e abertos com semáforo de vencimento e registro de descarte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button className="gap-2" onClick={() => setDialog({ open: true, item: null })}>
            <Plus className="h-4 w-4" /> Novo registro
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ativos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.active}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vencendo em até 2 dias</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-500">{stats.warning}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vencidos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">{stats.expired}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Label className="text-xs">Buscar</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Produto, lote ou local"
            className="bg-surface placeholder:text-surface-foreground"
          />
        </div>
        <div className="w-44">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as HygieneShelfStatus | "ALL")}>
            <SelectTrigger className="bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {(Object.keys(SHELF_STATUS_LABELS) as HygieneShelfStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SHELF_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Manipulado</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((i) => {
                const sev = shelfSeverity(i.expires_at);
                const days = daysUntil(i.expires_at);
                return (
                  <TableRow key={i.id}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            i.status !== "ATIVO"
                              ? "bg-muted-foreground"
                              : sev === "expired"
                                ? "bg-destructive"
                                : sev === "warning"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                          }`}
                        />
                        {i.product_name}
                      </span>
                    </TableCell>
                    <TableCell>{i.batch_code ?? "-"}</TableCell>
                    <TableCell>{new Date(i.opened_at + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      {new Date(i.expires_at + "T00:00:00").toLocaleDateString("pt-BR")}
                      {i.status === "ATIVO" && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({days < 0 ? `${Math.abs(days)}d atrás` : `${days}d`})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{i.storage_location ?? "-"}</TableCell>
                    <TableCell>
                      {i.quantity ?? "-"} {i.unit ?? ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={i.status === "ATIVO" ? "default" : "secondary"}>
                        {SHELF_STATUS_LABELS[i.status as HygieneShelfStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {i.status === "ATIVO" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => discard(i)}>
                              Descartar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus.mutate({ id: i.id, status: "CONSUMIDO" })}
                            >
                              Consumido
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDialog({ open: true, item: i })}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => remove.mutate(i.id)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ShelfLifeFormDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ open, item: open ? prev.item : null }))}
        item={dialog.item}
      />
    </div>
  );
}
