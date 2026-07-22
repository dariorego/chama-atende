import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useTenant } from "@/hooks/useTenant";

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

export type TableInsert = Omit<Table, 'id' | 'created_at' | 'updated_at' | 'area' | 'position_x' | 'position_y' | 'shape'> & {
  area?: string;
  position_x?: number;
  position_y?: number;
  shape?: 'square' | 'round' | 'rect';
};
export type TableUpdate = Partial<TableInsert>;

export function useAdminTables() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`admin-tables-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${tenantId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-tables", tenantId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tenantId]);

  return useQuery({
    queryKey: ["admin-tables", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("number", { ascending: true });

      if (error) throw error;
      return data as Table[];
    },
  });
}

export function useUpdateTablePosition() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenant();
  const queryKey = ["admin-tables", tenantId] as const;
  return useMutation({
    mutationFn: async ({ id, position_x, position_y, area }: { id: string; position_x: number; position_y: number; area?: string }) => {
      const payload = area
        ? { position_x, position_y, area }
        : { position_x, position_y };
      const { error } = await supabase.from("tables").update(payload).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, position_x, position_y, area }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Table[]>(queryKey);
      queryClient.setQueryData<Table[]>(queryKey, (old) =>
        old?.map((t) => (t.id === id ? { ...t, position_x, position_y, ...(area ? { area } : {}) } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (table: TableInsert) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { data, error } = await supabase
        .from("tables")
        .insert({ ...table, restaurant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables", tenantId] });
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
  const { tenantId } = useTenant();

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
      queryClient.invalidateQueries({ queryKey: ["admin-tables", tenantId] });
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
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tables", tenantId] });
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
  const { tenantId } = useTenant();

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
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      // Fetch existing tables if skipExisting is true
      let existingNumbers: number[] = [];
      if (skipExisting) {
        const { data } = await supabase.from("tables").select("number").eq("restaurant_id", tenantId);
        existingNumbers = data?.map((t) => t.number) || [];
      }

      // Generate array of tables to create
      const tables: (TableInsert & { restaurant_id: string })[] = [];
      for (let i = startNumber; i <= endNumber; i++) {
        if (!skipExisting || !existingNumbers.includes(i)) {
          tables.push({
            number: i,
            name: null,
            capacity,
            status: "available",
            is_active: true,
            restaurant_id: tenantId,
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
      queryClient.invalidateQueries({ queryKey: ["admin-tables", tenantId] });
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
