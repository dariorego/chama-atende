import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNotificationSound } from "./useNotificationSound";

export interface ServiceCall {
  id: string;
  table_session_id: string | null;
  table_id: string;
  call_type: 'waiter' | 'bill' | 'help';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  waiter_id: string | null;
  called_at: string;
  acknowledged_at: string | null;
  completed_at: string | null;
  response_time_seconds: number | null;
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

export function useAdminServiceCalls() {
  const queryClient = useQueryClient();
  const { playNotificationSound } = useNotificationSound();

  const query = useQuery({
    queryKey: ["admin-service-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_calls")
        .select(`
          *,
          tables (number, name),
          waiters (name)
        `)
        .order("called_at", { ascending: false });

      if (error) throw error;
      return data as ServiceCall[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('service-calls-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_calls'
        },
        (payload) => {
          // Tocar som para novas solicitações pendentes
          if (payload.new && (payload.new as { status: string }).status === 'pending') {
            playNotificationSound();
          }
          queryClient.invalidateQueries({ queryKey: ["admin-service-calls"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_calls'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-service-calls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, playNotificationSound]);

  return query;
}

export function usePendingServiceCalls() {
  const queryClient = useQueryClient();
  const { playNotificationSound } = useNotificationSound();

  const query = useQuery({
    queryKey: ["pending-service-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_calls")
        .select(`
          *,
          tables (number, name),
          waiters (name)
        `)
        .in("status", ["pending", "acknowledged", "in_progress"])
        .order("called_at", { ascending: true });

      if (error) throw error;
      return data as ServiceCall[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('pending-calls-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_calls'
        },
        (payload) => {
          // Tocar som para novas solicitações pendentes
          if (payload.new && (payload.new as { status: string }).status === 'pending') {
            playNotificationSound();
          }
          queryClient.invalidateQueries({ queryKey: ["pending-service-calls"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_calls'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-service-calls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, playNotificationSound]);

  return query;
}

export function useCreateServiceCall() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (call: { table_id: string; call_type: 'waiter' | 'bill' | 'help'; table_session_id?: string }) => {
      const { data, error } = await supabase
        .from("service_calls")
        .insert({
          table_id: call.table_id,
          call_type: call.call_type,
          table_session_id: call.table_session_id || null,
          status: 'pending',
          called_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-calls"] });
      queryClient.invalidateQueries({ queryKey: ["pending-service-calls"] });
      toast({ title: "Solicitação enviada!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao enviar solicitação", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateServiceCall() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceCall> & { id: string }) => {
      // Calculate response time if completing
      let response_time_seconds = updates.response_time_seconds;
      if (updates.status === 'completed' && updates.completed_at) {
        const { data: callData } = await supabase
          .from("service_calls")
          .select("called_at")
          .eq("id", id)
          .single();
        
        if (callData?.called_at) {
          const calledAt = new Date(callData.called_at).getTime();
          const completedAt = new Date(updates.completed_at).getTime();
          response_time_seconds = Math.floor((completedAt - calledAt) / 1000);
        }
      }

      const { data, error } = await supabase
        .from("service_calls")
        .update({ ...updates, response_time_seconds })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-calls"] });
      queryClient.invalidateQueries({ queryKey: ["pending-service-calls"] });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar chamada", description: error.message, variant: "destructive" });
    },
  });
}
