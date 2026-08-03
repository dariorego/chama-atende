import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Percent, DollarSign, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponStatus,
  Coupon,
  CouponType,
  CouponApplyTo,
  CouponStatus,
} from "@/hooks/useAdminCoupons";

const applyToLabels: Record<CouponApplyTo, string> = {
  all: "Todos os pedidos",
  category: "Categoria",
  product: "Produto",
  customer: "Cliente",
};

const emptyForm = {
  code: "",
  description: "",
  type: "percentage" as CouponType,
  value: "",
  max_discount_value: "",
  min_order_value: "",
  usage_limit: "",
  usage_limit_per_customer: "",
  apply_to: "all" as CouponApplyTo,
  target_ids: "" as string,
  auto_apply: false,
  is_first_order_only: false,
  status: "active" as CouponStatus,
  valid_from: "",
  valid_until: "",
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

const AdminCoupons = () => {
  const { data: coupons, isLoading } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleStatus = useToggleCouponStatus();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filteredCoupons = useMemo(() => {
    if (!coupons) return [];
    const term = search.trim().toLowerCase();
    if (!term) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(term));
  }, [coupons, search]);

  const handleCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: String(coupon.value ?? ""),
      max_discount_value: coupon.max_discount_value != null ? String(coupon.max_discount_value) : "",
      min_order_value: String(coupon.min_order_value ?? ""),
      usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : "",
      usage_limit_per_customer: coupon.usage_limit_per_customer != null ? String(coupon.usage_limit_per_customer) : "",
      apply_to: coupon.apply_to,
      target_ids: coupon.target_ids ? coupon.target_ids.join(", ") : "",
      auto_apply: coupon.auto_apply,
      is_first_order_only: coupon.is_first_order_only,
      status: coupon.status,
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : "",
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const targetIds = form.target_ids
      ? form.target_ids.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value) || 0,
      max_discount_value: form.max_discount_value ? Number(form.max_discount_value) : null,
      min_order_value: Number(form.min_order_value) || 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      usage_limit_per_customer: form.usage_limit_per_customer ? Number(form.usage_limit_per_customer) : null,
      apply_to: form.apply_to,
      target_ids: form.apply_to === "all" ? null : targetIds.length > 0 ? targetIds : null,
      auto_apply: form.auto_apply,
      is_first_order_only: form.is_first_order_only,
      status: form.status,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
    };

    if (editingCoupon) {
      updateCoupon.mutate(
        { id: editingCoupon.id, ...payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCoupon.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cupons e Promoções</h1>
          <p className="text-muted-foreground">Gerencie os cupons de desconto do estabelecimento</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" /> Cupons
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Aplica-se a</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum cupom encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {coupon.type === "percentage" ? (
                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : formatCurrency(coupon.value)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {coupon.usage_count}
                        {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{applyToLabels[coupon.apply_to]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.status === "active"}
                          onCheckedChange={(checked) =>
                            toggleStatus.mutate({ id: coupon.id, status: checked ? "active" : "inactive" })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir cupom</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o cupom "{coupon.code}"? Esta ação
                                  não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCoupon.mutate(coupon.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ex: PROMO10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de desconto</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as CouponType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor do desconto</Label>
                <Input
                  id="value"
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === "percentage" ? "10" : "15.00"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount_value">Desconto máximo (R$)</Label>
                <Input
                  id="max_discount_value"
                  type="number"
                  value={form.max_discount_value}
                  onChange={(e) => setForm({ ...form, max_discount_value: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order_value">Pedido mínimo (R$)</Label>
                <Input
                  id="min_order_value"
                  type="number"
                  value={form.min_order_value}
                  onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite total de usos</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit_per_customer">Limite por cliente</Label>
                <Input
                  id="usage_limit_per_customer"
                  type="number"
                  value={form.usage_limit_per_customer}
                  onChange={(e) => setForm({ ...form, usage_limit_per_customer: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apply_to">Aplicar a</Label>
                <Select
                  value={form.apply_to}
                  onValueChange={(v) => setForm({ ...form, apply_to: v as CouponApplyTo })}
                >
                  <SelectTrigger id="apply_to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os pedidos</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                    <SelectItem value="product">Produto</SelectItem>
                    <SelectItem value="customer">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_ids">IDs de alvo (separados por vírgula)</Label>
                <Input
                  id="target_ids"
                  value={form.target_ids}
                  onChange={(e) => setForm({ ...form, target_ids: e.target.value })}
                  placeholder={form.apply_to === "all" ? "Não aplicável" : "uuid1, uuid2..."}
                  disabled={form.apply_to === "all"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Válido de</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={form.valid_from}
                  onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Válido até</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Regras e observações do cupom"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto_apply"
                  checked={form.auto_apply}
                  onCheckedChange={(v) => setForm({ ...form, auto_apply: v })}
                />
                <Label htmlFor="auto_apply" className="cursor-pointer">Aplicar automaticamente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_first_order_only"
                  checked={form.is_first_order_only}
                  onCheckedChange={(v) => setForm({ ...form, is_first_order_only: v })}
                />
                <Label htmlFor="is_first_order_only" className="cursor-pointer">Apenas 1º pedido</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!form.code || !form.value}>
              {editingCoupon ? "Salvar alterações" : "Criar cupom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
