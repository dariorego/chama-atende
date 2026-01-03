import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface OrderLineItemSelection {
  id: string;
  line_item_id: string;
  combination_option_id: string;
  option_name: string;
  quantity: number;
  additional_price: number;
}

export interface OrderLineItem {
  id: string;
  order_id: string;
  order_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  observations: string | null;
  selections: OrderLineItemSelection[];
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: number;
  table_id: string | null;
  table_number: string | null;
  customer_name: string | null;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  observations: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  line_items: OrderLineItem[];
}

export function useAdminOrders(restaurantId?: string, status?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-orders", restaurantId, status],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("orders")
        .select(`
          *,
          order_line_items (
            *,
            order_line_item_selections (*)
          )
        `)
        .order("created_at", { ascending: false });

      if (restaurantId) {
        queryBuilder = queryBuilder.eq("restaurant_id", restaurantId);
      }

      if (status && status !== "all") {
        queryBuilder = queryBuilder.eq("status", status);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      
      return data.map((order: any) => ({
        ...order,
        line_items: (order.order_line_items || []).map((item: any) => ({
          ...item,
          selections: item.order_line_item_selections || [],
        })),
      })) as Order[];
    },
    enabled: !!restaurantId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient]);

  return query;
}

export function useOrderStats(restaurantId?: string) {
  return useQuery({
    queryKey: ["order-stats", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("restaurant_id", restaurantId);

      if (error) throw error;

      const stats = {
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
        total: data.length,
      };

      data.forEach((order) => {
        if (order.status in stats) {
          stats[order.status as keyof typeof stats]++;
        }
      });

      return stats;
    },
    enabled: !!restaurantId,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const timestamps: Record<string, string> = {};
      const now = new Date().toISOString();

      switch (status) {
        case "preparing":
          timestamps.preparing_at = now;
          break;
        case "ready":
          timestamps.ready_at = now;
          break;
        case "delivered":
          timestamps.delivered_at = now;
          break;
        case "cancelled":
          timestamps.cancelled_at = now;
          break;
      }

      const { data, error } = await supabase
        .from("orders")
        .update({ status, ...timestamps })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });
}
