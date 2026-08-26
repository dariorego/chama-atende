import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { HygieneTemplateDialog } from "@/components/admin/HygieneTemplateDialog";
import { HygieneRunSheet } from "@/components/admin/HygieneRunSheet";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  SHIFTS,
  SHIFT_LABELS,
  currentShift,
  today,
  useDeleteChecklist,
  useDeleteRun,
  useHygieneChecklists,
  useHygieneRuns,
  useStartRun,
  type HygieneChecklist,
  type HygieneChecklistItem,
  type HygieneShift,
  type RunWithRelations,
} from "@/hooks/useHygiene";

type TemplateWithItems = HygieneChecklist & { hygiene_checklist_items: HygieneChecklistItem[] };

export default function AdminHygiene() {
  const todayStr = today();
  const monthStart = `${todayStr.slice(0, 7)}-01`;
  const [range, setRange] = useState({ from: monthStart, to: todayStr });
  const [shiftFilter, setShiftFilter] = useState<HygieneShift | "ALL">("ALL");

  const { data: checklists = [], isLoading: loadingTemplates } = useHygieneChecklists();
  const { data: runs = [], isLoading: loadingRuns } = useHygieneRuns(range.from, range.to, shiftFilter);
  const startRun = useStartRun();
  const deleteRun = useDeleteRun();
  const deleteChecklist = useDeleteChecklist();

  const [templateDialog, setTemplateDialog] = useState<{ open: boolean; item: TemplateWithItems | null }>({
    open: false,
    item: null,
  });
  const [runSheet, setRunSheet] = useState<{ open: boolean; run: RunWithRelations | null }>({
    open: false,
    run: null,
  });
  const [startForm, setStartForm] = useState({
    checklist_id: "",
    shift: currentShift() as HygieneShift,
    run_date: todayStr,
  });

  const activeTemplates = checklists.filter((c) => c.is_active);

  const stats = useMemo(() => {
    const completed = runs.filter((r) => r.status === "CONCLUIDO");
    const avg =
      completed.length === 0
        ? 0
        : completed.reduce((s, r) => s + Number(r.compliance_pct ?? 0), 0) / completed.length;
    const nc = runs.reduce(
      (s, r) => s + (r.hygiene_checklist_answers ?? []).filter((a) => a.is_out_of_range).length,
      0,
    );
    return { total: runs.length, completed: completed.length, avg, nc };
  }, [runs]);

  const handleStart = async () => {
    if (!startForm.checklist_id) {
      toast.error("Selecione o modelo de checklist");
      return;
    }
    try {
      const id = await startRun.mutateAsync(startForm);
      toast.success("Checklist iniciado");
      const checklist = checklists.find((c) => c.id === startForm.checklist_id);
      setRunSheet({
        open: true,
        run: {
          id,
          restaurant_id: "",
          checklist_id: startForm.checklist_id,
          run_date: startForm.run_date,
          shift: startForm.shift,
          status: "EM_ANDAMENTO",
          performed_by: null,
          performed_by_name: null,
          completed_at: null,
          compliance_pct: 0,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          hygiene_checklists: checklist ? { name: checklist.name, shift: checklist.shift as HygieneShift } : null,
          hygiene_checklist_answers: [],
        } as RunWithRelations,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar checklist");
    }
  };

  const exportCSV = () => {
    const rows = runs.map((r) => [
      r.run_date,
      SHIFT_LABELS[r.shift as HygieneShift],
      r.hygiene_checklists?.name ?? "",
      r.performed_by_name ?? "",
      r.status === "CONCLUIDO" ? "Concluído" : "Em andamento",
      Number(r.compliance_pct ?? 0).toFixed(1),
      (r.hygiene_checklist_answers ?? []).filter((a) => a.is_out_of_range).length,
    ]);
    downloadCSV(
      `checklists-higiene-${range.from}-${range.to}.csv`,
      toCSV(["Data", "Turno", "Checklist", "Responsável", "Status", "Conformidade %", "Não conformidades"], rows),
    );
  };

  const openRun = (run: RunWithRelations) => setRunSheet({ open: true, run });
  const runChecklist = (run: RunWithRelations | null) =>
    checklists.find((c) => c.id === run?.checklist_id) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checklists de Higiene</h2>
          <p className="text-muted-foreground">
            Registro por turno com validação de temperatura e ações corretivas (boas práticas ANVISA)
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registros no período</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Concluídos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.completed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conformidade média</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.avg.toFixed(1)}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Não conformidades</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">{stats.nc}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="execucao">
        <TabsList>
          <TabsTrigger value="execucao">Execução</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="modelos">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="execucao" className="space-y-4 pt-4">
          <Card className="bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Iniciar checklist do turno</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label className="text-xs">Modelo</Label>
                <Select
                  value={startForm.checklist_id}
                  onValueChange={(v) => {
                    const c = checklists.find((x) => x.id === v);
                    setStartForm({
                      ...startForm,
                      checklist_id: v,
                      shift: (c?.shift as HygieneShift) ?? startForm.shift,
                    });
                  }}
                >
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} · {SHIFT_LABELS[c.shift as HygieneShift]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Turno</Label>
                <Select
                  value={startForm.shift}
                  onValueChange={(v) => setStartForm({ ...startForm, shift: v as HygieneShift })}
                >
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
              <div>
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={startForm.run_date}
                  onChange={(e) => setStartForm({ ...startForm, run_date: e.target.value })}
                  className="bg-surface"
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <Button className="gap-2" onClick={handleStart} disabled={startRun.isPending}>
                  <Play className="h-4 w-4" /> Iniciar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Em andamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingRuns && <p className="text-sm text-muted-foreground">Carregando...</p>}
              {!loadingRuns && runs.filter((r) => r.status === "EM_ANDAMENTO").length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum checklist em andamento.</p>
              )}
              {runs
                .filter((r) => r.status === "EM_ANDAMENTO")
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-3"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{r.hygiene_checklists?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.run_date + "T00:00:00").toLocaleDateString("pt-BR")} ·{" "}
                        {SHIFT_LABELS[r.shift as HygieneShift]} · {r.performed_by_name ?? "-"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openRun(r)}>
                        Preencher
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteRun.mutate(r.id)} aria-label="Excluir">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={range.from}
                onChange={(e) => setRange({ ...range, from: e.target.value })}
                className="bg-surface"
              />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={range.to}
                onChange={(e) => setRange({ ...range, to: e.target.value })}
                className="bg-surface"
              />
            </div>
            <div className="w-40">
              <Label className="text-xs">Turno</Label>
              <Select value={shiftFilter} onValueChange={(v) => setShiftFilter(v as HygieneShift | "ALL")}>
                <SelectTrigger className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {SHIFTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SHIFT_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Checklist</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Conformidade</TableHead>
                    <TableHead>NC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => {
                    const nc = (r.hygiene_checklist_answers ?? []).filter((a) => a.is_out_of_range).length;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.run_date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{SHIFT_LABELS[r.shift as HygieneShift]}</TableCell>
                        <TableCell>{r.hygiene_checklists?.name ?? "-"}</TableCell>
                        <TableCell>{r.performed_by_name ?? "-"}</TableCell>
                        <TableCell>{Number(r.compliance_pct ?? 0).toFixed(1)}%</TableCell>
                        <TableCell>
                          {nc > 0 ? <Badge variant="destructive">{nc}</Badge> : <span>0</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.status === "CONCLUIDO" ? "secondary" : "default"}>
                            {r.status === "CONCLUIDO" ? "Concluído" : "Em andamento"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openRun(r)}>
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {runs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                        Nenhum registro no período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modelos" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setTemplateDialog({ open: true, item: null })}>
              <Plus className="h-4 w-4" /> Novo modelo
            </Button>
          </div>
          {loadingTemplates && <p className="text-sm text-muted-foreground">Carregando...</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {checklists.map((c) => (
              <Card key={c.id} className="bg-surface">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <CardDescription>
                        {SHIFT_LABELS[c.shift as HygieneShift]} · {c.hygiene_checklist_items.length} itens
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setTemplateDialog({ open: true, item: c })}
                        aria-label="Editar modelo"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteChecklist.mutate(c.id)}
                        aria-label="Excluir modelo"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {!c.is_active && <Badge variant="secondary">Inativo</Badge>}
                  {c.description && <p>{c.description}</p>}
                </CardContent>
              </Card>
            ))}
            {!loadingTemplates && checklists.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum modelo cadastrado. Crie um modelo para começar os registros por turno.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <HygieneTemplateDialog
        open={templateDialog.open}
        onOpenChange={(open) =>
          setTemplateDialog((prev) => ({ open, item: open ? prev.item : null }))
        }
        checklist={
          templateDialog.item
            ? (checklists.find((c) => c.id === templateDialog.item?.id) ?? templateDialog.item)
            : null
        }
      />

      <HygieneRunSheet
        open={runSheet.open}
        onOpenChange={(open) => setRunSheet((prev) => ({ open, run: open ? prev.run : null }))}
        run={runSheet.run ? (runs.find((r) => r.id === runSheet.run?.id) ?? runSheet.run) : null}
        checklist={runChecklist(runSheet.run)}
      />
    </div>
  );
}
