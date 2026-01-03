import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderLineItemSelection {
  id: string;
  option_name: string;
  quantity: number | null;
  additional_price: number | null;
}

export interface OrderLineItem {
  id: string;
  item_name: string;
  quantity: number | null;
  unit_price: number | null;
  observations: string | null;
  order_line_item_selections: OrderLineItemSelection[];
}

export interface OrderStatus {
  id: string;
  order_number: number;
  table_number: string | null;
  customer_name: string | null;
  status: string;
  observations: string | null;
  total_amount: number | null;
  created_at: string | null;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  order_line_items: OrderLineItem[];
}

export function useOrderStatus(orderId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order-status", orderId],
    queryFn: async (): Promise<OrderStatus> => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_line_items (
            *,
            order_line_item_selections (*)
          )
        `)
        .eq("id", orderId!)
        .single();

      if (error) throw error;
      return data as OrderStatus;
    },
    enabled: !!orderId,
  });

  // Realtime subscription for status updates
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["order-status", orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return query;
}

// Helper to calculate queue position
export function useQueuePosition(orderId?: string, restaurantId?: string) {
  return useQuery({
    queryKey: ["queue-position", orderId, restaurantId],
    queryFn: async () => {
      if (!orderId || !restaurantId) return null;

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at")
        .eq("restaurant_id", restaurantId)
        .in("status", ["pending", "preparing"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      const position = data.findIndex((order) => order.id === orderId);
      return {
        position: position >= 0 ? position + 1 : null,
        totalPending: data.length,
      };
    },
    enabled: !!orderId && !!restaurantId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
