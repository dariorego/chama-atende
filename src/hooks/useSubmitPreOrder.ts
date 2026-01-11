import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CartItem } from './usePreOrderCart';

interface SubmitPreOrderData {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: 'pix' | 'card';
  observations?: string;
  items: CartItem[];
}

export function useSubmitPreOrder() {
  return useMutation({
    mutationFn: async (data: SubmitPreOrderData) => {
      // Get restaurant ID
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .single();

      if (restaurantError) throw restaurantError;

      // Calculate total amount
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      // Create pre-order
      const { data: preOrder, error: preOrderError } = await supabase
        .from('pre_orders')
        .insert({
          restaurant_id: restaurant.id,
          customer_name: data.customerName,
          customer_phone: data.customerPhone.replace(/\D/g, ''),
          pickup_date: data.pickupDate,
          pickup_time: data.pickupTime,
          payment_method: data.paymentMethod,
          observations: data.observations || null,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (preOrderError) throw preOrderError;

      // Create pre-order items
      const items = data.items.map((item) => ({
        pre_order_id: preOrder.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from('pre_order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return preOrder;
    },
    onSuccess: () => {
      toast.success('Encomenda realizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error submitting pre-order:', error);
      toast.error('Erro ao realizar encomenda');
    },
  });
}
