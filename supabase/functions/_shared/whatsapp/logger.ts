import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { LogKind } from "./types.ts";

export interface LogEntry {
  restaurantId?: string | null;
  instanceId?: string | null;
  kind: LogKind;
  action: string;
  statusCode?: number | null;
  durationMs?: number | null;
  request?: unknown;
  response?: unknown;
  error?: string | null;
}

const MAX_JSON = 4000;

function trim(value: unknown) {
  if (value === undefined || value === null) return null;
  try {
    const raw = JSON.stringify(value);
    if (raw.length <= MAX_JSON) return JSON.parse(raw);
    return { truncated: true, preview: raw.slice(0, MAX_JSON) };
  } catch {
    return { unserializable: true };
  }
}

export function createLogger(db: SupabaseClient) {
  return async function log(entry: LogEntry): Promise<void> {
    try {
      await db.from("whatsapp_logs").insert({
        restaurant_id: entry.restaurantId ?? null,
        instance_id: entry.instanceId ?? null,
        kind: entry.kind,
        action: entry.action,
        status_code: entry.statusCode ?? null,
        duration_ms: entry.durationMs ?? null,
        request: trim(entry.request),
        response: trim(entry.response),
        error: entry.error ?? null,
      });
    } catch (err) {
      console.error("[whatsapp-logger] falha ao gravar log", err);
    }
  };
}

export type Logger = ReturnType<typeof createLogger>;