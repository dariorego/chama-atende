import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables, TablesInsert } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type WasteEntry = Tables<"waste_entries">;
export type WasteReason = Enums<"waste_reason">;
export type InventoryCount = Tables<"inventory_counts">;
export type InventoryCountLine = Tables<"inventory_count_lines">;

export const WASTE_REASON_LABELS: Record<WasteReason, string> = {
  ESTRAGOU: "Estragou",
  QUEBRA: "Quebra / perda",
  VENCIMENTO: "Vencimento",
  ERRO_PREPARO: "Erro de preparo",
  DEVOLUCAO: "Devolução",
  OUTRO: "Outro",
};

export function useWasteEntries(from?: string, to?: string) {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-waste", tenantId, from, to],
    enabled: !!tenantId,
    queryFn: async () => {
      let q = supabase
        .from("waste_entries")
        .select("*, ingredients(name, unit)")
        .eq("restaurant_id", tenantId!)
        .order("entry_date", { ascending: false });
      if (from) q = q.gte("entry_date", from);
      if (to) q = q.lte("entry_date", to);
      const { data, error } = await q;
      if (error) throw error;
      return data as (WasteEntry & { ingredients: { name: string; unit: string } | null })[];
    },
  });
}

export function useCreateWaste() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: {
      ingredient_id: string;
      quantity: number;
      reason: WasteReason;
      entry_date: string;
      notes?: string | null;
    }) => {
      const { error } = await supabase
        .from("waste_entries")
        .insert({ ...payload, restaurant_id: tenantId! } as TablesInsert<"waste_entries">);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-waste"] }),
  });
}

export function useDeleteWaste() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waste_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-waste"] }),
  });
}

export function useInventoryCounts() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-counts", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_counts")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("count_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCount() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: { name: string; count_date: string }) => {
      const { data, error } = await supabase
        .from("inventory_counts")
        .insert({ ...payload, restaurant_id: tenantId! })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return data?.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-counts"] }),
  });
}

export function useCountLines(countId?: string) {
  return useQuery({
    queryKey: ["ft-count-lines", countId],
    enabled: !!countId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_count_lines")
        .select("*, ingredients(name, unit)")
        .eq("count_id", countId!);
      if (error) throw error;
      return data as (InventoryCountLine & { ingredients: { name: string; unit: string } | null })[];
    },
  });
}

export function useSaveCountLine() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: { count_id: string; ingredient_id: string; quantity: number }) => {
      const { error } = await supabase
        .from("inventory_count_lines")
        .insert({ ...payload, restaurant_id: tenantId! } as TablesInsert<"inventory_count_lines">);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-count-lines"] });
      qc.invalidateQueries({ queryKey: ["ft-counts"] });
    },
  });
}

export function useDeleteCountLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_count_lines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-count-lines"] });
      qc.invalidateQueries({ queryKey: ["ft-counts"] });
    },
  });
}

export function useCloseCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_counts")
        .update({ status: "FECHADO", closed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-counts"] }),
  });
}