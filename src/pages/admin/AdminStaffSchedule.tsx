import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useEmployees, useSaveEmployee, useDeleteEmployee,
  useShifts, useSaveShift, useDeleteShift, useDuplicatePreviousWeek,
  useTimeOff, useSaveTimeOff, useReviewTimeOff,
  useTimeClockToday, useClockIn, useClockOut, useAdjustClock,
  Employee, EmployeeShift, EmployeeTimeOff, TimeClockEntry,
  TIME_OFF_LABELS, SHIFT_STATUS_LABELS, TimeOffType, ShiftStatus,
} from "@/hooks/useStaffSchedule";
import { CalendarClock, Plus, Trash2, Pencil, Check, X, Copy, ChevronLeft, ChevronRight, Clock, LogIn, LogOut } from "lucide-react";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtBR(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// ============ EMPLOYEE DIALOG ============
function EmployeeDialog({ employee, trigger }: { employee?: Employee; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const save = useSaveEmployee();
  const [form, setForm] = useState({
    full_name: employee?.full_name ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    role: employee?.role ?? "",
    weekly_hours: employee?.weekly_hours?.toString() ?? "",
    hourly_rate: employee?.hourly_rate?.toString() ?? "",
    hire_date: employee?.hire_date ?? "",
    is_active: employee?.is_active ?? true,
    notes: employee?.notes ?? "",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar funcionário" : "Novo funcionário"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Nome completo *</Label>
            <Input className="bg-surface" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Função</Label>
              <Input className="bg-surface" placeholder="Garçom, Cozinha…" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <Label>Data admissão</Label>
              <Input className="bg-surface" type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>E-mail</Label>
              <Input className="bg-surface" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input className="bg-surface" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Carga semanal (h)</Label>
              <Input className="bg-surface" type="number" value={form.weekly_hours} onChange={(e) => setForm({ ...form, weekly_hours: e.target.value })} />
            </div>
            <div>
              <Label>Valor hora (R$)</Label>
              <Input className="bg-surface" type="number" step="0.01" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea className="bg-surface" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!form.full_name}
            onClick={() => {
              save.mutate(
                {
                  id: employee?.id,
                  full_name: form.full_name,
                  email: form.email || null,
                  phone: form.phone || null,
                  role: form.role || null,
                  weekly_hours: form.weekly_hours ? Number(form.weekly_hours) : null,
                  hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
                  hire_date: form.hire_date || null,
                  is_active: form.is_active,
                  notes: form.notes || null,
                },
                { onSuccess: () => setOpen(false) }
              );
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ SHIFT DIALOG ============
function ShiftDialog({ shift, defaultDate, defaultEmployeeId, employees, trigger }: { shift?: EmployeeShift; defaultDate?: string; defaultEmployeeId?: string; employees: Employee[]; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const save = useSaveShift();
  const [form, setForm] = useState({
    employee_id: shift?.employee_id ?? defaultEmployeeId ?? "",
    shift_date: shift?.shift_date ?? defaultDate ?? fmtDate(new Date()),
    start_time: shift?.start_time?.slice(0, 5) ?? "09:00",
    end_time: shift?.end_time?.slice(0, 5) ?? "17:00",
    role: shift?.role ?? "",
    status: (shift?.status ?? "scheduled") as ShiftStatus,
    notes: shift?.notes ?? "",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? "Editar turno" : "Novo turno"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Funcionário *</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger className="bg-surface"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Data</Label>
              <Input className="bg-surface" type="date" value={form.shift_date} onChange={(e) => setForm({ ...form, shift_date: e.target.value })} />
            </div>
            <div>
              <Label>Início</Label>
              <Input className="bg-surface" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input className="bg-surface" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Função no turno</Label>
            <Input className="bg-surface" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ShiftStatus })}>
              <SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SHIFT_STATUS_LABELS) as ShiftStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{SHIFT_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea className="bg-surface" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!form.employee_id}
            onClick={() => {
              save.mutate(
                {
                  id: shift?.id,
                  employee_id: form.employee_id,
                  shift_date: form.shift_date,
                  start_time: form.start_time,
                  end_time: form.end_time,
                  role: form.role || null,
                  status: form.status,
                  notes: form.notes || null,
                },
                { onSuccess: () => setOpen(false) }
              );
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ TIME OFF DIALOG ============
function TimeOffDialog({ employees, trigger }: { employees: Employee[]; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const save = useSaveTimeOff();
  const [form, setForm] = useState({
    employee_id: "",
    type: "day_off" as TimeOffType,
    start_date: fmtDate(new Date()),
    end_date: fmtDate(new Date()),
    reason: "",
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova solicitação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Funcionário *</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger className="bg-surface"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TimeOffType })}>
              <SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TIME_OFF_LABELS) as TimeOffType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIME_OFF_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>De</Label>
              <Input className="bg-surface" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>Até</Label>
              <Input className="bg-surface" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Motivo</Label>
            <Textarea className="bg-surface" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!form.employee_id}
            onClick={() => {
              save.mutate(
                { employee_id: form.employee_id, type: form.type, start_date: form.start_date, end_date: form.end_date, reason: form.reason || null },
                { onSuccess: () => setOpen(false) }
              );
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ CLOCK ADJUST DIALOG ============
function ClockAdjustDialog({ entry, trigger }: { entry: TimeClockEntry; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const adjust = useAdjustClock();
  const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
  const [form, setForm] = useState({
    clock_in: toLocal(entry.clock_in),
    clock_out: toLocal(entry.clock_out),
    break_minutes: entry.break_minutes,
    notes: entry.notes ?? "",
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Corrigir ponto</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Entrada</Label>
            <Input className="bg-surface" type="datetime-local" value={form.clock_in} onChange={(e) => setForm({ ...form, clock_in: e.target.value })} />
          </div>
          <div>
            <Label>Saída</Label>
            <Input className="bg-surface" type="datetime-local" value={form.clock_out} onChange={(e) => setForm({ ...form, clock_out: e.target.value })} />
          </div>
          <div>
            <Label>Intervalo (min)</Label>
            <Input className="bg-surface" type="number" value={form.break_minutes} onChange={(e) => setForm({ ...form, break_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea className="bg-surface" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              adjust.mutate(
                {
                  id: entry.id,
                  clock_in: form.clock_in ? new Date(form.clock_in).toISOString() : undefined,
                  clock_out: form.clock_out ? new Date(form.clock_out).toISOString() : null,
                  break_minutes: form.break_minutes,
                  notes: form.notes || null,
                },
                { onSuccess: () => setOpen(false) }
              );
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ MAIN PAGE ============
export default function AdminStaffSchedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = addDays(weekStart, 6);
  const from = fmtDate(weekStart);
  const to = fmtDate(weekEnd);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const { data: employees = [], isLoading: loadEmp } = useEmployees();
  const { data: shifts = [] } = useShifts(from, to);
  const { data: timeOff = [] } = useTimeOff();
  const { data: clockEntries = [] } = useTimeClockToday();
  const deleteEmp = useDeleteEmployee();
  const delShift = useDeleteShift();
  const dupWeek = useDuplicatePreviousWeek();
  const review = useReviewTimeOff();
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const activeEmployees = employees.filter((e) => e.is_active);

  const shiftsByEmpDate = useMemo(() => {
    const m = new Map<string, EmployeeShift[]>();
    shifts.forEach((s) => {
      const k = `${s.employee_id}|${s.shift_date}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    });
    return m;
  }, [shifts]);

  const openEntryByEmp = useMemo(() => {
    const m = new Map<string, TimeClockEntry>();
    clockEntries.forEach((e) => {
      if (!e.clock_out) m.set(e.employee_id, e);
    });
    return m;
  }, [clockEntries]);

  const timeOffByStatus = useMemo(() => ({
    pending: timeOff.filter((t) => t.status === "pending"),
    approved: timeOff.filter((t) => t.status === "approved"),
    rejected: timeOff.filter((t) => t.status === "rejected"),
  }), [timeOff]);

  const empName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  const shiftStatusColor: Record<ShiftStatus, string> = {
    scheduled: "bg-primary/15 text-primary border-primary/30",
    confirmed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    absent: "bg-destructive/15 text-destructive border-destructive/30",
    completed: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda de Funcionários</h2>
          <p className="text-muted-foreground">Escala, folgas e controle de ponto</p>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="schedule">Escala</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="timeoff">Folgas</TabsTrigger>
          <TabsTrigger value="clock">Ponto</TabsTrigger>
        </TabsList>

        {/* ============ ESCALA ============ */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
            <div className="text-sm text-muted-foreground ml-2">
              {fmtBR(weekStart)} — {fmtBR(weekEnd)}
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => dupWeek.mutate({ from, to })} disabled={dupWeek.isPending}>
                <Copy className="h-4 w-4 mr-2" /> Duplicar semana anterior
              </Button>
              <ShiftDialog
                employees={activeEmployees}
                defaultDate={from}
                trigger={<Button size="sm"><Plus className="h-4 w-4 mr-2" /> Novo turno</Button>}
              />
            </div>
          </div>

          {activeEmployees.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Cadastre funcionários para montar a escala.</CardContent></Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="text-left p-3 sticky left-0 bg-surface z-10 min-w-[160px]">Funcionário</th>
                    {days.map((d, i) => (
                      <th key={i} className="p-2 text-center min-w-[140px]">
                        <div className="text-xs text-muted-foreground">{WEEK_LABELS[i]}</div>
                        <div className="font-semibold">{fmtBR(d)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((emp) => (
                    <tr key={emp.id} className="border-t border-border">
                      <td className="p-3 sticky left-0 bg-background z-10 font-medium">{emp.full_name}<div className="text-xs text-muted-foreground">{emp.role}</div></td>
                      {days.map((d, i) => {
                        const key = `${emp.id}|${fmtDate(d)}`;
                        const cellShifts = shiftsByEmpDate.get(key) ?? [];
                        return (
                          <td key={i} className="p-2 align-top border-l border-border/50">
                            <div className="space-y-1">
                              {cellShifts.map((s) => (
                                <ShiftDialog
                                  key={s.id}
                                  shift={s}
                                  employees={activeEmployees}
                                  trigger={
                                    <button className={`w-full text-left border rounded px-2 py-1 text-xs ${shiftStatusColor[s.status]}`}>
                                      {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                                      {s.role && <div className="opacity-80 truncate">{s.role}</div>}
                                    </button>
                                  }
                                />
                              ))}
                              <ShiftDialog
                                employees={activeEmployees}
                                defaultDate={fmtDate(d)}
                                defaultEmployeeId={emp.id}
                                trigger={
                                  <button className="w-full text-xs text-muted-foreground hover:text-primary py-0.5">+ turno</button>
                                }
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ============ FUNCIONÁRIOS ============ */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-end">
            <EmployeeDialog trigger={<Button><Plus className="h-4 w-4 mr-2" /> Novo funcionário</Button>} />
          </div>
          {loadEmp ? (
            <p className="text-muted-foreground">Carregando…</p>
          ) : employees.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum funcionário cadastrado.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {employees.map((emp) => (
                <Card key={emp.id} className={emp.is_active ? "" : "opacity-60"}>
                  <CardContent className="py-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{emp.full_name}</span>
                        {emp.role && <Badge variant="secondary">{emp.role}</Badge>}
                        {!emp.is_active && <Badge variant="outline">Inativo</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {emp.email && <span>{emp.email} · </span>}
                        {emp.phone && <span>{emp.phone} · </span>}
                        {emp.weekly_hours && <span>{emp.weekly_hours}h/sem</span>}
                      </div>
                    </div>
                    <EmployeeDialog employee={emp} trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>} />
                    <Button variant="ghost" size="icon" onClick={() => confirm(`Remover ${emp.full_name}?`) && deleteEmp.mutate(emp.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============ FOLGAS ============ */}
        <TabsContent value="timeoff" className="space-y-4">
          <div className="flex justify-end">
            <TimeOffDialog employees={activeEmployees} trigger={<Button><Plus className="h-4 w-4 mr-2" /> Nova solicitação</Button>} />
          </div>
          {(["pending", "approved", "rejected"] as const).map((status) => (
            <div key={status}>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {status === "pending" ? "Pendentes" : status === "approved" ? "Aprovadas" : "Rejeitadas"} ({timeOffByStatus[status].length})
              </h3>
              {timeOffByStatus[status].length === 0 ? (
                <p className="text-sm text-muted-foreground mb-4">Nenhum registro.</p>
              ) : (
                <div className="grid gap-2 mb-4">
                  {timeOffByStatus[status].map((t) => (
                    <Card key={t.id}>
                      <CardContent className="py-3 flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{empName(t.employee_id)}</span>
                            <Badge variant="secondary">{TIME_OFF_LABELS[t.type]}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(t.start_date).toLocaleDateString("pt-BR")} → {new Date(t.end_date).toLocaleDateString("pt-BR")}
                            {t.reason && <span> · {t.reason}</span>}
                          </div>
                        </div>
                        {status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => review.mutate({ id: t.id, status: "approved" })}>
                              <Check className="h-4 w-4 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => review.mutate({ id: t.id, status: "rejected" })}>
                              <X className="h-4 w-4 mr-1" /> Rejeitar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        {/* ============ PONTO ============ */}
        <TabsContent value="clock" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Registrar ponto hoje</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {activeEmployees.length === 0 && <p className="text-sm text-muted-foreground">Nenhum funcionário ativo.</p>}
              {activeEmployees.map((emp) => {
                const open = openEntryByEmp.get(emp.id);
                return (
                  <div key={emp.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium">{emp.full_name}</div>
                      {open && (
                        <div className="text-xs text-muted-foreground">
                          Entrada: {new Date(open.clock_in).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                    {open ? (
                      <Button size="sm" variant="outline" onClick={() => clockOut.mutate(open.id)}>
                        <LogOut className="h-4 w-4 mr-1" /> Bater saída
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => clockIn.mutate(emp.id)}>
                        <LogIn className="h-4 w-4 mr-1" /> Bater entrada
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Registros de hoje</CardTitle></CardHeader>
            <CardContent>
              {clockEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum ponto registrado hoje.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground text-xs">
                      <tr>
                        <th className="text-left p-2">Funcionário</th>
                        <th className="text-left p-2">Entrada</th>
                        <th className="text-left p-2">Saída</th>
                        <th className="text-left p-2">Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {clockEntries.map((e) => {
                        const inD = new Date(e.clock_in);
                        const outD = e.clock_out ? new Date(e.clock_out) : null;
                        const totalMin = outD ? Math.max(0, Math.round((outD.getTime() - inD.getTime()) / 60000) - e.break_minutes) : 0;
                        const hh = Math.floor(totalMin / 60);
                        const mm = totalMin % 60;
                        return (
                          <tr key={e.id} className="border-t border-border/50">
                            <td className="p-2">{empName(e.employee_id)}</td>
                            <td className="p-2">{inD.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                            <td className="p-2">{outD ? outD.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td className="p-2">{outD ? `${hh}h${mm.toString().padStart(2, "0")}` : "em curso"}</td>
                            <td className="p-2 text-right">
                              <ClockAdjustDialog entry={e} trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}