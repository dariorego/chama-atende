import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CombinationGroup {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  selection_type: "single" | "multiple" | "quantity";
  min_selections: number;
  max_selections: number | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CombinationOption {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  additional_price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CombinationGroupWithOptions extends CombinationGroup {
  options: CombinationOption[];
}

export interface CombinationGroupFormData {
  restaurant_id: string;
  name: string;
  description?: string;
  selection_type?: "single" | "multiple" | "quantity";
  min_selections?: number;
  max_selections?: number | null;
  is_required?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface CombinationOptionFormData {
  group_id: string;
  name: string;
  description?: string;
  emoji?: string;
  additional_price?: number;
  is_active?: boolean;
  display_order?: number;
}

export function useAdminCombinationGroups(restaurantId?: string) {
  return useQuery({
    queryKey: ["admin-combination-groups", restaurantId],
    queryFn: async () => {
      let query = supabase
        .from("order_combination_groups")
        .select("*")
        .order("display_order", { ascending: true });

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CombinationGroup[];
    },
    enabled: !!restaurantId,
  });
}

export function useAdminCombinationGroupsWithOptions(restaurantId?: string) {
  return useQuery({
    queryKey: ["admin-combination-groups-with-options", restaurantId],
    queryFn: async () => {
      let query = supabase
        .from("order_combination_groups")
        .select(`
          *,
          order_combination_options (*)
        `)
        .order("display_order", { ascending: true });

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data.map((group: any) => ({
        ...group,
        options: group.order_combination_options || [],
      })) as CombinationGroupWithOptions[];
    },
    enabled: !!restaurantId,
  });
}

export function useCreateCombinationGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CombinationGroupFormData) => {
      const { data: result, error } = await supabase
        .from("order_combination_groups")
        .insert({
          restaurant_id: data.restaurant_id,
          name: data.name,
          description: data.description || null,
          selection_type: data.selection_type || "multiple",
          min_selections: data.min_selections || 0,
          max_selections: data.max_selections ?? null,
          is_required: data.is_required ?? false,
          is_active: data.is_active ?? true,
          display_order: data.display_order || 1,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups"] });
      toast.success("Grupo criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar grupo: " + error.message);
    },
  });
}

export function useUpdateCombinationGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CombinationGroupFormData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("order_combination_groups")
        .update({
          name: data.name,
          description: data.description,
          selection_type: data.selection_type,
          min_selections: data.min_selections,
          max_selections: data.max_selections,
          is_required: data.is_required,
          is_active: data.is_active,
          display_order: data.display_order,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups"] });
      toast.success("Grupo atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar grupo: " + error.message);
    },
  });
}

export function useDeleteCombinationGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_combination_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups"] });
      toast.success("Grupo excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir grupo: " + error.message);
    },
  });
}

// Options CRUD
export function useAdminCombinationOptions(groupId?: string) {
  return useQuery({
    queryKey: ["admin-combination-options", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_combination_options")
        .select("*")
        .eq("group_id", groupId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CombinationOption[];
    },
    enabled: !!groupId,
  });
}

export function useCreateCombinationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CombinationOptionFormData) => {
      const { data: result, error } = await supabase
        .from("order_combination_options")
        .insert({
          group_id: data.group_id,
          name: data.name,
          description: data.description || null,
          emoji: data.emoji || null,
          additional_price: data.additional_price || 0,
          is_active: data.is_active ?? true,
          display_order: data.display_order || 1,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-options"] });
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups-with-options"] });
      toast.success("Opção criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar opção: " + error.message);
    },
  });
}

export function useUpdateCombinationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CombinationOptionFormData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("order_combination_options")
        .update({
          name: data.name,
          description: data.description,
          emoji: data.emoji,
          additional_price: data.additional_price,
          is_active: data.is_active,
          display_order: data.display_order,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-options"] });
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups-with-options"] });
      toast.success("Opção atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar opção: " + error.message);
    },
  });
}

export function useDeleteCombinationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_combination_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-combination-options"] });
      queryClient.invalidateQueries({ queryKey: ["admin-combination-groups-with-options"] });
      toast.success("Opção excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir opção: " + error.message);
    },
  });
}
