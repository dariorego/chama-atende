import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";
import { isAvailableNow, useAvailabilityClock } from "@/lib/availability";

export type MenuProduct = Tables<'menu_products'> & {
  category?: {
    slug: string;
    name: string;
    availability_enabled?: boolean | null;
    available_days?: number[] | null;
    available_from?: string | null;
    available_to?: string | null;
  } | null;
};

// Calculate promotion percentage from price difference
export function calculatePromotion(price: number, promotionalPrice: number | null): string | undefined {
  if (!promotionalPrice || promotionalPrice >= price) return undefined;
  const discount = Math.round(((price - promotionalPrice) / price) * 100);
  return `-${discount}%`;
}

export function useMenuProducts() {
  const { tenantId, tenant } = useTenant();
  const now = useAvailabilityClock();
  const timezone = tenant?.timezone ?? 'America/Sao_Paulo';

  const query = useQuery({
    queryKey: ['menu-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('menu_products')
        .select(`
          *,
          category:menu_categories(slug, name, availability_enabled, available_days, available_from, available_to)
        `)
        .eq('restaurant_id', tenantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as MenuProduct[];
    },
    enabled: !!tenantId,
  });

  // Hide products outside their availability window (category wins over item)
  const data = useMemo(() => {
    if (!query.data) return query.data;
    return query.data.filter(
      (p) =>
        isAvailableNow(p.category ?? null, timezone, now) &&
        isAvailableNow(p, timezone, now),
    );
  }, [query.data, timezone, now]);

  return { ...query, data } as typeof query;
}
