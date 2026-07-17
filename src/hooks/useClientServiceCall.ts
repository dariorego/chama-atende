import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callPublicApi } from "@/lib/publicApi";
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
      const { data } = await callPublicApi<{ data: TableSession | null }>("get-table-session", { tableId });
      return data;
    },
    enabled: !!tableId,
    refetchInterval: 15000,
  });

  // Fetch pending calls for this table
  const { data: pendingCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ["client-calls", tableId],
    queryFn: async () => {
      if (!tableId) return [];
      const { data } = await callPublicApi<{ data: ServiceCall[] }>("get-service-calls", { tableId });
      return data ?? [];
    },
    enabled: !!tableId,
    refetchInterval: 10000,
  });

  // Create or get session
  const createSessionMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { data } = await callPublicApi<{ data: TableSession | null }>("get-table-session", { tableId });
      if (data) return data;
      const { error } = await supabase.from("table_sessions").insert({ table_id: tableId });
      if (error) throw error;
      const { data: created } = await callPublicApi<{ data: TableSession | null }>("get-table-session", { tableId });
      return created!;
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
      const { error } = await supabase.from("service_calls").insert({
        table_id: tableId,
        table_session_id: sessionId,
        call_type: callType,
        status: "pending",
      });
      if (error) throw error;
      return { table_id: tableId, table_session_id: sessionId, call_type: callType, status: "pending" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

  // Cancel service call
  const cancelCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      if (!tableId) throw new Error("tableId required");
      await callPublicApi("cancel-service-call", { callId, tableId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

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
