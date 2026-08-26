import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables, TablesInsert } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export type HygieneShift = Enums<"hygiene_shift">;
export type HygieneItemType = Enums<"hygiene_item_type">;
export type HygieneAnswerValue = Enums<"hygiene_answer">;
export type HygieneRunStatus = Enums<"hygiene_run_status">;
export type HygieneShelfStatus = Enums<"hygiene_shelf_status">;

export type HygieneChecklist = Tables<"hygiene_checklists">;
export type HygieneChecklistItem = Tables<"hygiene_checklist_items">;
export type HygieneRun = Tables<"hygiene_checklist_runs">;
export type HygieneAnswer = Tables<"hygiene_checklist_answers">;
export type ShelfLifeItem = Tables<"hygiene_shelf_life_items">;

export const SHIFT_LABELS: Record<HygieneShift, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
  INTEGRAL: "Integral",
};

export const SHIFTS: HygieneShift[] = ["MANHA", "TARDE", "NOITE", "INTEGRAL"];

export const ITEM_TYPE_LABELS: Record<HygieneItemType, string> = {
  CONFORMIDADE: "Conforme / Não conforme",
  NUMERICO: "Numérico (faixa)",
  TEXTO: "Texto livre",
};

export const ANSWER_LABELS: Record<HygieneAnswerValue, string> = {
  CONFORME: "Conforme",
  NAO_CONFORME: "Não conforme",
  NA: "Não se aplica",
};

export const SHELF_STATUS_LABELS: Record<HygieneShelfStatus, string> = {
  ATIVO: "Ativo",
  DESCARTADO: "Descartado",
  CONSUMIDO: "Consumido",
};

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Sugere o turno a partir da hora local. */
export function currentShift(): HygieneShift {
  const h = new Date().getHours();
  if (h < 12) return "MANHA";
  if (h < 18) return "TARDE";
  return "NOITE";
}

/* ------------------------------- Templates ------------------------------- */

export function useHygieneChecklists(options?: { enabled?: boolean }) {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["hyg-checklists", tenantId],
    enabled: !!tenantId && (options?.enabled ?? true),

    queryFn: async () => {
      const { data, error } = await supabase
        .from("hygiene_checklists")
        .select("*, hygiene_checklist_items(*)")
        .eq("restaurant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        hygiene_checklist_items: [...(c.hygiene_checklist_items ?? [])].sort(
          (a, b) => a.position - b.position,
        ),
      })) as (HygieneChecklist & { hygiene_checklist_items: HygieneChecklistItem[] })[];
    },
  });
}

export function useSaveChecklist() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      shift: HygieneShift;
      description?: string | null;
      is_active?: boolean;
    }) => {
      if (payload.id) {
        const { error } = await supabase
          .from("hygiene_checklists")
          .update({
            name: payload.name,
            shift: payload.shift,
            description: payload.description ?? null,
            is_active: payload.is_active ?? true,
          })
          .eq("id", payload.id);
        if (error) throw error;
        return payload.id;
      }
      const id = crypto.randomUUID();
      const { error } = await supabase.from("hygiene_checklists").insert({
        id,
        restaurant_id: tenantId!,
        name: payload.name,
        shift: payload.shift,
        description: payload.description ?? null,
        is_active: payload.is_active ?? true,
      } as TablesInsert<"hygiene_checklists">);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-checklists"] }),
  });
}

export function useDeleteChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hygiene_checklists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-checklists"] }),
  });
}

export function useSaveChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      checklist_id: string;
      label: string;
      item_type: HygieneItemType;
      unit?: string | null;
      min_value?: number | null;
      max_value?: number | null;
      is_required: boolean;
      position: number;
    }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("hygiene_checklist_items").update(rest).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("hygiene_checklist_items")
        .insert(payload as TablesInsert<"hygiene_checklist_items">);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-checklists"] }),
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hygiene_checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-checklists"] }),
  });
}

/* --------------------------------- Runs --------------------------------- */

export type RunWithRelations = HygieneRun & {
  hygiene_checklists: { name: string; shift: HygieneShift } | null;
  hygiene_checklist_answers: HygieneAnswer[];
};

export function useHygieneRuns(
  from?: string,
  to?: string,
  shift?: HygieneShift | "ALL",
  options?: { enabled?: boolean; refetchInterval?: number },
) {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["hyg-runs", tenantId, from, to, shift],
    enabled: !!tenantId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    queryFn: async () => {

      let q = supabase
        .from("hygiene_checklist_runs")
        .select("*, hygiene_checklists(name, shift), hygiene_checklist_answers(*)")
        .eq("restaurant_id", tenantId!)
        .order("run_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (from) q = q.gte("run_date", from);
      if (to) q = q.lte("run_date", to);
      if (shift && shift !== "ALL") q = q.eq("shift", shift);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as RunWithRelations[];
    },
  });
}

export function useStartRun() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { user, profile } = useCurrentUser();
  return useMutation({
    mutationFn: async (payload: { checklist_id: string; shift: HygieneShift; run_date: string }) => {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("hygiene_checklist_runs").insert({
        id,
        restaurant_id: tenantId!,
        checklist_id: payload.checklist_id,
        shift: payload.shift,
        run_date: payload.run_date,
        status: "EM_ANDAMENTO",
        performed_by: user?.id ?? null,
        performed_by_name: profile?.full_name ?? profile?.email ?? null,
      } as TablesInsert<"hygiene_checklist_runs">);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-runs"] }),
  });
}

export function useSaveAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      run_id: string;
      item_id: string;
      answer?: HygieneAnswerValue | null;
      numeric_value?: number | null;
      text_value?: string | null;
      corrective_action?: string | null;
    }) => {
      const { error } = await supabase
        .from("hygiene_checklist_answers")
        .upsert(payload as TablesInsert<"hygiene_checklist_answers">, { onConflict: "run_id,item_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-runs"] }),
  });
}

export function useCompleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; notes?: string | null }) => {
      const { error } = await supabase
        .from("hygiene_checklist_runs")
        .update({
          status: "CONCLUIDO",
          completed_at: new Date().toISOString(),
          notes: payload.notes ?? null,
        })
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-runs"] }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hygiene_checklist_runs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-runs"] }),
  });
}

/* ------------------------------ Shelf life ------------------------------ */

export type ShelfLifeWithIngredient = ShelfLifeItem & {
  ingredients: { name: string; unit: string } | null;
};

export function useShelfLifeItems(status?: HygieneShelfStatus | "ALL") {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["hyg-shelf", tenantId, status],
    enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase
        .from("hygiene_shelf_life_items")
        .select("*, ingredients(name, unit)")
        .eq("restaurant_id", tenantId!)
        .order("expires_at", { ascending: true });
      if (status && status !== "ALL") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ShelfLifeWithIngredient[];
    },
  });
}

export function useSaveShelfLifeItem() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  const { user } = useCurrentUser();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      product_name: string;
      ingredient_id?: string | null;
      batch_code?: string | null;
      opened_at: string;
      expires_at: string;
      storage_location?: string | null;
      quantity?: number | null;
      unit?: string | null;
    }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("hygiene_shelf_life_items").update(rest).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("hygiene_shelf_life_items").insert({
        ...payload,
        restaurant_id: tenantId!,
        created_by: user?.id ?? null,
      } as TablesInsert<"hygiene_shelf_life_items">);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-shelf"] }),
  });
}

export function useUpdateShelfStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      status: HygieneShelfStatus;
      discarded_reason?: string | null;
    }) => {
      const { error } = await supabase
        .from("hygiene_shelf_life_items")
        .update({
          status: payload.status,
          discarded_reason: payload.discarded_reason ?? null,
          discarded_at: payload.status === "ATIVO" ? null : new Date().toISOString(),
        })
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-shelf"] }),
  });
}

export function useDeleteShelfLifeItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hygiene_shelf_life_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hyg-shelf"] }),
  });
}

/* -------------------------------- Helpers ------------------------------- */

export type ShelfSeverity = "expired" | "warning" | "ok";

export function shelfSeverity(expires_at: string, warningDays = 2): ShelfSeverity {
  const t = new Date(today() + "T00:00:00");
  const e = new Date(expires_at + "T00:00:00");
  const diff = Math.round((e.getTime() - t.getTime()) / 86400000);
  if (diff < 0) return "expired";
  if (diff <= warningDays) return "warning";
  return "ok";
}

export function daysUntil(expires_at: string): number {
  const t = new Date(today() + "T00:00:00");
  const e = new Date(expires_at + "T00:00:00");
  return Math.round((e.getTime() - t.getTime()) / 86400000);
}

/** Valida se a resposta de um item numérico está fora da faixa esperada. */
export function isOutOfRange(item: HygieneChecklistItem, value: number | null): boolean {
  if (value === null || Number.isNaN(value)) return false;
  if (item.min_value !== null && value < Number(item.min_value)) return true;
  if (item.max_value !== null && value > Number(item.max_value)) return true;
  return false;
}

export function rangeLabel(item: HygieneChecklistItem): string {
  const unit = item.unit ? ` ${item.unit}` : "";
  if (item.min_value !== null && item.max_value !== null)
    return `Faixa: ${item.min_value}${unit} a ${item.max_value}${unit}`;
  if (item.min_value !== null) return `Mínimo: ${item.min_value}${unit}`;
  if (item.max_value !== null) return `Máximo: ${item.max_value}${unit}`;
  return "";
}
