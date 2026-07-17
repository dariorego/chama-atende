import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { callPublicApi } from "@/lib/publicApi";

export interface OrderSelection {
  optionId: string;
  optionName: string;
  quantity: number;
  additionalPrice: number;
}

export interface SubmitOrderData {
  restaurantId: string;
  orderItemId: string;
  orderItemName: string;
  customerName: string;
  tableNumber: string;
  observations?: string;
  selections: OrderSelection[];
}

export interface SubmitOrderResult {
  orderId: string;
  orderNumber: number;
}

export function useSubmitOrder() {
  const schema = z.object({
    restaurantId: z.string().uuid(),
    orderItemId: z.string().uuid(),
    orderItemName: z.string().trim().min(1).max(200),
    customerName: z.string().trim().max(100).optional().or(z.literal("")),
    tableNumber: z.string().trim().min(1).max(20),
    observations: z.string().trim().max(1000).optional(),
    selections: z.array(z.object({
      optionId: z.string().uuid(),
      optionName: z.string().max(200),
      quantity: z.number().int().min(1).max(100),
      additionalPrice: z.number().min(0),
    })),
  });

  return useMutation({
    mutationFn: async (data: SubmitOrderData): Promise<SubmitOrderResult> => {
      const validated = schema.parse(data);
      // 1. Create order via edge function (RLS blocks direct SELECT)
      const { data: order } = await callPublicApi<{ data: { id: string; order_number: number } }>(
        "create-order",
        {
          restaurantId: validated.restaurantId,
          customerName: validated.customerName || null,
          tableNumber: validated.tableNumber,
          observations: validated.observations || null,
        },
      );

      // 2. Create line item
      const { data: lineItem, error: lineError } = await supabase
        .from("order_line_items")
        .insert({
          order_id: order.id,
          order_item_id: validated.orderItemId,
          item_name: validated.orderItemName,
          quantity: 1,
        })
        .select()
        .single();

      if (lineError) throw lineError;

      // 3. Create selections
      if (validated.selections.length > 0) {
        const { error: selError } = await supabase
          .from("order_line_item_selections")
          .insert(
            validated.selections.map((s) => ({
              line_item_id: lineItem.id,
              combination_option_id: s.optionId,
              option_name: s.optionName,
              quantity: s.quantity,
              additional_price: s.additionalPrice,
            }))
          );

        if (selError) throw selError;
      }

      return { orderId: order.id, orderNumber: order.order_number };
    },
    onError: (error) => {
      console.error("Error submitting order:", error);
      toast.error("Erro ao enviar pedido");
    },
  });
}
