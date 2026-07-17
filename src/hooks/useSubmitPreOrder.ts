import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { callPublicApi } from '@/lib/publicApi';
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
  const schema = z.object({
    customerName: z.string().trim().min(1).max(100),
    customerPhone: z.string().trim().min(8).max(20),
    pickupDate: z.string().min(1),
    pickupTime: z.string().min(1),
    paymentMethod: z.enum(['pix', 'card']),
    observations: z.string().trim().max(1000).optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      productName: z.string().max(200),
      quantity: z.number().int().min(1).max(100),
      unitPrice: z.number().min(0),
    })).min(1),
  });

  return useMutation({
    mutationFn: async (data: SubmitPreOrderData) => {
      const validated = schema.parse(data);
      // Get restaurant ID
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .single();

      if (restaurantError) throw restaurantError;

      // Calculate total amount
      const totalAmount = validated.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      // Create pre-order via edge function (RLS blocks SELECT for anon)
      const { data: preOrder } = await callPublicApi<{ data: { id: string; order_number: number } }>('create-preorder', {
        preOrder: {
          restaurant_id: restaurant.id,
          customer_name: validated.customerName,
          customer_phone: validated.customerPhone.replace(/\D/g, ''),
          pickup_date: validated.pickupDate,
          pickup_time: validated.pickupTime,
          payment_method: validated.paymentMethod,
          observations: validated.observations || null,
          total_amount: totalAmount,
          status: 'pending',
        },
        items: validated.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      });

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
