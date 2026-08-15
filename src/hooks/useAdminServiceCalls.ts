import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
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

const SERVICE_CALL_KEYS = [["admin-service-calls"], ["pending-service-calls"]] as const;

/**
 * Assina mudanças em service_calls e mantém as duas listas sincronizadas.
 * Inclui refetch ao (re)conectar o canal, evitando perder eventos.
 */
function useServiceCallsRealtime(playSound: () => void) {
  const queryClient = useQueryClient();
  const soundRef = useRef(playSound);
  soundRef.current = playSound;

  useEffect(() => {
    const invalidateAll = () => {
      SERVICE_CALL_KEYS.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] }),
      );
    };

    const channelName = `service-calls-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_calls' },
        (payload) => {
          if (
            payload.eventType === 'INSERT' &&
            (payload.new as { status?: string })?.status === 'pending'
          ) {
            soundRef.current();
          }
          invalidateAll();
        },
      )
      .subscribe((status) => {
        // Ao conectar/reconectar, busca o estado atual para não perder eventos
        if (status === 'SUBSCRIBED') invalidateAll();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

/** Toca o som quando surgem chamados pendentes novos (inclusive via polling). */
function useNewPendingSound(calls: ServiceCall[] | undefined, playSound: () => void) {
  const knownIds = useRef<Set<string> | null>(null);
  const soundRef = useRef(playSound);
  soundRef.current = playSound;

  useEffect(() => {
    if (!calls) return;
    const pendingIds = calls.filter((c) => c.status === 'pending').map((c) => c.id);

    if (knownIds.current === null) {
      knownIds.current = new Set(pendingIds);
      return;
    }

    const hasNew = pendingIds.some((id) => !knownIds.current!.has(id));
    knownIds.current = new Set(pendingIds);
    if (hasNew) soundRef.current();
  }, [calls]);
}

/** Repete o som a cada X segundos enquanto houver chamado pendente. */
function useRepeatPendingSound(
  calls: ServiceCall[] | undefined,
  playSound: () => void,
  enabled: boolean,
  intervalSeconds: number,
) {
  const soundRef = useRef(playSound);
  soundRef.current = playSound;

  const hasPending = !!calls?.some((c) => c.status === 'pending');

  useEffect(() => {
    if (!enabled || !hasPending) return;
    const ms = Math.max(5, intervalSeconds) * 1000;
    const interval = setInterval(() => soundRef.current(), ms);
    return () => clearInterval(interval);
  }, [enabled, hasPending, intervalSeconds]);
}

const REALTIME_QUERY_OPTIONS = {
  refetchInterval: 10_000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
} as const;

export function useAdminServiceCalls() {
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
    ...REALTIME_QUERY_OPTIONS,
  });

  useServiceCallsRealtime(playNotificationSound);

  return query;
}

export function usePendingServiceCalls() {
  const { playNotificationSound, repeatEnabled, repeatSeconds } = useNotificationSound();

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
    ...REALTIME_QUERY_OPTIONS,
  });

  useServiceCallsRealtime(playNotificationSound);
  useNewPendingSound(query.data, playNotificationSound);
  useRepeatPendingSound(query.data, playNotificationSound, repeatEnabled, repeatSeconds);

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
        .update({ ...updates, response_time_seconds } as never)
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
