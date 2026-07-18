import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Table {
  id: string;
  number: number;
  name: string | null;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'inactive';
  is_active: boolean;
  area: string;
  position_x: number;
  position_y: number;
  shape: 'square' | 'round' | 'rect';
  created_at: string;
  updated_at: string;
}

export type TableInsert = Omit<Table, 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate = Partial<TableInsert>;

export function useAdminTables() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`admin-tables-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

export function useUpdateTablePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, position_x, position_y, area }: { id: string; position_x: number; position_y: number; area?: string }) => {
      const payload: Record<string, unknown> = { position_x, position_y };
      if (area) payload.area = area;
      const { error } = await supabase.from("tables").update(payload).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, position_x, position_y, area }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-tables"] });
      const previous = queryClient.getQueryData<Table[]>(["admin-tables"]);
      queryClient.setQueryData<Table[]>(["admin-tables"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, position_x, position_y, ...(area ? { area } : {}) } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["admin-tables"], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
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

export function useCreateBatchTables() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      startNumber,
      endNumber,
      capacity,
      skipExisting,
    }: {
      startNumber: number;
      endNumber: number;
      capacity: number;
      skipExisting: boolean;
    }) => {
      // Fetch existing tables if skipExisting is true
      let existingNumbers: number[] = [];
      if (skipExisting) {
        const { data } = await supabase.from("tables").select("number");
        existingNumbers = data?.map((t) => t.number) || [];
      }

      // Generate array of tables to create
      const tables: TableInsert[] = [];
      for (let i = startNumber; i <= endNumber; i++) {
        if (!skipExisting || !existingNumbers.includes(i)) {
          tables.push({
            number: i,
            name: null,
            capacity,
            status: "available",
            is_active: true,
          });
        }
      }

      if (tables.length === 0) {
        throw new Error("Nenhuma mesa nova para criar");
      }

      // Insert all at once
      const { data, error } = await supabase
        .from("tables")
        .insert(tables)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      toast({ title: `${data.length} mesas criadas com sucesso!` });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar mesas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
