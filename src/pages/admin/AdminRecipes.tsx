import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, ChefHat, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRecipes, useSaveRecipe, useDeleteRecipe, useAllPricing, type Recipe } from "@/hooks/useRecipes";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { brl, cmvLevel, CMV_LEVEL_INFO, appliedCmv, normalize, pct } from "@/lib/cmv";

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADA: "Publicada",
  FORA_DE_LINHA: "Fora de linha",
};

export default function AdminRecipes() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: recipes = [], isLoading } = useRecipes();
  const { data: pricing = [] } = useAllPricing();
  const { data: products = [] } = useAdminProducts();
  const saveRecipe = useSaveRecipe();
  const deleteRecipe = useDeleteRecipe();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "PRODUTO_FINAL" as "PRODUTO_FINAL" | "PREPARACAO",
    yield_qty: "1",
    yield_unit: "PORCAO" as "KG" | "LT" | "PORCAO" | "UN",
    category: "",
    menu_product_id: "",
  });

  const pricingByRecipe = useMemo(
    () => Object.fromEntries(pricing.map((p) => [p.recipe_id, p])),
    [pricing],
  );

  const filtered = useMemo(() => {
    const term = normalize(search);
    return recipes.filter((r) => {
      const matchTerm = !term || normalize(`${r.name} ${r.code ?? ""} ${r.category ?? ""}`).includes(term);
      const matchType = typeFilter === "all" || r.type === typeFilter;
      return matchTerm && matchType;
    });
  }, [recipes, search, typeFilter]);

  const handleCreate = async () => {
    const selectedProduct = products.find((product) => product.id === form.menu_product_id);
    if (!selectedProduct) {
      toast.error("Selecione um produto do cardápio");
      return;
    }
    try {
      const id = await saveRecipe.mutateAsync({
        name: selectedProduct.name,
        type: form.type,
        yield_qty: Number(form.yield_qty.replace(",", ".")) || 1,
        yield_unit: form.yield_unit,
        category: form.category.trim() || null,
        menu_product_id: selectedProduct.id,
      } as Partial<Recipe> & { name: string });
      toast.success("Ficha criada");
      setOpen(false);
      if (id) navigate(`/admin/${slug}/fichas/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar ficha");
    }
  };

  const handleDelete = async (r: Recipe) => {
    if (!confirm(`Excluir a ficha "${r.name}"?`)) return;
    try {
      await deleteRecipe.mutateAsync(r.id);
      toast.success("Ficha excluída");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir ficha");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fichas Técnicas</h2>
          <p className="text-muted-foreground">Produtos finais e preparações com custo calculado automaticamente</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova ficha
        </Button>
      </div>

      <Card className="bg-surface">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ficha"
              className="bg-surface pl-9 placeholder:text-surface-foreground"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[220px] bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="PRODUTO_FINAL">Produto final</SelectItem>
              <SelectItem value="PREPARACAO">Preparação (sub-receita)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChefHat className="h-4 w-4" /> {filtered.length} ficha(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ficha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Rendimento</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
                <TableHead className="text-right">Custo unitário</TableHead>
                <TableHead className="text-right">CMV</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[110px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhuma ficha cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r) => {
                const p = pricingByRecipe[r.id];
                const direct = Number(r.unit_cost ?? 0) + Number(p?.packaging_cost ?? 0);
                const cmv = appliedCmv(direct, p?.selling_price);
                const level = cmvLevel(cmv);
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/admin/${slug}/fichas/${r.id}`)}>
                    <TableCell>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.category ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.type === "PRODUTO_FINAL" ? "Produto" : "Preparação"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.yield_qty} {r.yield_unit}
                    </TableCell>
                    <TableCell className="text-right">{brl(r.total_cost)}</TableCell>
                    <TableCell className="text-right font-medium">{brl(r.unit_cost)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={CMV_LEVEL_INFO[level].className}>
                        {cmv ? pct(cmv) : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "PUBLICADA" ? "secondary" : "outline"}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/${slug}/fichas/${r.id}`)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-surface">
          <DialogHeader>
            <DialogTitle>Nova ficha técnica</DialogTitle>
            <DialogDescription>Depois de criar, adicione os insumos e o modo de preparo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Produto do cardápio *</Label>
              <Select
                value={form.menu_product_id}
                onValueChange={(productId) => {
                  const product = products.find((item) => item.id === productId);
                  setForm({ ...form, menu_product_id: productId, name: product?.name ?? "" });
                }}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {products.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Cadastre um produto no cardápio antes de criar a ficha.</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as "PRODUTO_FINAL" | "PREPARACAO" })}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUTO_FINAL">Produto final</SelectItem>
                    <SelectItem value="PREPARACAO">Preparação (sub-receita)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ex.: Pratos principais"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Rendimento</Label>
                <Input
                  value={form.yield_qty}
                  onChange={(e) => setForm({ ...form, yield_qty: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Unidade do rendimento</Label>
                <Select
                  value={form.yield_unit}
                  onValueChange={(v) => setForm({ ...form, yield_unit: v as typeof form.yield_unit })}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORCAO">Porções</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="LT">LT</SelectItem>
                    <SelectItem value="UN">UN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saveRecipe.isPending || !form.menu_product_id}>
              Criar ficha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}