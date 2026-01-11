import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PreOrderProduct = Tables<'menu_products'> & {
  category?: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

export function usePreOrderProducts() {
  return useQuery({
    queryKey: ['pre-order-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_products')
        .select(`
          *,
          category:menu_categories(id, slug, name)
        `)
        .eq('is_active', true)
        .eq('is_orderable', true)
        .order('display_order');

      if (error) throw error;
      return data as PreOrderProduct[];
    },
  });
}

export function usePreOrderCategories() {
  return useQuery({
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
          });
        }
        return acc;
      }, [] as { id: string; name: string; slug: string }[]);

      return uniqueCategories ?? [];
    },
  });
}
