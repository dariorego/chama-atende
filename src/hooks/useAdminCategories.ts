import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MenuCategory = Tables<'menu_categories'>;

export function useAdminCategories(restaurantId: string | undefined, includeInactive = true) {
  return useQuery({
    queryKey: ['admin-categories', restaurantId, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .order('display_order')
        .order('name');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}
