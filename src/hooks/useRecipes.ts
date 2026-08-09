import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useTenant } from "@/hooks/useTenant";

export type Recipe = Tables<"recipes">;
export type RecipeComponent = Tables<"recipe_components">;
export type RecipeStep = Tables<"recipe_steps">;
export type RecipePricing = Tables<"recipe_pricing">;

export function useRecipes() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-recipes", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useRecipe(recipeId?: string) {
  return useQuery({
    queryKey: ["ft-recipe", recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const [recipe, components, steps, pricing] = await Promise.all([
        supabase.from("recipes").select("*").eq("id", recipeId!).maybeSingle(),
        supabase
          .from("recipe_components")
          .select("*")
          .eq("recipe_id", recipeId!)
          .order("display_order", { ascending: true, nullsFirst: false }),
        supabase
          .from("recipe_steps")
          .select("*")
          .eq("recipe_id", recipeId!)
          .order("step_order"),
        supabase.from("recipe_pricing").select("*").eq("recipe_id", recipeId!).maybeSingle(),
      ]);
      if (recipe.error) throw recipe.error;
      if (components.error) throw components.error;
      if (steps.error) throw steps.error;
      if (pricing.error) throw pricing.error;
      return {
        recipe: recipe.data,
        components: components.data ?? [],
        steps: steps.data ?? [],
        pricing: pricing.data,
      };
    },
  });
}

export function useSaveRecipe() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: Partial<Recipe> & { name: string }) => {
      if (payload.id) {
        const { id, total_cost: _t, unit_cost: _u, ...rest } = payload as Recipe;
        const { error } = await supabase
          .from("recipes")
          .update(rest as TablesUpdate<"recipes">)
          .eq("id", id);
        if (error) throw error;
        return id;
      }
      const { total_cost: _t, unit_cost: _u, ...rest } = payload as Recipe;
      const { data, error } = await supabase
        .from("recipes")
        .insert({ ...rest, restaurant_id: tenantId! } as TablesInsert<"recipes">)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return data?.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
      qc.invalidateQueries({ queryKey: ["ft-recipe"] });
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-recipes"] }),
  });
}

export function useSaveComponent() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: Partial<RecipeComponent> & { recipe_id: string }) => {
      if (payload.id) {
        const { id, cost: _c, ...rest } = payload as RecipeComponent;
        const { error } = await supabase
          .from("recipe_components")
          .update(rest as TablesUpdate<"recipe_components">)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { cost: _c, ...rest } = payload as RecipeComponent;
        const { error } = await supabase
          .from("recipe_components")
          .insert({ ...rest, restaurant_id: tenantId! } as TablesInsert<"recipe_components">);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-recipe"] });
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
    },
  });
}

export function useDeleteComponent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipe_components").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-recipe"] });
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
    },
  });
}

export function useSaveSteps() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async ({
      recipeId,
      steps,
    }: {
      recipeId: string;
      steps: { description: string }[];
    }) => {
      const del = await supabase.from("recipe_steps").delete().eq("recipe_id", recipeId);
      if (del.error) throw del.error;
      const rows = steps
        .filter((s) => s.description.trim())
        .map((s, i) => ({
          recipe_id: recipeId,
          restaurant_id: tenantId!,
          step_order: i + 1,
          description: s.description.trim(),
        }));
      if (rows.length) {
        const { error } = await supabase.from("recipe_steps").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ft-recipe"] }),
  });
}

export function useSavePricing() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (payload: {
      recipe_id: string;
      target_cmv?: number;
      selling_price?: number | null;
      packaging_cost?: number;
      treatment_tag?: string | null;
    }) => {
      const { error } = await supabase
        .from("recipe_pricing")
        .upsert({ ...payload, restaurant_id: tenantId! } as TablesInsert<"recipe_pricing">, {
          onConflict: "recipe_id",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-recipe"] });
      qc.invalidateQueries({ queryKey: ["ft-pricing"] });
    },
  });
}

/** Precificação de todas as fichas — usado no painel de CMV. */
export function useAllPricing() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: ["ft-pricing", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_pricing")
        .select("*")
        .eq("restaurant_id", tenantId!);
      if (error) throw error;
      return data;
    },
  });
}

export function usePublishRecipe() {
  const qc = useQueryClient();
  const { tenantId } = useTenant();
  return useMutation({
    mutationFn: async (recipeId: string) => {
      const [recipe, components, steps, versions] = await Promise.all([
        supabase.from("recipes").select("*").eq("id", recipeId).maybeSingle(),
        supabase.from("recipe_components").select("*").eq("recipe_id", recipeId),
        supabase.from("recipe_steps").select("*").eq("recipe_id", recipeId),
        supabase
          .from("recipe_versions")
          .select("version")
          .eq("recipe_id", recipeId)
          .order("version", { ascending: false })
          .limit(1),
      ]);
      if (recipe.error) throw recipe.error;
      if (!recipe.data) throw new Error("Ficha não encontrada");
      const nextVersion = (versions.data?.[0]?.version ?? 0) + 1;
      const ins = await supabase.from("recipe_versions").insert({
        recipe_id: recipeId,
        restaurant_id: tenantId!,
        version: nextVersion,
        total_cost: recipe.data.total_cost,
        unit_cost: recipe.data.unit_cost,
        snapshot: JSON.parse(
          JSON.stringify({
            recipe: recipe.data,
            components: components.data ?? [],
            steps: steps.data ?? [],
          }),
        ),
      });
      if (ins.error) throw ins.error;
      const upd = await supabase.from("recipes").update({ status: "PUBLICADA" }).eq("id", recipeId);
      if (upd.error) throw upd.error;
      return nextVersion;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ft-recipe"] });
      qc.invalidateQueries({ queryKey: ["ft-recipes"] });
      qc.invalidateQueries({ queryKey: ["ft-versions"] });
    },
  });
}

export function useRecipeVersions(recipeId?: string) {
  return useQuery({
    queryKey: ["ft-versions", recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_versions")
        .select("id, version, published_at, total_cost, unit_cost")
        .eq("recipe_id", recipeId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}