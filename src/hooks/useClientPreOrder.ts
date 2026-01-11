import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PreOrderSearchResult {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  observations: string | null;
  total_amount: number;
  payment_method: string | null;
  admin_response: string | null;
  created_at: string;
}

export function useSearchPreOrders(phone: string | null) {
  return useQuery({
    queryKey: ['client-pre-orders', phone],
    queryFn: async () => {
      if (!phone) return [];
      
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) return [];

      const { data, error } = await supabase.rpc('search_pre_orders_by_phone', {
        search_phone: cleanPhone,
      });

      if (error) throw error;
      return data as PreOrderSearchResult[];
    },
    enabled: !!phone && phone.replace(/\D/g, '').length >= 10,
  });
}
