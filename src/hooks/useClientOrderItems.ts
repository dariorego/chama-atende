import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItemTag {
  label: string;
  type: "positive" | "neutral" | "warning";
}

export interface ClientOrderItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  tags: OrderItemTag[];
  display_order: number | null;
}

export function useClientOrderItems(restaurantId?: string) {
  return useQuery({
    queryKey: ["client-order-items", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      return data.map((item) => ({
        ...item,
        tags: (item.tags as unknown as OrderItemTag[]) || [],
      })) as ClientOrderItem[];
    },
    enabled: !!restaurantId,
  });
}
