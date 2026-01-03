import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderItemTag {
  label: string;
  type: "positive" | "neutral" | "warning";
}

export interface OrderItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  tags: OrderItemTag[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItemFormData {
  restaurant_id: string;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  tags?: OrderItemTag[];
  is_active?: boolean;
  display_order?: number;
}

export function useAdminOrderItems(restaurantId?: string) {
  return useQuery({
    queryKey: ["admin-order-items", restaurantId],
    queryFn: async () => {
      let query = supabase
        .from("order_items")
        .select("*")
        .order("display_order", { ascending: true });

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map((item) => ({
        ...item,
        tags: (item.tags as unknown as OrderItemTag[]) || [],
      })) as OrderItem[];
    },
    enabled: !!restaurantId,
  });
}

export function useCreateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderItemFormData) => {
      const { data: result, error } = await supabase
        .from("order_items")
        .insert({
          restaurant_id: data.restaurant_id,
          name: data.name,
          description: data.description || null,
          image_url: data.image_url || null,
          price: data.price || 0,
          tags: (data.tags as unknown as any) || [],
          is_active: data.is_active ?? true,
          display_order: data.display_order || 1,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-items"] });
      toast.success("Item criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar item: " + error.message);
    },
  });
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<OrderItemFormData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("order_items")
        .update({
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          price: data.price,
          tags: (data.tags as unknown as any),
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
      queryClient.invalidateQueries({ queryKey: ["admin-order-items"] });
      toast.success("Item atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar item: " + error.message);
    },
  });
}

export function useDeleteOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-items"] });
      toast.success("Item excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir item: " + error.message);
    },
  });
}
