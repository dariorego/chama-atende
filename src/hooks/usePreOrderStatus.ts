import { useQuery } from '@tanstack/react-query';
import { callPublicApi } from '@/lib/publicApi';
import type { PreOrder, PreOrderItem } from './usePreOrders';

export function usePreOrderStatus(orderId: string | undefined) {
  return useQuery({
    queryKey: ['pre-order-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await callPublicApi<{ data: (PreOrder & { items: PreOrderItem[] }) | null }>(
        'get-preorder-status',
        { orderId },
      );
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
