import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PreOrder, PreOrderItem } from './usePreOrders';

export function usePreOrderStatus(orderId: string | undefined) {
  return useQuery({
    queryKey: ['pre-order-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('pre_orders')
        .select(`
          *,
          items:pre_order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as PreOrder & { items: PreOrderItem[] };
    },
    enabled: !!orderId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
