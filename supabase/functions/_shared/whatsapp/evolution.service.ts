import type { Logger } from "./logger.ts";

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

export function getEvolutionConfig(): EvolutionConfig {
  const baseUrl = (Deno.env.get("EVOLUTION_API_URL") ?? "").replace(/\/+$/, "");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY") ?? "";
  if (!baseUrl || !apiKey) {
    throw new Error("EVOLUTION_API_URL / EVOLUTION_API_KEY não configurados");
  }
  return { baseUrl, apiKey };
}

interface CallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  retry?: number;
  timeoutMs?: number;
}

export class EvolutionService {
  constructor(
    private readonly config: EvolutionConfig,
    private readonly log: Logger,
    private readonly ctx: { restaurantId?: string | null; instanceId?: string | null } = {},
  ) {}

  private async call<T>(path: string, action: string, opts: CallOptions = {}): Promise<T> {
    const { method = "GET", body, retry = 1, timeoutMs = 20000 } = opts;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retry; attempt++) {
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(`${this.config.baseUrl}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            apikey: this.config.apiKey,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        });
        const text = await res.text();
        let parsed: unknown = text;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch { /* mantém texto */ }

        await this.log({
          ...this.ctx,
          kind: "evolution",
          action,
          statusCode: res.status,
          durationMs: Date.now() - started,
          request: { path, method, body },
          response: parsed,
          error: res.ok ? null : `HTTP ${res.status}`,
        });

        if (!res.ok) throw new Error(`Evolution ${action} falhou (HTTP ${res.status}): ${text.slice(0, 300)}`);
        return parsed as T;
      } catch (err) {
        lastError = err;
        if (attempt === retry) break;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      } finally {
        clearTimeout(timer);
      }
    }

    await this.log({
      ...this.ctx,
      kind: "error",
      action,
      request: { path, method },
      error: lastError instanceof Error ? lastError.message : String(lastError),
    });
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  createInstance(instanceName: string, webhookUrl: string) {
    return this.call<Record<string, unknown>>("/instance/create", "create_instance", {
      method: "POST",
      body: {
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: {
          url: webhookUrl,
          byEvents: false,
          base64: true,
          events: [
            "QRCODE_UPDATED",
            "CONNECTION_UPDATE",
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE",
          ],
        },
      },
    });
  }

  setWebhook(instanceName: string, webhookUrl: string) {
    return this.call(`/webhook/set/${instanceName}`, "set_webhook", {
      method: "POST",
      body: {
        webhook: {
          enabled: true,
          url: webhookUrl,
          byEvents: false,
          base64: true,
          events: [
            "QRCODE_UPDATED",
            "CONNECTION_UPDATE",
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "SEND_MESSAGE",
          ],
        },
      },
    });
  }

  connect(instanceName: string) {
    return this.call<Record<string, unknown>>(`/instance/connect/${instanceName}`, "connect_instance");
  }

  getStatus(instanceName: string) {
    return this.call<Record<string, unknown>>(`/instance/connectionState/${instanceName}`, "connection_state");
  }

  restart(instanceName: string) {
    return this.call(`/instance/restart/${instanceName}`, "restart_instance", { method: "POST" });
  }

  logout(instanceName: string) {
    return this.call(`/instance/logout/${instanceName}`, "logout_instance", { method: "DELETE" });
  }

  deleteInstance(instanceName: string) {
    return this.call(`/instance/delete/${instanceName}`, "delete_instance", { method: "DELETE" });
  }

  sendText(instanceName: string, phone: string, text: string) {
    return this.call<Record<string, unknown>>(`/message/sendText/${instanceName}`, "send_text", {
      method: "POST",
      body: { number: phone, text },
    });
  }

  sendMedia(instanceName: string, phone: string, mediaUrl: string, caption?: string, mediatype = "image") {
    return this.call<Record<string, unknown>>(`/message/sendMedia/${instanceName}`, "send_media", {
      method: "POST",
      body: { number: phone, mediatype, media: mediaUrl, caption },
    });
  }
}

/** Extrai o base64 do QR Code dos diferentes formatos retornados pela Evolution. */
export function extractQrCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, any>;
  return (
    obj.base64 ??
    obj.qrcode?.base64 ??
    obj.qr?.base64 ??
    obj.code ??
    obj.qrcode?.code ??
    null
  );
}