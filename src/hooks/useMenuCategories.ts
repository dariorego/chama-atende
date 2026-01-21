import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type MenuCategory = Tables<'menu_categories'>;

export function useMenuCategories() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['menu-categories', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', tenantId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}
