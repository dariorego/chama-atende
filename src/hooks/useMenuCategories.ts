import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MenuCategory = Tables<'menu_categories'>;

export function useMenuCategories(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}
