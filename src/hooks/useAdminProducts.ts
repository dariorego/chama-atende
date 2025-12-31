import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type MenuProduct = Tables<'menu_products'>;
export type MenuProductInsert = TablesInsert<'menu_products'>;
export type MenuProductUpdate = TablesUpdate<'menu_products'>;

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean | null;
}

export function useAdminProducts(restaurantId: string | undefined, filters?: ProductFilters) {
  return useQuery({
    queryKey: ['admin-products', restaurantId, filters],
    queryFn: async () => {
      let query = supabase
        .from('menu_products')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .order('display_order')
        .order('name');

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.isActive !== null && filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: MenuProductInsert) => {
      const { data, error } = await supabase
        .from('menu_products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', data.restaurant_id] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: MenuProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', data.restaurant_id] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurantId }: { id: string; restaurantId: string }) => {
      // Soft delete - apenas desativa o produto
      const { error } = await supabase
        .from('menu_products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { id, restaurantId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', data.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}
