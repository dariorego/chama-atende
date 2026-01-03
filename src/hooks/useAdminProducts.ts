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

export function useAdminProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('menu_products')
        .select('*')
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
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('menu_products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}

export function useAdjustProductOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      categoryId,
      newOrder,
      oldOrder,
      currentProducts,
    }: {
      productId: string;
      categoryId: string;
      newOrder: number;
      oldOrder: number;
      currentProducts: MenuProduct[];
    }) => {
      if (oldOrder === newOrder) return true;

      // Filter only products from the same category
      const categoryProducts = currentProducts.filter(
        (p) => p.category_id === categoryId && p.id !== productId
      );

      const updates: { id: string; display_order: number }[] = [];

      for (const product of categoryProducts) {
        const productOrder = product.display_order ?? 0;

        if (newOrder < oldOrder) {
          // Moving up: products between [newOrder, oldOrder) go up by 1
          if (productOrder >= newOrder && productOrder < oldOrder) {
            updates.push({ id: product.id, display_order: productOrder + 1 });
          }
        } else {
          // Moving down: products between (oldOrder, newOrder] go down by 1
          if (productOrder > oldOrder && productOrder <= newOrder) {
            updates.push({ id: product.id, display_order: productOrder - 1 });
          }
        }
      }

      // Execute updates in batch
      if (updates.length > 0) {
        const promises = updates.map(({ id, display_order }) =>
          supabase
            .from('menu_products')
            .update({ display_order })
            .eq('id', id)
        );
        const results = await Promise.all(promises);
        const failed = results.find((r) => r.error);
        if (failed?.error) throw failed.error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}

export function useReorderProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: { id: string; display_order: number }[]) => {
      const promises = products.map(({ id, display_order }) =>
        supabase
          .from('menu_products')
          .update({ display_order })
          .eq('id', id)
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
    },
  });
}
