import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, History, Search, Package } from "lucide-react";
import { toast } from "sonner";
import {
  useIngredients,
  useIngredientCategories,
  useSaveIngredientCategory,
  useSuppliers,
  useSaveIngredient,
  useDeleteIngredient,
  useIngredientQuotes,
  useCreateQuote,
  useIngredientUsage,
  type Ingredient,
} from "@/hooks/useIngredients";
import { brl, normalize, num3 } from "@/lib/cmv";

type Unit = "KG" | "LT" | "UN";

const emptyForm = {
  name: "",
  code: "",
  brand: "",
  unit: "KG" as Unit,
  type: "COMPRADO" as "COMPRADO" | "PREPARACAO",
  category_id: "",
  supplier_id: "",
  package_price: "",
  package_weight: "",
  unit_price: "",
  gross_weight_ref: "1",
  net_weight_ref: "1",
  is_packaging: false,
  is_active: true,
};

export default function AdminIngredients() {
  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: categories = [] } = useIngredientCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: usage = {} } = useIngredientUsage();
  const saveIngredient = useSaveIngredient();
  const deleteIngredient = useDeleteIngredient();
  const saveCategory = useSaveIngredientCategory();
  const createQuote = useCreateQuote();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, id: "" });
  const [quoteTarget, setQuoteTarget] = useState<Ingredient | null>(null);
  const [quoteForm, setQuoteForm] = useState({ package_price: "", package_weight: "", unit_price: "" });
  const [newCategory, setNewCategory] = useState("");
  const { data: quotes = [] } = useIngredientQuotes(quoteTarget?.id);

  const filtered = useMemo(() => {
    const term = normalize(search);
    return ingredients.filter((i) => {
      const matchTerm = !term || normalize(`${i.name} ${i.code ?? ""} ${i.brand ?? ""}`).includes(term);
      const matchCat = categoryFilter === "all" || i.category_id === categoryFilter;
      return matchTerm && matchCat;
    });
  }, [ingredients, search, categoryFilter]);

  const openNew = () => {
    setForm({ ...emptyForm, id: "" });
    setDialogOpen(true);
  };

  const openEdit = (i: Ingredient) => {
    setForm({
      id: i.id,
      name: i.name,
      code: i.code ?? "",
      brand: i.brand ?? "",
      unit: i.unit as Unit,
      type: i.type,
      category_id: i.category_id ?? "",
      supplier_id: i.supplier_id ?? "",
      package_price: i.package_price != null ? String(i.package_price) : "",
      package_weight: i.package_weight != null ? String(i.package_weight) : "",
      unit_price: String(i.unit_price ?? ""),
      gross_weight_ref: String(i.gross_weight_ref ?? 1),
      net_weight_ref: String(i.net_weight_ref ?? 1),
      is_packaging: i.is_packaging,
      is_active: i.is_active,
    });
    setDialogOpen(true);
  };

  const derivedUnitPrice = useMemo(() => {
    const price = Number(form.package_price.replace(",", "."));
    const weight = Number(form.package_weight.replace(",", "."));
    if (price > 0 && weight > 0) return price / weight;
    return Number(form.unit_price.replace(",", ".")) || 0;
  }, [form.package_price, form.package_weight, form.unit_price]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do insumo");
      return;
    }
    if (derivedUnitPrice <= 0) {
      toast.error("Informe o preço da embalagem + peso ou o preço unitário");
      return;
    }
    try {
      await saveIngredient.mutateAsync({
        id: form.id || undefined,
        name: form.name.trim(),
        code: form.code.trim() || null,
        brand: form.brand.trim() || null,
        unit: form.unit,
        type: form.type,
        category_id: form.category_id || null,
        supplier_id: form.supplier_id || null,
        package_price: form.package_price ? Number(form.package_price.replace(",", ".")) : null,
        package_weight: form.package_weight ? Number(form.package_weight.replace(",", ".")) : null,
        unit_price: derivedUnitPrice,
        gross_weight_ref: Number(form.gross_weight_ref.replace(",", ".")) || 1,
        net_weight_ref: Number(form.net_weight_ref.replace(",", ".")) || 1,
        is_packaging: form.is_packaging,
        is_active: form.is_active,
        quoted_at: new Date().toISOString(),
      } as Partial<Ingredient> & { name: string });
      toast.success(form.id ? "Insumo atualizado" : "Insumo criado");
      setDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar insumo");
    }
  };

  const handleQuote = async () => {
    if (!quoteTarget) return;
    const price = Number(quoteForm.package_price.replace(",", "."));
    const weight = Number(quoteForm.package_weight.replace(",", "."));
    const unit = price > 0 && weight > 0 ? price / weight : Number(quoteForm.unit_price.replace(",", ".")) || 0;
    if (unit <= 0) {
      toast.error("Informe os valores da cotação");
      return;
    }
    try {
      await createQuote.mutateAsync({
        ingredient_id: quoteTarget.id,
        unit_price: unit,
        package_price: price || null,
        package_weight: weight || null,
        supplier_id: quoteTarget.supplier_id,
        source: "MANUAL",
      });
      await saveIngredient.mutateAsync({
        id: quoteTarget.id,
        name: quoteTarget.name,
        unit_price: unit,
        package_price: price || null,
        package_weight: weight || null,
        quoted_at: new Date().toISOString(),
      } as Partial<Ingredient> & { name: string });
      toast.success("Cotação registrada — fichas recalculadas");
      setQuoteForm({ package_price: "", package_weight: "", unit_price: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar cotação");
    }
  };

  const handleDelete = async (i: Ingredient) => {
    if ((usage[i.id] ?? 0) > 0) {
      toast.error(`Insumo usado em ${usage[i.id]} ficha(s). Desative-o em vez de excluir.`);
      return;
    }
    if (!confirm(`Excluir "${i.name}" definitivamente?`)) return;
    try {
      await deleteIngredient.mutateAsync(i.id);
      toast.success("Insumo excluído");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  const handleNewCategory = async () => {
    if (!newCategory.trim()) return;
    await saveCategory.mutateAsync({ name: newCategory.trim() });
    setNewCategory("");
    toast.success("Categoria criada");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Insumos</h2>
          <p className="text-muted-foreground">Cadastro de matéria-prima, embalagens e cotações de compra</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo insumo
        </Button>
      </div>

      <Card className="bg-surface">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, código ou marca"
              className="bg-surface pl-9 placeholder:text-surface-foreground"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[220px] bg-surface">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nova categoria"
              className="w-[180px] bg-surface placeholder:text-surface-foreground"
            />
            <Button variant="outline" onClick={handleNewCategory}>
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" /> {filtered.length} insumo(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Un.</TableHead>
                <TableHead className="text-right">Preço un.</TableHead>
                <TableHead className="text-right">FC</TableHead>
                <TableHead>Fichas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum insumo cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[i.code, i.brand, i.is_packaging ? "Embalagem" : null, i.type === "PREPARACAO" ? "Preparação" : null]
                        .filter(Boolean)
                        .join(" • ") || "—"}
                    </div>
                  </TableCell>
                  <TableCell>{i.unit}</TableCell>
                  <TableCell className="text-right font-medium">{brl(i.unit_price)}</TableCell>
                  <TableCell className="text-right">{num3(i.correction_factor)}</TableCell>
                  <TableCell>
                    {usage[i.id] ? <Badge variant="secondary">{usage[i.id]}</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {i.is_active ? <Badge variant="secondary">Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setQuoteTarget(i)} title="Cotações">
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(i)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i)} title="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formulário de insumo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-surface">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar insumo" : "Novo insumo"}</DialogTitle>
            <DialogDescription>
              O preço unitário é calculado por embalagem ÷ peso. O fator de correção vem do peso bruto ÷ peso líquido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Filé mignon"
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Código interno</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Marca</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as Unit })}>
                <SelectTrigger className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="LT">LT</SelectItem>
                  <SelectItem value="UN">UN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as "COMPRADO" | "PREPARACAO" })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRADO">Comprado</SelectItem>
                  <SelectItem value="PREPARACAO">Preparação interna</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={form.category_id || "none"}
                onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Select
                value={form.supplier_id || "none"}
                onValueChange={(v) => setForm({ ...form, supplier_id: v === "none" ? "" : v })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Sem fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem fornecedor</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preço da embalagem (R$)</Label>
              <Input
                value={form.package_price}
                onChange={(e) => setForm({ ...form, package_price: e.target.value })}
                placeholder="Ex.: 89,90"
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Peso/volume da embalagem ({form.unit})</Label>
              <Input
                value={form.package_weight}
                onChange={(e) => setForm({ ...form, package_weight: e.target.value })}
                placeholder="Ex.: 2"
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Peso bruto de referência</Label>
              <Input
                value={form.gross_weight_ref}
                onChange={(e) => setForm({ ...form, gross_weight_ref: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label>Peso líquido de referência</Label>
              <Input
                value={form.net_weight_ref}
                onChange={(e) => setForm({ ...form, net_weight_ref: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3 sm:col-span-2">
              <p className="text-sm text-muted-foreground">
                Preço unitário calculado: <span className="font-semibold text-foreground">{brl(derivedUnitPrice)}</span> por{" "}
                {form.unit}
              </p>
              <div className="mt-2">
                <Label className="text-xs">Ou informe o preço unitário direto</Label>
                <Input
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  placeholder="Ex.: 44,95"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label className="cursor-pointer">É embalagem/descartável</Label>
              <Switch
                checked={form.is_packaging}
                onCheckedChange={(v) => setForm({ ...form, is_packaging: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label className="cursor-pointer">Ativo</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveIngredient.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico de cotações */}
      <Dialog open={!!quoteTarget} onOpenChange={(o) => !o && setQuoteTarget(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-surface">
          <DialogHeader>
            <DialogTitle>Cotações — {quoteTarget?.name}</DialogTitle>
            <DialogDescription>
              Registrar uma cotação atualiza o preço do insumo e recalcula todas as fichas que o utilizam.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Preço embalagem</Label>
              <Input
                value={quoteForm.package_price}
                onChange={(e) => setQuoteForm({ ...quoteForm, package_price: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label className="text-xs">Peso/volume</Label>
              <Input
                value={quoteForm.package_weight}
                onChange={(e) => setQuoteForm({ ...quoteForm, package_weight: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <div>
              <Label className="text-xs">Preço unitário</Label>
              <Input
                value={quoteForm.unit_price}
                onChange={(e) => setQuoteForm({ ...quoteForm, unit_price: e.target.value })}
                className="bg-surface placeholder:text-surface-foreground"
              />
            </div>
          </div>
          <Button onClick={handleQuote} disabled={createQuote.isPending}>
            Registrar cotação
          </Button>
          <div className="space-y-2">
            {quotes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cotação registrada.</p>}
            {quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span>{new Date(q.quoted_at).toLocaleDateString("pt-BR")}</span>
                <span className="text-muted-foreground">
                  {q.package_price ? `${brl(q.package_price)} / ${q.package_weight}` : q.source}
                </span>
                <span className="font-medium">{brl(q.unit_price)}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}