import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type MenuProduct = Tables<'menu_products'> & {
  category?: {
    slug: string;
    name: string;
  } | null;
};

// Calculate promotion percentage from price difference
export function calculatePromotion(price: number, promotionalPrice: number | null): string | undefined {
  if (!promotionalPrice || promotionalPrice >= price) return undefined;
  const discount = Math.round(((price - promotionalPrice) / price) * 100);
  return `-${discount}%`;
}

export function useMenuProducts() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['menu-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('menu_products')
        .select(`
          *,
          category:menu_categories(slug, name)
        `)
        .eq('restaurant_id', tenantId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as MenuProduct[];
    },
    enabled: !!tenantId,
  });
}
