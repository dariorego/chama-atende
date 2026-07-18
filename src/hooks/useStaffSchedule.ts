import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";

export interface Employee {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  hourly_rate: number | null;
  weekly_hours: number | null;
  hire_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ShiftStatus = "scheduled" | "confirmed" | "absent" | "completed";

export interface EmployeeShift {
  id: string;
  restaurant_id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  role: string | null;
  status: ShiftStatus;
  notes: string | null;
}

export type TimeOffType = "vacation" | "day_off" | "sick_leave" | "unpaid" | "other";
export type TimeOffStatus = "pending" | "approved" | "rejected";

export interface EmployeeTimeOff {
  id: string;
  restaurant_id: string;
  employee_id: string;
  type: TimeOffType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: TimeOffStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface TimeClockEntry {
  id: string;
  restaurant_id: string;
  employee_id: string;
  shift_id: string | null;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  source: string;
  notes: string | null;
}

export const TIME_OFF_LABELS: Record<TimeOffType, string> = {
  vacation: "Férias",
  day_off: "Folga",
  sick_leave: "Atestado",
  unpaid: "Não remunerado",
  other: "Outro",
};

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  scheduled: "Escalado",
  confirmed: "Confirmado",
  absent: "Faltou",
  completed: "Concluído",
};

// ============ EMPLOYEES ============
export function useEmployees() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["staff-employees", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useSaveEmployee() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: Partial<Employee> & { id?: string; full_name: string }) => {
      if (input.id) {
        const { error } = await supabase.from("employees").update(input as never).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert({ ...input, restaurant_id: tenantId } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-employees"] });
      toast({ title: "Funcionário salvo" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-employees"] });
      toast({ title: "Funcionário removido" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

// ============ SHIFTS ============
export function useShifts(from: string, to: string) {
  const { tenantId } = useTenant();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["staff-shifts", tenantId, from, to],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_shifts")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .gte("shift_date", from)
        .lte("shift_date", to)
        .order("shift_date")
        .order("start_time");
      if (error) throw error;
      return data as EmployeeShift[];
    },
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`staff-shifts-${tenantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employee_shifts", filter: `restaurant_id=eq.${tenantId}` },
        () => qc.invalidateQueries({ queryKey: ["staff-shifts", tenantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, tenantId]);

  return query;
}

export function useSaveShift() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: Partial<EmployeeShift> & { id?: string; employee_id: string; shift_date: string; start_time: string; end_time: string }) => {
      if (input.id) {
        const { error } = await supabase.from("employee_shifts").update(input as never).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_shifts").insert({ ...input, restaurant_id: tenantId } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-shifts"] });
      toast({ title: "Turno salvo" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-shifts"] }),
  });
}

export function useDuplicatePreviousWeek() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ from, to }: { from: string; to: string }) => {
      // Fetch previous week
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 7);
      const prevTo = new Date(to);
      prevTo.setDate(prevTo.getDate() - 7);
      const { data: prev, error } = await supabase
        .from("employee_shifts")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .gte("shift_date", prevFrom.toISOString().slice(0, 10))
        .lte("shift_date", prevTo.toISOString().slice(0, 10));
      if (error) throw error;
      if (!prev || prev.length === 0) throw new Error("Semana anterior está vazia");
      const rows = (prev as Array<Record<string, unknown> & { shift_date: string; start_time: string; end_time: string; employee_id: string; role: string | null; notes: string | null }>).map((s) => {
        const d = new Date(s.shift_date);
        d.setDate(d.getDate() + 7);
        return {
          restaurant_id: tenantId,
          employee_id: s.employee_id,
          shift_date: d.toISOString().slice(0, 10),
          start_time: s.start_time,
          end_time: s.end_time,
          role: s.role,
          notes: s.notes,
          status: "scheduled",
        };
      });
      const { error: insErr } = await supabase.from("employee_shifts").insert(rows as never);
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-shifts"] });
      toast({ title: "Semana anterior duplicada" });
    },
    onError: (e: Error) => toast({ title: "Erro ao duplicar", description: e.message, variant: "destructive" }),
  });
}

// ============ TIME OFF ============
export function useTimeOff() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["staff-time-off", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_time_off")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as EmployeeTimeOff[];
    },
  });
}

export function useSaveTimeOff() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: Partial<EmployeeTimeOff> & { employee_id: string; start_date: string; end_date: string; type: TimeOffType }) => {
      if (input.id) {
        const { error } = await supabase.from("employee_time_off").update(input as never).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employee_time_off").insert({ ...input, restaurant_id: tenantId, status: input.status ?? "pending" } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-time-off"] });
      toast({ title: "Solicitação salva" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useReviewTimeOff() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TimeOffStatus }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("employee_time_off")
        .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: userRes.user?.id ?? null } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-time-off"] });
      toast({ title: "Solicitação atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

// ============ TIME CLOCK ============
export function useTimeClockToday() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const query = useQuery({
    queryKey: ["staff-clock", tenantId, today],
    enabled: !!tenantId,
    queryFn: async () => {
      const start = `${today}T00:00:00`;
      const end = `${today}T23:59:59`;
      const { data, error } = await supabase
        .from("time_clock_entries")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .gte("clock_in", start)
        .lte("clock_in", end)
        .order("clock_in", { ascending: false });
      if (error) throw error;
      return data as TimeClockEntry[];
    },
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`staff-clock-${tenantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_clock_entries", filter: `restaurant_id=eq.${tenantId}` },
        () => qc.invalidateQueries({ queryKey: ["staff-clock", tenantId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, tenantId]);

  return query;
}

export function useClockIn() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (employee_id: string) => {
      const { error } = await supabase.from("time_clock_entries").insert({
        restaurant_id: tenantId,
        employee_id,
        clock_in: new Date().toISOString(),
        source: "manual",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-clock"] });
      toast({ title: "Entrada registrada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("time_clock_entries")
        .update({ clock_out: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-clock"] });
      toast({ title: "Saída registrada" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

export function useAdjustClock() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, clock_in, clock_out, break_minutes, notes }: { id: string; clock_in?: string; clock_out?: string | null; break_minutes?: number; notes?: string | null }) => {
      const updates: Record<string, unknown> = {};
      if (clock_in !== undefined) updates.clock_in = clock_in;
      if (clock_out !== undefined) updates.clock_out = clock_out;
      if (break_minutes !== undefined) updates.break_minutes = break_minutes;
      if (notes !== undefined) updates.notes = notes;
      const { error } = await supabase.from("time_clock_entries").update(updates as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-clock"] });
      toast({ title: "Ponto corrigido" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}