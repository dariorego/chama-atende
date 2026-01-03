import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Table {
  id: string;
  number: number;
  name: string | null;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TableInsert = Omit<Table, 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate = Partial<TableInsert>;

export function useAdminTables() {
  return useQuery({
    queryKey: ["admin-tables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .order("number", { ascending: true });

      if (error) throw error;
      return data as Table[];
    },
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (table: TableInsert) => {
      const { data, error } = await supabase
        .from("tables")
        .insert(table)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      toast({ title: "Mesa criada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar mesa", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TableUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tables")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      toast({ title: "Mesa atualizada com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar mesa", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      toast({ title: "Mesa excluída com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao excluir mesa", description: error.message, variant: "destructive" });
    },
  });
}
