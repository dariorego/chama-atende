import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PreOrder {
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
  updated_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  items?: PreOrderItem[];
}

export interface PreOrderItem {
  id: string;
  pre_order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  observations: string | null;
  created_at: string;
}

export function usePreOrders() {
  const queryClient = useQueryClient();

  const { data: preOrders, isLoading, error } = useQuery({
    queryKey: ['admin-pre-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_orders')
        .select(`
          *,
          items:pre_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PreOrder[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      // Set timestamp based on status
      const now = new Date().toISOString();
      if (status === 'confirmed') updates.confirmed_at = now;
      if (status === 'preparing') updates.preparing_at = now;
      if (status === 'ready') updates.ready_at = now;
      if (status === 'delivered') updates.delivered_at = now;
      if (status === 'cancelled') updates.cancelled_at = now;

      const { error } = await supabase
        .from('pre_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pre-orders'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating pre-order status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  const saveResponseMutation = useMutation({
    mutationFn: async ({ 
      id, 
      adminResponse 
    }: { 
      id: string; 
      adminResponse: string;
    }) => {
      const { error } = await supabase
        .from('pre_orders')
        .update({ admin_response: adminResponse })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pre-orders'] });
      toast.success('Resposta salva com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving admin response:', error);
      toast.error('Erro ao salvar resposta');
    },
  });

  return {
    preOrders,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    saveResponse: saveResponseMutation.mutate,
    isSavingResponse: saveResponseMutation.isPending,
  };
}
