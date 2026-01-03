import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";

export type ServiceCall = Tables<"service_calls">;
export type TableSession = Tables<"table_sessions">;

export function useClientServiceCall(tableId: string | null) {
  const queryClient = useQueryClient();

  // Fetch active session for this table
  const { data: activeSession, isLoading: sessionLoading } = useQuery({
    queryKey: ["client-session", tableId],
    queryFn: async () => {
      if (!tableId) return null;
      
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("table_id", tableId)
        .eq("status", "open")
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tableId,
  });

  // Fetch pending calls for this table
  const { data: pendingCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ["client-calls", tableId],
    queryFn: async () => {
      if (!tableId) return [];
      
      const { data, error } = await supabase
        .from("service_calls")
        .select("*")
        .eq("table_id", tableId)
        .in("status", ["pending", "acknowledged", "in_progress"])
        .order("called_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tableId,
  });

  // Create or get session
  const createSessionMutation = useMutation({
    mutationFn: async (tableId: string) => {
      // First check if session exists
      const { data: existing } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("table_id", tableId)
        .eq("status", "open")
        .maybeSingle();
      
      if (existing) return existing;
      
      // Create new session
      const { data, error } = await supabase
        .from("table_sessions")
        .insert({ table_id: tableId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-session", tableId] });
    },
  });

  // Create service call
  const createCallMutation = useMutation({
    mutationFn: async ({ 
      tableId, 
      sessionId, 
      callType 
    }: { 
      tableId: string; 
      sessionId: string | null; 
      callType: "waiter" | "bill" | "help";
    }) => {
      const { data, error } = await supabase
        .from("service_calls")
        .insert({
          table_id: tableId,
          table_session_id: sessionId,
          call_type: callType,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

  // Cancel service call
  const cancelCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from("service_calls")
        .update({ status: "cancelled" })
        .eq("id", callId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

  // Real-time subscription for call updates
  useEffect(() => {
    if (!tableId) return;

    const channel = supabase
      .channel(`client-calls-${tableId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_calls",
          filter: `table_id=eq.${tableId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, queryClient]);

  // Helper to check if there's an active call of a specific type
  const hasActiveCall = (callType: string) => {
    return pendingCalls.some(
      (call) => call.call_type === callType && ["pending", "acknowledged", "in_progress"].includes(call.status || "")
    );
  };

  return {
    activeSession,
    pendingCalls,
    isLoading: sessionLoading || callsLoading,
    hasActiveCall,
    createSession: createSessionMutation.mutateAsync,
    createCall: createCallMutation.mutateAsync,
    cancelCall: cancelCallMutation.mutateAsync,
    isCreatingCall: createCallMutation.isPending,
    isCancellingCall: cancelCallMutation.isPending,
  };
}
