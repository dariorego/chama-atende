import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNotificationSound } from "./useNotificationSound";

export interface TableSession {
  id: string;
  table_id: string;
  waiter_id: string | null;
  status: 'open' | 'bill_requested' | 'closed';
  opened_at: string;
  bill_requested_at: string | null;
  closed_at: string | null;
  customer_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tables?: {
    number: number;
    name: string | null;
  };
  waiters?: {
    name: string;
  } | null;
}

export function useTableSessions() {
  const queryClient = useQueryClient();
  const { playNotificationSound } = useNotificationSound();

  const query = useQuery({
    queryKey: ["table-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_sessions")
        .select(`
          *,
          tables (number, name),
          waiters (name)
        `)
        .in("status", ["open", "bill_requested"])
        .order("opened_at", { ascending: false });

      if (error) throw error;
      return data as TableSession[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('table-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'table_sessions'
        },
        (payload) => {
          // Tocar som quando pedido de conta é solicitado
          const newData = payload.new as { status: string };
          const oldData = payload.old as { status: string };
          if (newData.status === 'bill_requested' && oldData.status !== 'bill_requested') {
            playNotificationSound();
          }
          queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'table_sessions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
          queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, playNotificationSound]);

  return query;
}

export function useCreateTableSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (session: { table_id: string; customer_count?: number }) => {
      // Update table status to occupied
      await supabase
        .from("tables")
        .update({ status: 'occupied' })
        .eq("id", session.table_id);

      const { data, error } = await supabase
        .from("table_sessions")
        .insert({
          table_id: session.table_id,
          customer_count: session.customer_count || 1,
          status: 'open',
          opened_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      toast({ title: "Atendimento iniciado!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao iniciar atendimento", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTableSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TableSession> & { id: string }) => {
      const { data, error } = await supabase
        .from("table_sessions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar sessão", description: error.message, variant: "destructive" });
    },
  });
}

export function useCloseTableSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sessionId, tableId }: { sessionId: string; tableId: string }) => {
      // Close the session
      const { error: sessionError } = await supabase
        .from("table_sessions")
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      // Update table status to available
      const { error: tableError } = await supabase
        .from("tables")
        .update({ status: 'available' })
        .eq("id", tableId);

      if (tableError) throw tableError;

      // Complete any pending service calls for this session
      await supabase
        .from("service_calls")
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq("table_session_id", sessionId)
        .in("status", ["pending", "acknowledged", "in_progress"]);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
      queryClient.invalidateQueries({ queryKey: ["admin-service-calls"] });
      queryClient.invalidateQueries({ queryKey: ["pending-service-calls"] });
      toast({ title: "Atendimento finalizado!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao finalizar atendimento", description: error.message, variant: "destructive" });
    },
  });
}
