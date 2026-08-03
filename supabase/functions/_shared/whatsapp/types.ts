// Domínio do módulo WhatsApp AI — sem dependência de framework.

export type InstanceStatus = "disconnected" | "qr" | "connecting" | "connected" | "error";
export type MessageDirection = "inbound" | "outbound";
export type MessageSource = "ai" | "human" | "system";
export type ConversationMode = "ai" | "human";
export type LogKind = "evolution" | "openrouter" | "webhook" | "error";

export interface WhatsappInstance {
  id: string;
  restaurant_id: string;
  name: string;
  instance_name: string;
  phone: string | null;
  status: InstanceStatus;
  qr_code: string | null;
  last_error: string | null;
  connected_at: string | null;
}

export interface AiSettings {
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
}

export interface AiPrompt {
  id: string;
  restaurant_id: string;
  title: string;
  prompt: string;
  version: number;
  is_active: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionResult {
  content: string;
  tokensPrompt: number;
  tokensCompletion: number;
  durationMs: number;
  model: string;
}