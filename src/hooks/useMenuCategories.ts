import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";
import { isAvailableNow, useAvailabilityClock } from "@/lib/availability";

export type MenuCategory = Tables<'menu_categories'>;

export function useMenuCategories() {
  const { tenantId, tenant } = useTenant();
  const now = useAvailabilityClock();
  const timezone = tenant?.timezone ?? 'America/Sao_Paulo';

  const query = useQuery({
    queryKey: ['menu-categories', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', tenantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // Hide categories outside their availability window
  const data = useMemo(() => {
    if (!query.data) return query.data;
    return query.data.filter((cat) => isAvailableNow(cat, timezone, now));
  }, [query.data, timezone, now]);

  return { ...query, data } as typeof query;
}
