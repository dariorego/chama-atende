import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  tableNumber: string;
  observations?: string;
  selections: OrderSelection[];
}

export interface SubmitOrderResult {
  orderId: string;
  orderNumber: number;
}

export function useSubmitOrder() {
  return useMutation({
    mutationFn: async (data: SubmitOrderData): Promise<SubmitOrderResult> => {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: data.restaurantId,
          table_number: data.tableNumber,
          observations: data.observations,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create line item
      const { data: lineItem, error: lineError } = await supabase
        .from("order_line_items")
        .insert({
          order_id: order.id,
          order_item_id: data.orderItemId,
          item_name: data.orderItemName,
          quantity: 1,
        })
        .select()
        .single();

      if (lineError) throw lineError;

      // 3. Create selections
      if (data.selections.length > 0) {
        const { error: selError } = await supabase
          .from("order_line_item_selections")
          .insert(
            data.selections.map((s) => ({
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
