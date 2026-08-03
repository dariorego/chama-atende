import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { createLogger } from "../_shared/whatsapp/logger.ts";
import { createRepositories } from "../_shared/whatsapp/repositories.ts";
import { EvolutionService, extractQrCode, getEvolutionConfig } from "../_shared/whatsapp/evolution.service.ts";
import { OpenRouterService } from "../_shared/whatsapp/openrouter.service.ts";
import type { ChatMessage } from "../_shared/whatsapp/types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PayloadSchema = z.object({
  event: z.string().min(1),
  instance: z.string().min(1),
  data: z.any().optional(),
});

function ok(body: unknown = { received: true }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEvent(event: string) {
  return event.toLowerCase().replace(/\./g, "_");
}

function extractPhone(remoteJid?: string | null) {
  if (!remoteJid) return null;
  if (remoteJid.includes("@g.us")) return null; // ignora grupos
  return remoteJid.split("@")[0].replace(/\D/g, "") || null;
}

function extractText(message: any): string | null {
  if (!message) return null;
  return (
    message.conversation ??
    message.extendedTextMessage?.text ??
    message.imageMessage?.caption ??
    message.videoMessage?.caption ??
    message.buttonsResponseMessage?.selectedDisplayText ??
    message.listResponseMessage?.title ??
    null
  );
}

function detectType(message: any): string {
  if (!message) return "text";
  if (message.imageMessage) return "image";
  if (message.audioMessage) return "audio";
  if (message.videoMessage) return "video";
  if (message.documentMessage) return "document";
  if (message.stickerMessage) return "sticker";
  return "text";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("WHATSAPP_WEBHOOK_SECRET") ?? "";
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") ?? req.headers.get("x-webhook-secret") ?? "";
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const log = createLogger(db);
  const repos = createRepositories(db);

  let payload: z.infer<typeof PayloadSchema>;
  try {
    const parsed = PayloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      await log({ kind: "webhook", action: "invalid_payload", error: "payload fora do formato esperado" });
      return ok({ ignored: true });
    }
    payload = parsed.data;
  } catch {
    return ok({ ignored: true });
  }

  const event = normalizeEvent(payload.event);
  const instance = await repos.instances.byInstanceName(payload.instance);

  await log({
    restaurantId: instance?.restaurant_id ?? null,
    instanceId: instance?.id ?? null,
    kind: "webhook",
    action: event,
    request: { instance: payload.instance },
  });

  if (!instance) return ok({ ignored: "instância desconhecida" });

  try {
    switch (event) {
      case "qrcode_updated": {
        const qr = extractQrCode(payload.data);
        await repos.instances.update(instance.id, { status: "qr", qr_code: qr, last_error: null });
        return ok();
      }
      case "connection_update": {
        const state = (payload.data as any)?.state;
        if (state === "open") {
          await repos.instances.update(instance.id, {
            status: "connected",
            qr_code: null,
            last_error: null,
            connected_at: new Date().toISOString(),
            ...((payload.data as any)?.wuid
              ? { phone: String((payload.data as any).wuid).split("@")[0] }
              : {}),
          });
        } else if (state === "connecting") {
          await repos.instances.update(instance.id, { status: "connecting" });
        } else if (state === "close") {
          await repos.instances.update(instance.id, { status: "disconnected", qr_code: null });
        }
        return ok();
      }
      case "messages_upsert": {
        return await handleIncoming();
      }
      case "send_message":
      case "messages_update": {
        return ok();
      }
      default:
        return ok({ ignored: event });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[whatsapp-webhook]", msg);
    await log({
      restaurantId: instance.restaurant_id,
      instanceId: instance.id,
      kind: "error",
      action: event,
      error: msg,
    });
    return ok({ error: msg });
  }

  async function handleIncoming() {
    const raw = payload.data as any;
    const entries = Array.isArray(raw) ? raw : [raw];

    for (const entry of entries) {
      if (!entry?.key) continue;
      if (entry.key.fromMe) continue; // mensagens enviadas por nós
      const phone = extractPhone(entry.key.remoteJid);
      if (!phone) continue;

      const externalId = entry.key.id as string | undefined;
      if (externalId && (await repos.messages.existsExternal(externalId))) continue;

      const text = extractText(entry.message);
      const type = detectType(entry.message);

      const contact = await repos.contacts.upsert({
        restaurant_id: instance!.restaurant_id,
        instance_id: instance!.id,
        phone,
        name: entry.pushName ?? null,
        last_message: text ?? `[${type}]`,
      });
      const conversation = await repos.conversations.ensure({
        restaurant_id: instance!.restaurant_id,
        instance_id: instance!.id,
        contact_id: contact.id,
      });

      const historyBefore = await repos.messages.history(conversation.id, 20);

      await repos.messages.create({
        restaurant_id: instance!.restaurant_id,
        instance_id: instance!.id,
        conversation_id: conversation.id,
        phone,
        direction: "inbound",
        message: text,
        type,
        status: "received",
        source: "human",
        external_id: externalId ?? null,
      });
      await repos.conversations.bumpUnread(conversation.id, 0);

      const settings = await repos.settings.byRestaurant(instance!.restaurant_id);
      if (!settings?.enabled) continue;
      if (conversation.mode !== "ai") continue;
      if (!text) continue;

      const promptRow = await repos.prompts.active(instance!.restaurant_id);
      const systemPrompt = promptRow?.prompt ??
        "Você é um atendente virtual educado e objetivo de um estabelecimento de alimentação. Responda em português do Brasil.";

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...historyBefore
          .filter((m) => !!m.message)
          .map((m) => ({
            role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
            content: m.message as string,
          })),
        { role: "user", content: text },
      ];

      const evo = new EvolutionService(getEvolutionConfig(), log, {
        restaurantId: instance!.restaurant_id,
        instanceId: instance!.id,
      });

      let reply = settings.fallback_message;
      let tokensPrompt = 0;
      let tokensCompletion = 0;
      let responseMs: number | null = null;

      try {
        const ai = OpenRouterService.fromEnv(log, {
          restaurantId: instance!.restaurant_id,
          instanceId: instance!.id,
        });
        const result = await ai.complete({
          model: settings.model,
          messages,
          temperature: Number(settings.temperature),
          topP: Number(settings.top_p),
          maxTokens: settings.max_tokens,
          timeoutMs: settings.timeout_ms,
          retry: settings.retry,
        });
        reply = result.content;
        tokensPrompt = result.tokensPrompt;
        tokensCompletion = result.tokensCompletion;
        responseMs = result.durationMs;
      } catch (err) {
        await log({
          restaurantId: instance!.restaurant_id,
          instanceId: instance!.id,
          kind: "error",
          action: "ai_reply",
          error: err instanceof Error ? err.message : String(err),
        });
      }

      if (settings.reply_delay_ms > 0) {
        await new Promise((r) => setTimeout(r, Math.min(settings.reply_delay_ms, 5000)));
      }

      const sent = await evo.sendText(instance!.instance_name, phone, reply);

      await repos.messages.create({
        restaurant_id: instance!.restaurant_id,
        instance_id: instance!.id,
        conversation_id: conversation.id,
        phone,
        direction: "outbound",
        message: reply,
        type: "text",
        status: "sent",
        source: "ai",
        tokens_prompt: tokensPrompt,
        tokens_completion: tokensCompletion,
        response_ms: responseMs,
        external_id: (sent as any)?.key?.id ?? null,
      });
      await repos.conversations.touch(conversation.id);
    }

    return ok();
  }
});