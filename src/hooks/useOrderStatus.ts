import { useQuery } from "@tanstack/react-query";
import { callPublicApi } from "@/lib/publicApi";

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
  const query = useQuery({
    queryKey: ["order-status", orderId],
    queryFn: async (): Promise<OrderStatus> => {
      const { data } = await callPublicApi<{ data: OrderStatus | null }>("get-order-status", { orderId });
      if (!data) throw new Error("Pedido não encontrado");
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000,
  });

  return query;
}

// Helper to calculate queue position
export function useQueuePosition(orderId?: string, restaurantId?: string) {
  return useQuery({
    queryKey: ["queue-position", orderId, restaurantId],
    queryFn: async () => {
      if (!orderId || !restaurantId) return null;
      return callPublicApi<{ position: number | null; totalPending: number }>(
        "get-queue-position-for-order",
        { orderId, restaurantId },
      );
    },
    enabled: !!orderId && !!restaurantId,
    refetchInterval: 30000,
  });
}
