import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Save, Printer, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useRecipe,
  useRecipes,
  useSaveRecipe,
  useSaveComponent,
  useDeleteComponent,
  useSaveSteps,
  useSavePricing,
  usePublishRecipe,
  useRecipeVersions,
} from "@/hooks/useRecipes";
import { useIngredients } from "@/hooks/useIngredients";
import { brl, num3, pct, appliedCmv, suggestedPrice, cmvLevel, CMV_LEVEL_INFO, TREATMENT_TAGS } from "@/lib/cmv";

export default function AdminRecipeEditor() {
  const { slug, recipeId } = useParams<{ slug: string; recipeId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useRecipe(recipeId);
  const { data: ingredients = [] } = useIngredients();
  const { data: recipes = [] } = useRecipes();
  const { data: versions = [] } = useRecipeVersions(recipeId);
  const saveRecipe = useSaveRecipe();
  const saveComponent = useSaveComponent();
  const deleteComponent = useDeleteComponent();
  const saveSteps = useSaveSteps();
  const savePricing = useSavePricing();
  const publish = usePublishRecipe();

  const recipe = data?.recipe;
  const components = data?.components ?? [];
  const pricing = data?.pricing;

  const [header, setHeader] = useState({ name: "", yield_qty: "1", prep_time_min: "", shelf_life: "", notes: "" });
  const [steps, setSteps] = useState<string[]>([""]);
  const [price, setPrice] = useState({ target_cmv: "30", selling_price: "", packaging_cost: "0", treatment_tag: "" });
  const [newLine, setNewLine] = useState({
    kind: "ingredient" as "ingredient" | "recipe",
    refId: "",
    gross_weight: "",
    net_weight: "",
    household_measure: "",
  });

  useEffect(() => {
    if (!recipe) return;
    setHeader({
      name: recipe.name,
      yield_qty: String(recipe.yield_qty ?? 1),
      prep_time_min: recipe.prep_time_min != null ? String(recipe.prep_time_min) : "",
      shelf_life: recipe.shelf_life ?? "",
      notes: recipe.notes ?? "",
    });
  }, [recipe]);

  useEffect(() => {
    const list = data?.steps ?? [];
    setSteps(list.length ? list.map((s) => s.description) : [""]);
  }, [data?.steps]);

  useEffect(() => {
    if (!pricing) return;
    setPrice({
      target_cmv: String(Number(pricing.target_cmv) * 100),
      selling_price: pricing.selling_price != null ? String(pricing.selling_price) : "",
      packaging_cost: String(pricing.packaging_cost ?? 0),
      treatment_tag: pricing.treatment_tag ?? "",
    });
  }, [pricing]);

  const subRecipes = useMemo(
    () => recipes.filter((r) => r.id !== recipeId && r.type === "PREPARACAO"),
    [recipes, recipeId],
  );

  const packagingCost = Number(price.packaging_cost.replace(",", ".")) || 0;
  const targetCmv = (Number(price.target_cmv.replace(",", ".")) || 0) / 100;
  const sellingPrice = Number(price.selling_price.replace(",", ".")) || 0;
  const directCost = Number(recipe?.unit_cost ?? 0) + packagingCost;
  const suggested = suggestedPrice(directCost, targetCmv);
  const cmv = appliedCmv(directCost, sellingPrice);
  const level = cmvLevel(cmv);

  const handleSaveHeader = async () => {
    if (!recipe) return;
    try {
      await saveRecipe.mutateAsync({
        ...recipe,
        name: header.name.trim() || recipe.name,
        yield_qty: Number(header.yield_qty.replace(",", ".")) || 1,
        prep_time_min: header.prep_time_min ? Number(header.prep_time_min) : null,
        shelf_life: header.shelf_life.trim() || null,
        notes: header.notes.trim() || null,
      });
      toast.success("Ficha atualizada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  const handleAddLine = async () => {
    if (!recipeId || !newLine.refId) {
      toast.error("Escolha o insumo ou a preparação");
      return;
    }
    const gross = Number(newLine.gross_weight.replace(",", ".")) || 0;
    const net = Number(newLine.net_weight.replace(",", ".")) || gross;
    if (gross <= 0) {
      toast.error("Informe a quantidade bruta");
      return;
    }
    const ing = ingredients.find((i) => i.id === newLine.refId);
    const sub = subRecipes.find((r) => r.id === newLine.refId);
    try {
      await saveComponent.mutateAsync({
        recipe_id: recipeId,
        ingredient_id: newLine.kind === "ingredient" ? newLine.refId : null,
        sub_recipe_id: newLine.kind === "recipe" ? newLine.refId : null,
        gross_weight: gross,
        net_weight: net,
        unit: (newLine.kind === "ingredient" ? ing?.unit : sub?.yield_unit === "LT" ? "LT" : "KG") ?? "KG",
        unit_price: newLine.kind === "ingredient" ? Number(ing?.unit_price ?? 0) : Number(sub?.unit_cost ?? 0),
        household_measure: newLine.household_measure.trim() || null,
        display_order: components.length + 1,
      });
      setNewLine({ kind: newLine.kind, refId: "", gross_weight: "", net_weight: "", household_measure: "" });
      toast.success("Item adicionado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar item");
    }
  };

  const handleSaveSteps = async () => {
    if (!recipeId) return;
    await saveSteps.mutateAsync({ recipeId, steps: steps.map((description) => ({ description })) });
    toast.success("Modo de preparo salvo");
  };

  const handleSavePricing = async () => {
    if (!recipeId) return;
    await savePricing.mutateAsync({
      recipe_id: recipeId,
      target_cmv: targetCmv,
      selling_price: sellingPrice || null,
      packaging_cost: packagingCost,
      treatment_tag: price.treatment_tag || null,
    });
    toast.success("Precificação salva");
  };

  const handlePublish = async () => {
    if (!recipeId) return;
    try {
      const version = await publish.mutateAsync(recipeId);
      toast.success(`Versão ${version} publicada`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao publicar");
    }
  };

  const nameOf = (c: (typeof components)[number]) =>
    c.ingredient_id
      ? (ingredients.find((i) => i.id === c.ingredient_id)?.name ?? "Insumo removido")
      : (recipes.find((r) => r.id === c.sub_recipe_id)?.name ?? "Preparação removida");

  if (isLoading) return <p className="text-muted-foreground">Carregando ficha…</p>;
  if (!recipe) return <p className="text-muted-foreground">Ficha não encontrada.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/${slug}/fichas`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{recipe.name}</h2>
            <p className="text-muted-foreground">
              {recipe.type === "PRODUTO_FINAL" ? "Produto final" : "Preparação"} • rende {recipe.yield_qty}{" "}
              {recipe.yield_unit}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button onClick={handlePublish} disabled={publish.isPending}>
            <BadgeCheck className="mr-2 h-4 w-4" /> Publicar versão
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Custo total</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(recipe.total_cost)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Custo por {recipe.yield_unit.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(recipe.unit_cost)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Preço sugerido</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(suggested)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CMV aplicado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{cmv ? pct(cmv) : "—"}</div>
            <Badge variant="outline" className={CMV_LEVEL_INFO[level].className}>
              {CMV_LEVEL_INFO[level].label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insumos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insumos">Insumos</TabsTrigger>
          <TabsTrigger value="preparo">Modo de preparo</TabsTrigger>
          <TabsTrigger value="preco">Precificação</TabsTrigger>
          <TabsTrigger value="dados">Dados da ficha</TabsTrigger>
          <TabsTrigger value="versoes">Versões</TabsTrigger>
        </TabsList>

        <TabsContent value="insumos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Composição</CardTitle>
              <CardDescription>
                O custo de cada linha é peso bruto × preço unitário, com fator de correção calculado automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Medida caseira</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead className="text-right">FC</TableHead>
                    <TableHead className="text-right">Preço un.</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                        Nenhum item adicionado.
                      </TableCell>
                    </TableRow>
                  )}
                  {components.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {nameOf(c)}
                        {c.sub_recipe_id && (
                          <Badge variant="outline" className="ml-2">
                            preparação
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.household_measure ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {num3(c.gross_weight)} {c.unit}
                      </TableCell>
                      <TableCell className="text-right">{num3(c.net_weight)}</TableCell>
                      <TableCell className="text-right">{num3(c.correction_factor)}</TableCell>
                      <TableCell className="text-right">{brl(c.unit_price)}</TableCell>
                      <TableCell className="text-right font-medium">{brl(c.cost)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteComponent.mutate(c.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Adicionar item</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-6">
              <div>
                <Label className="text-xs">Origem</Label>
                <Select
                  value={newLine.kind}
                  onValueChange={(v) => setNewLine({ ...newLine, kind: v as "ingredient" | "recipe", refId: "" })}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredient">Insumo</SelectItem>
                    <SelectItem value="recipe">Preparação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Item</Label>
                <Select value={newLine.refId} onValueChange={(v) => setNewLine({ ...newLine, refId: v })}>
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(newLine.kind === "ingredient" ? ingredients : subRecipes).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Bruto</Label>
                <Input
                  value={newLine.gross_weight}
                  onChange={(e) => setNewLine({ ...newLine, gross_weight: e.target.value })}
                  placeholder="0,250"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label className="text-xs">Líquido</Label>
                <Input
                  value={newLine.net_weight}
                  onChange={(e) => setNewLine({ ...newLine, net_weight: e.target.value })}
                  placeholder="0,220"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label className="text-xs">Medida caseira</Label>
                <Input
                  value={newLine.household_measure}
                  onChange={(e) => setNewLine({ ...newLine, household_measure: e.target.value })}
                  placeholder="1 xícara"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div className="md:col-span-6">
                <Button onClick={handleAddLine} disabled={saveComponent.isPending}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparo">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modo de preparo</CardTitle>
              <CardDescription>Passos numerados usados na impressão da ficha para a cozinha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-6 text-sm text-muted-foreground">{i + 1}.</span>
                  <Textarea
                    value={s}
                    onChange={(e) => setSteps(steps.map((v, idx) => (idx === i ? e.target.value : v)))}
                    className="bg-surface placeholder:text-surface-foreground"
                    placeholder="Descreva o passo"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSteps([...steps, ""])}>
                  <Plus className="mr-2 h-4 w-4" /> Novo passo
                </Button>
                <Button onClick={handleSaveSteps} disabled={saveSteps.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Salvar preparo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preco">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Precificação e CMV</CardTitle>
              <CardDescription>
                Preço sugerido = (custo unitário + embalagem) ÷ CMV alvo. O semáforo compara com o preço praticado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>CMV alvo (%)</Label>
                <Input
                  value={price.target_cmv}
                  onChange={(e) => setPrice({ ...price, target_cmv: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Custo de embalagem (R$)</Label>
                <Input
                  value={price.packaging_cost}
                  onChange={(e) => setPrice({ ...price, packaging_cost: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Preço praticado (R$)</Label>
                <Input
                  value={price.selling_price}
                  onChange={(e) => setPrice({ ...price, selling_price: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Tratamento</Label>
                <Select
                  value={price.treatment_tag || "none"}
                  onValueChange={(v) => setPrice({ ...price, treatment_tag: v === "none" ? "" : v })}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Sem tratamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem tratamento</SelectItem>
                    {TREATMENT_TAGS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator className="md:col-span-4" />
              <div className="md:col-span-4 flex flex-wrap items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Custo direto <span className="font-semibold text-foreground">{brl(directCost)}</span> • sugerido{" "}
                  <span className="font-semibold text-foreground">{brl(suggested)}</span> • CMV{" "}
                  <span className="font-semibold text-foreground">{cmv ? pct(cmv) : "—"}</span>
                </p>
                <Button onClick={handleSavePricing} disabled={savePricing.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Salvar precificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da ficha</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={header.name}
                  onChange={(e) => setHeader({ ...header, name: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Rendimento ({recipe.yield_unit})</Label>
                <Input
                  value={header.yield_qty}
                  onChange={(e) => setHeader({ ...header, yield_qty: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Tempo de preparo (min)</Label>
                <Input
                  value={header.prep_time_min}
                  onChange={(e) => setHeader({ ...header, prep_time_min: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div>
                <Label>Validade / armazenamento</Label>
                <Input
                  value={header.shelf_life}
                  onChange={(e) => setHeader({ ...header, shelf_life: e.target.value })}
                  placeholder="Ex.: 3 dias refrigerado"
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={header.notes}
                  onChange={(e) => setHeader({ ...header, notes: e.target.value })}
                  className="bg-surface placeholder:text-surface-foreground"
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleSaveHeader} disabled={saveRecipe.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Salvar dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versoes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de versões</CardTitle>
              <CardDescription>Cada publicação congela custos e composição da ficha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma versão publicada.</p>}
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span className="font-medium">Versão {v.version}</span>
                  <span className="text-muted-foreground">
                    {new Date(v.published_at).toLocaleString("pt-BR")}
                  </span>
                  <span>
                    {brl(v.total_cost)} • un. {brl(v.unit_cost)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}