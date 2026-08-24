import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { isAvailableNow, useAvailabilityClock } from "@/lib/availability";

export type PreOrderProduct = Tables<'menu_products'> & {
  category?: {
    id: string;
    slug: string;
    name: string;
    availability_enabled?: boolean | null;
    available_days?: number[] | null;
    available_from?: string | null;
    available_to?: string | null;
  } | null;
};

export function usePreOrderProducts() {
  const now = useAvailabilityClock();

  const query = useQuery({
    queryKey: ['pre-order-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_products')
        .select(`
          *,
          category:menu_categories(id, slug, name, availability_enabled, available_days, available_from, available_to)
        `)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .order('display_order');

      if (error) throw error;
      return data as PreOrderProduct[];
    },
  });

  // Hide products outside their availability window (category wins over item)
  const data = useMemo(() => {
    if (!query.data) return query.data;
    return query.data.filter(
      (p) => isAvailableNow(p.category ?? null, undefined, now) && isAvailableNow(p, undefined, now),
    );
  }, [query.data, now]);

  return { ...query, data } as typeof query;
}

export interface PreOrderCategory {
  id: string;
  name: string;
  slug: string;
  availability_enabled?: boolean | null;
  available_days?: number[] | null;
  available_from?: string | null;
  available_to?: string | null;
}

export function usePreOrderCategories() {
  const now = useAvailabilityClock();

  const query = useQuery({
    queryKey: ['pre-order-categories'],
    queryFn: async () => {
      // Get categories that have at least one orderable product
      const { data, error } = await supabase
        .from('menu_categories')
        .select(`
          id,
          name,
          slug,
          display_order,
          availability_enabled,
          available_days,
          available_from,
          available_to,
          menu_products!inner(id)
        `)
        .eq('is_active', true)
        .eq('menu_products.is_active', true)
        .eq('menu_products.is_orderable', true)
        .order('display_order');

      if (error) throw error;
      
      // Remove duplicates and format
      const uniqueCategories = data?.reduce((acc, cat) => {
        if (!acc.find(c => c.id === cat.id)) {
          acc.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            availability_enabled: cat.availability_enabled,
            available_days: cat.available_days,
            available_from: cat.available_from,
            available_to: cat.available_to,
          });
        }
        return acc;
      }, [] as PreOrderCategory[]);

      return uniqueCategories ?? [];
    },
  });

  // Hide categories outside their availability window
  const data = useMemo(() => {
    if (!query.data) return query.data;
    return query.data.filter((cat) => isAvailableNow(cat, undefined, now));
  }, [query.data, now]);

  return { ...query, data } as typeof query;
}
