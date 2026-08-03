import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export type WhatsappInstance = {
  id: string;
  restaurant_id: string;
  name: string;
  instance_name: string;
  phone: string | null;
  status: string;
  qr_code: string | null;
  last_error: string | null;
  connected_at: string | null;
  created_at: string;
};

export type WhatsappConversation = {
  id: string;
  instance_id: string;
  contact_id: string;
  mode: string;
  status: string;
  unread_count: number;
  last_message_at: string | null;
  whatsapp_contacts: {
    id: string;
    phone: string;
    name: string | null;
    photo_url: string | null;
    last_message: string | null;
  } | null;
};

export type WhatsappMessage = {
  id: string;
  conversation_id: string | null;
  phone: string;
  direction: string;
  message: string | null;
  media_url: string | null;
  type: string;
  source: string;
  tokens_prompt: number;
  tokens_completion: number;
  response_ms: number | null;
  created_at: string;
};

export type AiPrompt = {
  id: string;
  title: string;
  prompt: string;
  version: number;
  is_active: boolean;
  parent_id: string | null;
  created_at: string;
};

export type AiSettings = {
  id: string;
  restaurant_id: string;
  enabled: boolean;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  timeout_ms: number;
  retry: number;
  welcome_message: string | null;
  fallback_message: string;
  reply_delay_ms: number;
  abandon_minutes: number;
};

export type WhatsappLog = {
  id: string;
  kind: string;
  action: string;
  status_code: number | null;
  duration_ms: number | null;
  request: unknown;
  response: unknown;
  error: string | null;
  created_at: string;
};

type ManageAction =
  | "create_instance"
  | "delete_instance"
  | "qrcode"
  | "status"
  | "restart"
  | "disconnect"
  | "send_message"
  | "test_prompt";

export interface ManagePayload {
  action: ManageAction;
  instanceId?: string;
  name?: string;
  phone?: string;
  message?: string;
  conversationId?: string;
  prompt?: string;
  model?: string;
  input?: string;
}

/** Única porta de entrada do front para a Evolution API / OpenRouter. */
export function useWhatsappManage() {
  const { tenantId } = useTenant();

  return useMutation({
    mutationFn: async (payload: ManagePayload) => {
      if (!tenantId) throw new Error("Estabelecimento não identificado");
      const { data, error } = await supabase.functions.invoke("whatsapp-manage", {
        body: { ...payload, restaurantId: tenantId },
      });
      if (error) {
        const detail = (data as { error?: string } | null)?.error;
        throw new Error(detail ?? error.message);
      }
      if ((data as { error?: string })?.error) throw new Error(String((data as { error?: string }).error));
      return data as Record<string, unknown>;
    },
  });
}

export function useWhatsappInstances() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["whatsapp-instances", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as WhatsappInstance[];
    },
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`wa-instances-${tenantId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_instances", filter: `restaurant_id=eq.${tenantId}` },
        () => queryClient.invalidateQueries({ queryKey: ["whatsapp-instances", tenantId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  return query;
}

export function useWhatsappConversations() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["whatsapp-conversations", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*, whatsapp_contacts(id, phone, name, photo_url, last_message)")
        .eq("restaurant_id", tenantId!)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as unknown as WhatsappConversation[];
    },
    enabled: !!tenantId,
  });

  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`wa-conversations-${tenantId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_conversations", filter: `restaurant_id=eq.${tenantId}` },
        () => queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations", tenantId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  const setMode = useMutation({
    mutationFn: async ({ id, mode }: { id: string; mode: "ai" | "human" }) => {
      const { error } = await supabase.from("whatsapp_conversations").update({ mode }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations", tenantId] });
    },
    onError: () => toast.error("Não foi possível alterar o modo da conversa"),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_conversations").update({ unread_count: 0 }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations", tenantId] }),
  });

  return { ...query, setMode, markRead };
}

export function useWhatsappMessages(conversationId?: string | null) {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["whatsapp-messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true })
        .limit(300);
      if (error) throw error;
      return data as WhatsappMessage[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`wa-messages-${conversationId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_messages", filter: `conversation_id=eq.${conversationId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["whatsapp-messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations", tenantId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, tenantId, queryClient]);

  return query;
}

export function useWhatsappStats() {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["whatsapp-stats", tenantId],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [messagesRes, conversationsRes] = await Promise.all([
        supabase
          .from("whatsapp_messages")
          .select("direction, source, tokens_prompt, tokens_completion, response_ms")
          .eq("restaurant_id", tenantId!)
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("whatsapp_conversations")
          .select("id, status, mode")
          .eq("restaurant_id", tenantId!),
      ]);

      if (messagesRes.error) throw messagesRes.error;
      if (conversationsRes.error) throw conversationsRes.error;

      const messages = messagesRes.data ?? [];
      const aiMessages = messages.filter((m) => m.source === "ai");
      const responseTimes = aiMessages.map((m) => m.response_ms ?? 0).filter((v) => v > 0);

      return {
        received: messages.filter((m) => m.direction === "inbound").length,
        sent: messages.filter((m) => m.direction === "outbound").length,
        aiAnswered: aiMessages.length,
        avgResponseMs: responseTimes.length
          ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
          : 0,
        tokens: messages.reduce((acc, m) => acc + (m.tokens_prompt ?? 0) + (m.tokens_completion ?? 0), 0),
        openConversations: (conversationsRes.data ?? []).filter((c) => c.status === "open").length,
        humanConversations: (conversationsRes.data ?? []).filter((c) => c.mode === "human").length,
      };
    },
    enabled: !!tenantId,
    refetchInterval: 60_000,
  });
}

export function useAiPrompts() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ai-prompts", tenantId] });

  const query = useQuery({
    queryKey: ["ai-prompts", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_prompts")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AiPrompt[];
    },
    enabled: !!tenantId,
  });

  const save = useMutation({
    mutationFn: async ({ id, title, prompt }: { id?: string; title: string; prompt: string }) => {
      if (id) {
        const { error } = await supabase.from("ai_prompts").update({ title, prompt }).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("ai_prompts")
        .insert({ restaurant_id: tenantId!, title, prompt, version: 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Prompt salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Cria uma nova versão a partir de um prompt existente e a torna a versão corrente. */
  const createVersion = useMutation({
    mutationFn: async ({ source, prompt }: { source: AiPrompt; prompt: string }) => {
      const { error } = await supabase.from("ai_prompts").insert({
        restaurant_id: tenantId!,
        title: source.title,
        prompt,
        version: source.version + 1,
        parent_id: source.parent_id ?? source.id,
        is_active: source.is_active,
      });
      if (error) throw error;
      if (source.is_active) {
        await supabase.from("ai_prompts").update({ is_active: false }).eq("id", source.id);
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Nova versão criada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicate = useMutation({
    mutationFn: async (source: AiPrompt) => {
      const { error } = await supabase.from("ai_prompts").insert({
        restaurant_id: tenantId!,
        title: `${source.title} (cópia)`,
        prompt: source.prompt,
        version: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Prompt duplicado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activate = useMutation({
    mutationFn: async (id: string) => {
      const { error: clearError } = await supabase
        .from("ai_prompts")
        .update({ is_active: false })
        .eq("restaurant_id", tenantId!)
        .eq("is_active", true);
      if (clearError) throw clearError;
      const { error } = await supabase.from("ai_prompts").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Prompt ativado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_prompts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Prompt removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, save, createVersion, duplicate, activate, remove };
}

export function useAiSettings() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ai-settings", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .maybeSingle();
      if (error) throw error;
      return (data as AiSettings) ?? null;
    },
    enabled: !!tenantId,
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<AiSettings>) => {
      const { error } = await supabase
        .from("ai_settings")
        .upsert({ restaurant_id: tenantId!, ...patch }, { onConflict: "restaurant_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings", tenantId] });
      toast.success("Configurações salvas");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, save };
}

export function useWhatsappLogs(filters: { kind?: string } = {}) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ["whatsapp-logs", tenantId, filters.kind],
    queryFn: async () => {
      let q = supabase
        .from("whatsapp_logs")
        .select("*")
        .eq("restaurant_id", tenantId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters.kind && filters.kind !== "all") q = q.eq("kind", filters.kind);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as WhatsappLog[];
    },
    enabled: !!tenantId,
  });
}