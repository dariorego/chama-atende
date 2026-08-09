import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type Supplier = Tables<"suppliers">;
export type IngredientCategory = Tables<"ingredient_categories">;
export type Ingredient = Tables<"ingredients">;
export type IngredientQuote = Tables<"ingredient_quotes">;

export function useSuppliers() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-suppliers", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveSupplier() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier> & { name: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("suppliers").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("suppliers")
          .insert({ ...payload, restaurant_id: tenantId! } as TablesInsert<"suppliers">);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-suppliers"] }),
  });
}

export function useIngredientCategories() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-ing-categories", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredient_categories")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveIngredientCategory() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: { id?: string; name: string; is_active?: boolean }) => {
      if (payload.id) {
        const { error } = await supabase
          .from("ingredient_categories")
          .update({ name: payload.name, is_active: payload.is_active })
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ingredient_categories")
          .insert({ name: payload.name, restaurant_id: tenantId! });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-ing-categories"] }),
  });
}

export function useIngredients() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-ingredients", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveIngredient() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: Partial<Ingredient> & { name: string }) => {
      if (payload.id) {
        const { id, correction_factor: _fc, ...rest } = payload as Ingredient;
        const { error } = await supabase
          .from("ingredients")
          .update(rest as TablesUpdate<"ingredients">)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { correction_factor: _fc, ...rest } = payload as Ingredient;
        const { error } = await supabase
          .from("ingredients")
          .insert({ ...rest, restaurant_id: tenantId! } as TablesInsert<"ingredients">);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-ingredients"] });
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
    },
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ingredients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-ingredients"] }),
  });
}

export function useIngredientQuotes(ingredientId?: string) {
  return useQuery({
    queryKey: ["ft-quotes", ingredientId],
    enabled: !!ingredientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredient_quotes")
        .select("*")
        .eq("ingredient_id", ingredientId!)
        .order("quoted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: {
      ingredient_id: string;
      unit_price: number;
      package_price?: number | null;
      package_weight?: number | null;
      supplier_id?: string | null;
      quoted_at?: string;
      source?: string;
    }) => {
      const { error } = await supabase
        .from("ingredient_quotes")
        .insert({ ...payload, restaurant_id: tenantId! } as TablesInsert<"ingredient_quotes">);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-quotes"] });
      qc.invalidateQueries({ queryKey: ["ft-ingredients"] });
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
    },
  });
}

/** Quantas fichas usam cada insumo — para o painel de impacto. */
export function useIngredientUsage() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-ingredient-usage", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_components")
        .select("ingredient_id, recipe_id")
        .eq("restaurant_id", tenantId!)
        .not("ingredient_id", "is", null);
      if (error) throw error;
      const map: Record<string, Set<string>> = {};
      for (const row of data ?? []) {
        const key = row.ingredient_id as string;
        map[key] = map[key] ?? new Set();
        map[key].add(row.recipe_id);
      }
      return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.size]));
    },
  });
}