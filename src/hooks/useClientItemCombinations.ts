import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CombinationOption {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  additional_price: number | null;
  display_order: number | null;
}

export interface CombinationGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: string;
  min_selections: number | null;
  max_selections: number | null;
  is_required: boolean;
  display_order: number | null;
  options: CombinationOption[];
}

export function useClientItemCombinations(orderItemId?: string) {
  return useQuery({
    queryKey: ["client-item-combinations", orderItemId],
    queryFn: async () => {
      // Fetch item groups with combination groups and options
      const { data: itemGroups, error } = await supabase
        .from("order_item_groups")
        .select(`
          *,
          order_combination_groups (
            *,
            order_combination_options (*)
          )
        `)
        .eq("order_item_id", orderItemId!)
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Map to clean structure
      return itemGroups
        .filter((ig) => ig.order_combination_groups?.is_active)
        .map((ig): CombinationGroup => ({
          id: ig.order_combination_groups!.id,
          name: ig.order_combination_groups!.name,
          description: ig.order_combination_groups!.description,
          selection_type: ig.order_combination_groups!.selection_type || "multiple",
          min_selections: ig.order_combination_groups!.min_selections,
          max_selections: ig.order_combination_groups!.max_selections,
          is_required: ig.is_required || false,
          display_order: ig.display_order,
          options: (ig.order_combination_groups!.order_combination_options || [])
            .filter((o: { is_active: boolean | null }) => o.is_active)
            .sort((a: { display_order: number | null }, b: { display_order: number | null }) => 
              (a.display_order || 0) - (b.display_order || 0)
            ),
        }))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
    enabled: !!orderItemId,
  });
}

export function useClientOrderItem(orderItemId?: string) {
  return useQuery({
    queryKey: ["client-order-item", orderItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("id", orderItemId!)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderItemId,
  });
}
