import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderItemGroup {
  id: string;
  order_item_id: string;
  combination_group_id: string;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export function useItemGroups(orderItemId?: string) {
  return useQuery({
    queryKey: ["item-groups", orderItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_item_groups")
        .select(`
          *,
          order_combination_groups (*)
        `)
        .eq("order_item_id", orderItemId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!orderItemId,
  });
}

export function useLinkItemGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderItemId,
      combinationGroupId,
      isRequired = false,
      displayOrder = 1,
    }: {
      orderItemId: string;
      combinationGroupId: string;
      isRequired?: boolean;
      displayOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from("order_item_groups")
        .insert({
          order_item_id: orderItemId,
          combination_group_id: combinationGroupId,
          is_required: isRequired,
          display_order: displayOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      toast.success("Grupo vinculado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao vincular grupo: " + error.message);
    },
  });
}

export function useUnlinkItemGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_item_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      toast.success("Grupo desvinculado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao desvincular grupo: " + error.message);
    },
  });
}

export function useUpdateItemGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isRequired,
      displayOrder,
    }: {
      id: string;
      isRequired?: boolean;
      displayOrder?: number;
    }) => {
      const { data, error } = await supabase
        .from("order_item_groups")
        .update({
          is_required: isRequired,
          display_order: displayOrder,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      toast.success("Vínculo atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar vínculo: " + error.message);
    },
  });
}
