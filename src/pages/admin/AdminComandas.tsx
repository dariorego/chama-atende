import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Plus, Clock, User, Printer, X, FileText, Loader2 } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useAdminTables } from "@/hooks/useAdminTables";
import { useAdminWaiters } from "@/hooks/useAdminWaiters";
import {
  Comanda,
  useCloseComanda,
  useComandaItems,
  useComandas,
  useOpenComanda,
  useUpdateComanda,
} from "@/hooks/useComandas";

const STATUS_LABEL: Record<Comanda["status"], string> = {
  open: "Aberta",
  bill_requested: "Conta pedida",
  closed: "Encerrada",
  cancelled: "Cancelada",
};

const STATUS_VARIANT: Record<Comanda["status"], "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  bill_requested: "secondary",
  closed: "outline",
  cancelled: "destructive",
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatElapsed(from: string) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 1000));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

export default function AdminComandas() {
  const { tenantId, tenant } = useTenant();
  const [status, setStatus] = useState<string>("open");
  const [openDialog, setOpenDialog] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const { data: comandas, isLoading } = useComandas({ restaurantId: tenantId ?? undefined, status });
  const { data: tables } = useAdminTables();
  const { data: waiters } = useAdminWaiters();

  const openMutation = useOpenComanda();
  const closeMutation = useCloseComanda();
  const updateMutation = useUpdateComanda();

  // group by table_id
  const grouped = useMemo(() => {
    const map = new Map<string, Comanda[]>();
    (comandas ?? []).forEach((c) => {
      const key = c.table_id ?? "__none__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries());
  }, [comandas]);

  const [form, setForm] = useState({
    tableId: "",
    customerName: "",
    waiterId: "none",
    notes: "",
  });

  const resetForm = () => setForm({ tableId: "", customerName: "", waiterId: "none", notes: "" });

  const submitOpen = () => {
    if (!tenantId) return;
    openMutation.mutate(
      {
        restaurantId: tenantId,
        tableId: form.tableId || null,
        customerName: form.customerName || null,
        waiterId: form.waiterId === "none" ? null : form.waiterId,
        notes: form.notes || null,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          resetForm();
        },
      },
    );
  };

  const requestBill = (c: Comanda) =>
    updateMutation.mutate({
      id: c.id,
      status: "bill_requested",
      bill_requested_at: new Date().toISOString(),
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Comandas
          </h2>
          <p className="text-muted-foreground">
            Várias comandas por mesa. Cada uma recebe um código único (ex.: 10.01, 10.02).
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova comanda
        </Button>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="open">Abertas</TabsTrigger>
          <TabsTrigger value="bill_requested">Conta pedida</TabsTrigger>
          <TabsTrigger value="closed">Encerradas</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhuma comanda encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {grouped.map(([tableKey, list]) => {
            const tableInfo = list[0].tables;
            const label = tableKey === "__none__"
              ? "Sem mesa (balcão / avulsas)"
              : `Mesa ${tableInfo?.number ?? "?"}${tableInfo?.name ? ` — ${tableInfo.name}` : ""}`;
            const total = list.reduce((sum, c) => sum + Number(c.total_amount || 0), 0);
            return (
              <Card key={tableKey}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{label}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {list.length} comanda{list.length > 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-border bg-surface p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-semibold">{c.code}</span>
                        <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                      </div>
                      {c.customer_name && (
                        <div className="text-sm flex items-center gap-1">
                          <User className="h-3 w-3" /> {c.customer_name}
                        </div>
                      )}
                      {c.waiters?.name && (
                        <div className="text-xs text-muted-foreground">Garçom: {c.waiters.name}</div>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatElapsed(c.opened_at)}
                      </div>
                      <div className="font-semibold">{formatCurrency(Number(c.total_amount || 0))}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <Button size="sm" variant="outline" onClick={() => setDetailsId(c.id)}>
                          <FileText className="h-3 w-3 mr-1" /> Itens
                        </Button>
                        {c.status === "open" && (
                          <Button size="sm" variant="secondary" onClick={() => requestBill(c)}>
                            <Receipt className="h-3 w-3 mr-1" /> Pedir conta
                          </Button>
                        )}
                        {c.status !== "closed" && c.status !== "cancelled" && (
                          <Button
                            size="sm"
                            onClick={() => closeMutation.mutate(c.id)}
                            disabled={closeMutation.isPending}
                          >
                            <X className="h-3 w-3 mr-1" /> Encerrar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New comanda dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova comanda</DialogTitle>
            <DialogDescription>
              Escolha a mesa. Uma mesma mesa pode ter várias comandas simultâneas (10.01, 10.02...).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Mesa</Label>
              <Select value={form.tableId} onValueChange={(v) => setForm({ ...form, tableId: v })}>
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Selecione a mesa" />
                </SelectTrigger>
                <SelectContent>
                  {(tables ?? [])
                    .filter((t) => t.is_active)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Mesa {t.number}
                        {t.name ? ` — ${t.name}` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Nome do cliente (opcional)</Label>
              <Input
                className="bg-surface placeholder:text-surface-foreground"
                placeholder="Ex.: João"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Garçom (opcional)</Label>
              <Select value={form.waiterId} onValueChange={(v) => setForm({ ...form, waiterId: v })}>
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(waiters ?? [])
                    .filter((w) => w.is_active)
                    .map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                className="bg-surface placeholder:text-surface-foreground"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={submitOpen} disabled={!form.tableId || openMutation.isPending}>
              Abrir comanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComandaDetailsDialog
        comandaId={detailsId}
        comanda={comandas?.find((c) => c.id === detailsId) ?? null}
        restaurantName={tenant?.name ?? ""}
        onClose={() => setDetailsId(null)}
      />
    </div>
  );
}

function ComandaDetailsDialog({
  comandaId,
  comanda,
  restaurantName,
  onClose,
}: {
  comandaId: string | null;
  comanda: Comanda | null;
  restaurantName: string;
  onClose: () => void;
}) {
  const { data: items, isLoading } = useComandaItems(comandaId ?? undefined);

  const handlePrint = () => {
    if (!comanda) return;
    const rows =
      (items ?? [])
        .map((it) => {
          const extras = it.selections
            .map((s) => `  + ${s.quantity}x ${s.option_name} (${formatCurrency(s.additional_price)})`)
            .join("\n");
          return `${it.quantity}x ${it.item_name} — ${formatCurrency(it.unit_price * it.quantity)}${
            extras ? "\n" + extras : ""
          }${it.observations ? "\n  obs: " + it.observations : ""}`;
        })
        .join("\n\n") || "Sem itens.";

    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Comanda ${comanda.code}</title>
      <style>
        body { font-family: monospace; padding: 16px; }
        h1 { font-size: 16px; text-align:center; margin: 0 0 4px; }
        .code { text-align:center; font-size: 22px; font-weight: bold; margin-bottom: 12px; }
        .row { white-space: pre-wrap; font-size: 12px; }
        hr { border: none; border-top: 1px dashed #000; margin: 12px 0; }
        .total { text-align:right; font-size: 14px; font-weight: bold; }
      </style></head><body>
      <h1>${restaurantName}</h1>
      <div class="code">Comanda ${comanda.code}</div>
      ${comanda.customer_name ? `<div>Cliente: ${comanda.customer_name}</div>` : ""}
      ${comanda.tables ? `<div>Mesa ${comanda.tables.number}${comanda.tables.name ? " — " + comanda.tables.name : ""}</div>` : ""}
      <hr />
      <div class="row">${rows.replace(/</g, "&lt;")}</div>
      <hr />
      <div class="total">TOTAL: ${formatCurrency(Number(comanda.total_amount || 0))}</div>
      <script>window.onload = () => window.print();</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Dialog open={!!comandaId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comanda {comanda?.code}</DialogTitle>
          <DialogDescription>
            {comanda?.customer_name ? `Cliente: ${comanda.customer_name}` : "Detalhes dos itens"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !items || items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum item lançado nesta comanda ainda.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3">
            {items.map((it) => (
              <div key={it.id} className="border-b border-border pb-2">
                <div className="flex justify-between font-medium">
                  <span>
                    {it.quantity}x {it.item_name}
                  </span>
                  <span>{formatCurrency(it.unit_price * it.quantity)}</span>
                </div>
                {it.selections.map((s) => (
                  <div key={s.id} className="text-xs text-muted-foreground pl-3">
                    + {s.quantity}x {s.option_name}
                    {s.additional_price > 0 && ` (${formatCurrency(s.additional_price)})`}
                  </div>
                ))}
                {it.observations && (
                  <div className="text-xs italic text-muted-foreground pl-3">obs: {it.observations}</div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold">
            {formatCurrency(Number(comanda?.total_amount || 0))}
          </span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}