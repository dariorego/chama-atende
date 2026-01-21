import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type MenuCategory = Tables<'menu_categories'>;
export type CategoryInsert = TablesInsert<'menu_categories'>;
export type CategoryUpdate = TablesUpdate<'menu_categories'>;

export function useAdminCategories(includeInactive = true) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['admin-categories', tenantId, includeInactive],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', tenantId)
        .order('display_order')
        .order('name');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categories: { id: string; display_order: number }[]) => {
      const updates = categories.map(({ id, display_order }) =>
        supabase
          .from('menu_categories')
          .update({ display_order })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Erro ao reordenar categorias');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
}

export function useAdjustCategoryOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      categoryId,
      newOrder,
      currentCategories,
    }: {
      categoryId: string;
      newOrder: number;
      currentCategories: MenuCategory[];
    }) => {
      const category = currentCategories.find(c => c.id === categoryId);
      if (!category) throw new Error('Categoria não encontrada');
      
      const oldOrder = category.display_order ?? 1;
      
      if (oldOrder === newOrder) return true;
      
      const updates: { id: string; display_order: number }[] = [];
      
      for (const cat of currentCategories) {
        if (cat.id === categoryId) continue;
        
        const catOrder = cat.display_order ?? 1;
        
        if (newOrder < oldOrder) {
          // Movendo para cima: categorias entre [newOrder, oldOrder) sobem 1
          if (catOrder >= newOrder && catOrder < oldOrder) {
            updates.push({ id: cat.id, display_order: catOrder + 1 });
          }
        } else {
          // Movendo para baixo: categorias entre (oldOrder, newOrder] descem 1
          if (catOrder > oldOrder && catOrder <= newOrder) {
            updates.push({ id: cat.id, display_order: catOrder - 1 });
          }
        }
      }
      
      if (updates.length > 0) {
        const promises = updates.map(({ id, display_order }) =>
          supabase
            .from('menu_categories')
            .update({ display_order })
            .eq('id', id)
        );
        await Promise.all(promises);
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    },
  });
}
