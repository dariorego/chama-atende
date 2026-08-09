import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ArrowRight, TrendingUp, TrendingDown, Trash2, Gauge } from "lucide-react";
import { useRecipes, useAllPricing } from "@/hooks/useRecipes";
import { useWasteEntries } from "@/hooks/useWasteInventory";
import {
  brl,
  pct,
  num3,
  normalize,
  portionCost,
  suggestedPrice,
  appliedCmv,
  cmvLevel,
  CMV_LEVEL_INFO,
  DEFAULT_RULER,
  type CmvLevel,
  type CmvRuler,
} from "@/lib/cmv";
import { toCSV, downloadCSV } from "@/lib/csv";

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADA: "Publicada",
  FORA_DE_LINHA: "Fora de linha",
};

const RULER_KEY = "cmv-ruler";

function loadRuler(): CmvRuler {
  try {
    const raw = localStorage.getItem(RULER_KEY);
    if (!raw) return DEFAULT_RULER;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.low === "number" && typeof parsed?.high === "number") return parsed;
  } catch {
    /* ignore */
  }
  return DEFAULT_RULER;
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminCmv() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: recipes = [], isLoading } = useRecipes();
  const { data: pricing = [] } = useAllPricing();

  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const { data: waste = [] } = useWasteEntries(from, to);

  const [ruler, setRuler] = useState<CmvRuler>(loadRuler);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"cmv" | "cost" | "name">("cmv");

  const updateRuler = (next: CmvRuler) => {
    setRuler(next);
    try {
      localStorage.setItem(RULER_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const pricingByRecipe = useMemo(
    () => Object.fromEntries(pricing.map((p) => [p.recipe_id, p])),
    [pricing],
  );

  const rows = useMemo(() => {
    return recipes.map((r) => {
      const p = pricingByRecipe[r.id];
      const packaging = Number(p?.packaging_cost ?? 0);
      const totalCost = Number(r.total_cost ?? 0);
      const unit = portionCost(totalCost, Number(r.yield_qty ?? 0));
      const directCost = unit + packaging;
      const target = Number(p?.target_cmv ?? DEFAULT_RULER.high);
      const price = p?.selling_price != null ? Number(p.selling_price) : null;
      const cmv = appliedCmv(directCost, price);
      return {
        recipe: r,
        directCost,
        totalCost,
        unitCost: unit,
        packaging,
        price,
        suggested: suggestedPrice(directCost, target),
        target,
        cmv,
        level: cmvLevel(cmv, ruler),
        tag: p?.treatment_tag ?? null,
      };
    });
  }, [recipes, pricingByRecipe, ruler]);

  const filtered = useMemo(() => {
    const term = normalize(search);
    const list = rows.filter((row) => {
      const r = row.recipe;
      const matchTerm =
        !term || normalize(`${r.name} ${r.code ?? ""} ${r.category ?? ""}`).includes(term);
      const matchType = typeFilter === "all" || r.type === typeFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchLevel = levelFilter === "all" || row.level === levelFilter;
      return matchTerm && matchType && matchStatus && matchLevel;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "name") return a.recipe.name.localeCompare(b.recipe.name, "pt-BR");
      if (sortBy === "cost") return b.directCost - a.directCost;
      return (b.cmv ?? -1) - (a.cmv ?? -1);
    });
  }, [rows, search, typeFilter, statusFilter, levelFilter, sortBy]);

  const stats = useMemo(() => {
    const withCmv = rows.filter((r) => r.cmv != null);
    const avg = withCmv.length
      ? withCmv.reduce((s, r) => s + (r.cmv ?? 0), 0) / withCmv.length
      : null;
    const byLevel = rows.reduce(
      (acc, r) => ({ ...acc, [r.level]: (acc[r.level] ?? 0) + 1 }),
      {} as Record<CmvLevel, number>,
    );
    const avgCost = rows.length ? rows.reduce((s, r) => s + r.directCost, 0) / rows.length : 0;
    const wasteTotal = waste.reduce((s, w) => s + Number(w.total_value ?? 0), 0);
    return { avg, byLevel, avgCost, wasteTotal, count: rows.length, priced: withCmv.length };
  }, [rows, waste]);

  const topHigh = useMemo(
    () => rows.filter((r) => r.cmv != null).sort((a, b) => (b.cmv ?? 0) - (a.cmv ?? 0)).slice(0, 10),
    [rows],
  );
  const topLow = useMemo(
    () => rows.filter((r) => r.cmv != null).sort((a, b) => (a.cmv ?? 0) - (b.cmv ?? 0)).slice(0, 10),
    [rows],
  );

  const exportCsv = () => {
    const csv = toCSV(
      [
        "Ficha",
        "Codigo",
        "Tipo",
        "Status",
        "Rendimento",
        "Unidade",
        "Custo total",
        "Custo por porcao",
        "Embalagem",
        "Preco praticado",
        "Preco sugerido",
        "CMV alvo",
        "CMV aplicado",
        "Classificacao",
        "Etiqueta",
      ],
      filtered.map((row) => [
        row.recipe.name,
        row.recipe.code ?? "",
        row.recipe.type,
        row.recipe.status ?? "",
        row.recipe.yield_qty ?? "",
        row.recipe.yield_unit ?? "",
        row.totalCost.toFixed(2),
        row.unitCost.toFixed(2),
        row.packaging.toFixed(2),
        row.price != null ? row.price.toFixed(2) : "",
        row.suggested.toFixed(2),
        (row.target * 100).toFixed(1),
        row.cmv != null ? (row.cmv * 100).toFixed(1) : "",
        CMV_LEVEL_INFO[row.level].label,
        row.tag ?? "",
      ]),
    );
    downloadCSV(`cmv-${slug ?? "estabelecimento"}-${today()}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            Painel de CMV
          </h1>
          <p className="text-sm text-muted-foreground">
            Custo de mercadoria vendida consolidado de todas as fichas técnicas.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">CMV médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.avg != null ? pct(stats.avg) : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.priced} de {stats.count} fichas com preço praticado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Classificação</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(Object.keys(CMV_LEVEL_INFO) as CmvLevel[]).map((lvl) => (
              <Badge key={lvl} variant="outline" className={CMV_LEVEL_INFO[lvl].className}>
                {CMV_LEVEL_INFO[lvl].label}: {stats.byLevel[lvl] ?? 0}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Custo médio por porção</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{brl(stats.avgCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">Inclui custo de embalagem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Desperdício no período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">{brl(stats.wasteTotal)}</p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-surface placeholder:text-surface-foreground h-8 text-xs"
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-surface placeholder:text-surface-foreground h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Régua de CMV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Faixa saudável — mínimo (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={(ruler.low * 100).toFixed(1)}
              onChange={(e) =>
                updateRuler({ ...ruler, low: Math.max(0, Number(e.target.value) || 0) / 100 })
              }
              className="w-32 bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Faixa saudável — máximo (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={(ruler.high * 100).toFixed(1)}
              onChange={(e) =>
                updateRuler({ ...ruler, high: Math.max(0, Number(e.target.value) || 0) / 100 })
              }
              className="w-32 bg-surface placeholder:text-surface-foreground"
            />
          </div>
          <Button variant="ghost" onClick={() => updateRuler(DEFAULT_RULER)}>
            Restaurar padrão (25% – 30%)
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
              Maior CMV — prioridade de ajuste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topHigh.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem fichas com preço praticado.</p>
            )}
            {topHigh.map((row) => (
              <button
                key={row.recipe.id}
                onClick={() => navigate(`/admin/${slug}/fichas/${row.recipe.id}`)}
                className="w-full flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="truncate">{row.recipe.name}</span>
                <span className="font-semibold">{pct(row.cmv)}</span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              Melhor margem — incentivar venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topLow.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem fichas com preço praticado.</p>
            )}
            {topLow.map((row) => (
              <button
                key={row.recipe.id}
                onClick={() => navigate(`/admin/${slug}/fichas/${row.recipe.id}`)}
                className="w-full flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="truncate">{row.recipe.name}</span>
                <span className="font-semibold">{pct(row.cmv)}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fichas técnicas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-foreground" />
              <Input
                placeholder="Buscar ficha, código ou categoria"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface placeholder:text-surface-foreground"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-surface">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="PRODUTO_FINAL">Produto final</SelectItem>
                <SelectItem value="PREPARACAO">Preparação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] bg-surface">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                <SelectItem value="PUBLICADA">Publicada</SelectItem>
                <SelectItem value="FORA_DE_LINHA">Fora de linha</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[190px] bg-surface">
                <SelectValue placeholder="Faixa de CMV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as faixas</SelectItem>
                {(Object.keys(CMV_LEVEL_INFO) as CmvLevel[]).map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {CMV_LEVEL_INFO[lvl].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[170px] bg-surface">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cmv">Maior CMV</SelectItem>
                <SelectItem value="cost">Maior custo</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ficha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Rendimento</TableHead>
                  <TableHead className="text-right">Custo total</TableHead>
                  <TableHead className="text-right">Custo/porção</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Sugerido</TableHead>
                  <TableHead className="text-right">CMV</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Carregando…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Nenhuma ficha encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((row) => (
                  <TableRow
                    key={row.recipe.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/admin/${slug}/fichas/${row.recipe.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{row.recipe.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.recipe.code ? `${row.recipe.code} · ` : ""}
                        {STATUS_LABEL[row.recipe.status ?? ""] ?? "—"}
                        {row.tag ? ` · ${row.tag}` : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.recipe.type === "PRODUTO_FINAL" ? "Produto final" : "Preparação"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {num3(row.recipe.yield_qty)} {row.recipe.yield_unit}
                    </TableCell>
                    <TableCell className="text-right">{brl(row.totalCost)}</TableCell>
                    <TableCell className="text-right">{brl(row.directCost)}</TableCell>
                    <TableCell className="text-right">
                      {row.price != null ? brl(row.price) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {brl(row.suggested)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.cmv != null ? pct(row.cmv) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={CMV_LEVEL_INFO[row.level].className}>
                        {CMV_LEVEL_INFO[row.level].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
