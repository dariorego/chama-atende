import type { Logger } from "./logger.ts";
import type { ChatMessage, CompletionResult } from "./types.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface CompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retry?: number;
}

export class OpenRouterService {
  constructor(
    private readonly apiKey: string,
    private readonly log: Logger,
    private readonly ctx: { restaurantId?: string | null; instanceId?: string | null } = {},
  ) {}

  static fromEnv(log: Logger, ctx: { restaurantId?: string | null; instanceId?: string | null } = {}) {
    const key = Deno.env.get("OPENROUTER_API_KEY");
    if (!key) throw new Error("OPENROUTER_API_KEY não configurado");
    return new OpenRouterService(key, log, ctx);
  }

  async complete(params: CompletionParams): Promise<CompletionResult> {
    const {
      model,
      messages,
      temperature = 0.7,
      topP = 1,
      maxTokens = 800,
      timeoutMs = 30000,
      retry = 2,
    } = params;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retry; attempt++) {
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "X-Title": "Chama Atende - WhatsApp AI",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            top_p: topP,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch { /* ignora */ }

        const durationMs = Date.now() - started;

        await this.log({
          ...this.ctx,
          kind: "openrouter",
          action: "chat_completion",
          statusCode: res.status,
          durationMs,
          request: { model, temperature, topP, maxTokens, messageCount: messages.length },
          response: data ? { usage: data.usage, choices: data.choices?.length ?? 0 } : text.slice(0, 500),
          error: res.ok ? null : `HTTP ${res.status}`,
        });

        if (res.status === 429 || res.status >= 500) {
          throw new Error(`OpenRouter indisponível (HTTP ${res.status})`);
        }
        if (!res.ok) {
          throw new Error(`OpenRouter falhou (HTTP ${res.status}): ${text.slice(0, 300)}`);
        }

        const content: string = data?.choices?.[0]?.message?.content ?? "";
        if (!content.trim()) throw new Error("OpenRouter retornou resposta vazia");

        return {
          content: content.trim(),
          tokensPrompt: data?.usage?.prompt_tokens ?? 0,
          tokensCompletion: data?.usage?.completion_tokens ?? 0,
          durationMs,
          model: data?.model ?? model,
        };
      } catch (err) {
        lastError = err;
        if (attempt === retry) break;
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      } finally {
        clearTimeout(timer);
      }
    }

    await this.log({
      ...this.ctx,
      kind: "error",
      action: "chat_completion",
      error: lastError instanceof Error ? lastError.message : String(lastError),
    });
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
}