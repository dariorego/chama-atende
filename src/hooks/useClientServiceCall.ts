import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { callPublicApi } from "@/lib/publicApi";
import { Tables } from "@/integrations/supabase/types";

export type ServiceCall = Tables<"service_calls">;
export type TableSession = Tables<"table_sessions">;

const SESSION_TOKEN_KEY = "table_session_token";

function tokenKey(tableId: string) {
  return `${SESSION_TOKEN_KEY}:${tableId}`;
}

function getStoredSessionToken(tableId: string | null): string | null {
  if (!tableId) return null;
  try { return localStorage.getItem(tokenKey(tableId)); } catch { return null; }
}

function storeSessionToken(tableId: string, token: string) {
  try { localStorage.setItem(tokenKey(tableId), token); } catch { /* ignore */ }
}

export function useClientServiceCall(tableId: string | null) {
  const queryClient = useQueryClient();

  // Fetch active session for this table (no PII / no token returned).
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

  // Fetch pending calls — only when this device holds the session token.
  const { data: pendingCalls = [], isLoading: callsLoading } = useQuery({
    queryKey: ["client-calls", tableId],
    queryFn: async () => {
      if (!tableId) return [];
      const sessionToken = getStoredSessionToken(tableId);
      if (!sessionToken) return [];
      const { data } = await callPublicApi<{ data: ServiceCall[] }>(
        "get-service-calls",
        { tableId, sessionToken },
      );
      return data ?? [];
    },
    enabled: !!tableId,
    refetchInterval: 10000,
  });

  // Create or resume session. Server issues a per-session secret token that
  // authenticates subsequent get/cancel calls for THIS browser only.
  const createSessionMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { data, sessionToken } = await callPublicApi<{
        data: TableSession | null;
        sessionToken: string | null;
      }>("open-table-session", { tableId });
      if (sessionToken) storeSessionToken(tableId, sessionToken);
      return data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-session", tableId] });
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

  // Create service call — INSERT is public; ownership is enforced on reads/cancels.
  const createCallMutation = useMutation({
    mutationFn: async ({
      tableId,
      sessionId,
      callType,
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

  // Cancel service call — requires the per-session secret token.
  const cancelCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      if (!tableId) throw new Error("tableId required");
      const sessionToken = getStoredSessionToken(tableId);
      if (!sessionToken) throw new Error("Sessão não encontrada neste dispositivo");
      await callPublicApi("cancel-service-call", { callId, tableId, sessionToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-calls", tableId] });
    },
  });

  const hasActiveCall = (callType: string) => {
    return pendingCalls.some(
      (call) => call.call_type === callType && ["pending", "acknowledged", "in_progress"].includes(call.status || ""),
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