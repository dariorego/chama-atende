import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Comanda {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  table_session_id: string | null;
  code: string;
  sequence: number;
  customer_name: string | null;
  status: "open" | "bill_requested" | "closed" | "cancelled";
  waiter_id: string | null;
  opened_at: string;
  bill_requested_at: string | null;
  closed_at: string | null;
  total_amount: number;
  notes: string | null;
  tables?: { number: number; name: string | null } | null;
  waiters?: { name: string } | null;
}

interface UseComandasArgs {
  restaurantId?: string;
  status?: string;
  tableId?: string;
}

export function useComandas({ restaurantId, status, tableId }: UseComandasArgs) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["comandas", restaurantId, status, tableId],
    queryFn: async () => {
      let q = supabase
        .from("comandas")
        .select("*, tables(number, name), waiters(name)")
        .order("opened_at", { ascending: false });

      if (restaurantId) q = q.eq("restaurant_id", restaurantId);
      if (status && status !== "all") q = q.eq("status", status);
      if (tableId) q = q.eq("table_id", tableId);

      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Comanda[];
    },
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (!restaurantId) return;
    const channelName = `comandas-${restaurantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comandas", filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comandas"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient]);

  return query;
}

export function useOpenComanda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      restaurantId: string;
      tableId: string | null;
      customerName?: string | null;
      waiterId?: string | null;
      tableSessionId?: string | null;
      notes?: string | null;
    }) => {
      const { data: gen, error: genErr } = await supabase.rpc("generate_comanda_code", {
        _restaurant_id: input.restaurantId,
        _table_id: input.tableId,
      });
      if (genErr) throw genErr;
      const row = Array.isArray(gen) ? gen[0] : gen;
      const code = row?.code as string;
      const sequence = row?.sequence as number;

      const { data, error } = await supabase
        .from("comandas")
        .insert({
          restaurant_id: input.restaurantId,
          table_id: input.tableId,
          table_session_id: input.tableSessionId ?? null,
          waiter_id: input.waiterId ?? null,
          customer_name: input.customerName ?? null,
          notes: input.notes ?? null,
          code,
          sequence,
          status: "open",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comandas"] });
      toast.success("Comanda aberta!");
    },
    onError: (e: Error) => toast.error("Erro ao abrir comanda: " + e.message),
  });
}

export function useUpdateComanda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Comanda> & { id: string }) => {
      const { data, error } = await supabase
        .from("comandas")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comandas"] });
    },
    onError: (e: Error) => toast.error("Erro ao atualizar comanda: " + e.message),
  });
}

export function useRequestComandaBill() {
  const update = useUpdateComanda();
  return (id: string) =>
    update.mutate({ id, status: "bill_requested", bill_requested_at: new Date().toISOString() });
}

export function useCloseComanda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("comandas")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comandas"] });
      toast.success("Comanda encerrada!");
    },
    onError: (e: Error) => toast.error("Erro ao encerrar comanda: " + e.message),
  });
}

export interface ComandaLineItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  observations: string | null;
  selections: {
    id: string;
    option_name: string;
    quantity: number;
    additional_price: number;
  }[];
}

export function useComandaItems(comandaId?: string) {
  return useQuery({
    queryKey: ["comanda-items", comandaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_line_items")
        .select("*, order_line_item_selections(*)")
        .eq("comanda_id", comandaId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((li: {
        id: string;
        item_name: string;
        quantity: number;
        unit_price: number;
        observations: string | null;
        order_line_item_selections: Array<{
          id: string;
          option_name: string;
          quantity: number;
          additional_price: number;
        }>;
      }) => ({
        id: li.id,
        item_name: li.item_name,
        quantity: li.quantity,
        unit_price: li.unit_price,
        observations: li.observations,
        selections: li.order_line_item_selections ?? [],
      })) as ComandaLineItem[];
    },
    enabled: !!comandaId,
  });
}