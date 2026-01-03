import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Waiter {
  id: string;
  user_id: string | null;
  name: string;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WaiterInsert = Omit<Waiter, 'id' | 'created_at' | 'updated_at'>;
export type WaiterUpdate = Partial<WaiterInsert>;

export function useAdminWaiters() {
  return useQuery({
    queryKey: ["admin-waiters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waiters")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Waiter[];
    },
  });
}

export function useCreateWaiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (waiter: WaiterInsert) => {
      const { data, error } = await supabase
        .from("waiters")
        .insert(waiter)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waiters"] });
      toast({ title: "Atendente criado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar atendente", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWaiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: WaiterUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("waiters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waiters"] });
      toast({ title: "Atendente atualizado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar atendente", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWaiter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waiters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-waiters"] });
      toast({ title: "Atendente excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir atendente", description: error.message, variant: "destructive" });
    },
  });
}
