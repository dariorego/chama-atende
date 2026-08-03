import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { createLogger } from "../_shared/whatsapp/logger.ts";
import { createRepositories } from "../_shared/whatsapp/repositories.ts";
import { EvolutionService, extractQrCode, getEvolutionConfig } from "../_shared/whatsapp/evolution.service.ts";
import { OpenRouterService } from "../_shared/whatsapp/openrouter.service.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const BodySchema = z.object({
  action: z.enum([
    "create_instance",
    "delete_instance",
    "qrcode",
    "status",
    "restart",
    "disconnect",
    "send_message",
    "test_prompt",
  ]),
  restaurantId: z.string().uuid(),
  instanceId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  message: z.string().trim().min(1).max(4000).optional(),
  conversationId: z.string().uuid().optional(),
  prompt: z.string().trim().min(1).max(20000).optional(),
  model: z.string().trim().max(120).optional(),
  input: z.string().trim().min(1).max(2000).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function statusFromEvolution(payload: unknown): "connected" | "connecting" | "qr" | "disconnected" {
  const state = (payload as any)?.instance?.state ?? (payload as any)?.state;
  if (state === "open") return "connected";
  if (state === "connecting") return "connecting";
  if (state === "close") return "disconnected";
  return "disconnected";
}

function slugifyInstance(restaurantId: string, name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "wa";
  return `${base}-${restaurantId.slice(0, 8)}-${Date.now().toString(36).slice(-4)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Não autenticado" }, 401);

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Sessão inválida" }, 401);

  let body: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    body = parsed.data;
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  // Autorização: owner/admin/manager do estabelecimento
  const { data: roleRow } = await db
    .from("tenant_user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("restaurant_id", body.restaurantId)
    .in("role", ["owner", "admin", "manager"])
    .maybeSingle();
  if (!roleRow) return json({ error: "Sem permissão neste estabelecimento" }, 403);

  const log = createLogger(db);
  const repos = createRepositories(db);

  try {
    if (body.action === "test_prompt") {
      const settings = await repos.settings.byRestaurant(body.restaurantId);
      const ai = OpenRouterService.fromEnv(log, { restaurantId: body.restaurantId });
      const result = await ai.complete({
        model: body.model ?? settings?.model ?? "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: body.prompt ?? "Você é um atendente educado." },
          { role: "user", content: body.input ?? "Olá!" },
        ],
        temperature: Number(settings?.temperature ?? 0.7),
        topP: Number(settings?.top_p ?? 1),
        maxTokens: settings?.max_tokens ?? 500,
        timeoutMs: settings?.timeout_ms ?? 30000,
        retry: settings?.retry ?? 1,
      });
      return json({ ok: true, result });
    }

    const evoConfig = getEvolutionConfig();
    const webhookSecret = Deno.env.get("WHATSAPP_WEBHOOK_SECRET") ?? "";
    const webhookUrl = `${SUPABASE_URL}/functions/v1/whatsapp-webhook?secret=${encodeURIComponent(webhookSecret)}`;

    if (body.action === "create_instance") {
      if (!body.name) return json({ error: "Informe o nome da conexão" }, 400);
      const instanceName = slugifyInstance(body.restaurantId, body.name);
      const instance = await repos.instances.create({
        restaurant_id: body.restaurantId,
        name: body.name,
        instance_name: instanceName,
      });
      const evo = new EvolutionService(evoConfig, log, {
        restaurantId: body.restaurantId,
        instanceId: instance.id,
      });
      try {
        const created = await evo.createInstance(instanceName, webhookUrl);
        const qr = extractQrCode(created);
        await repos.instances.update(instance.id, {
          status: qr ? "qr" : "connecting",
          qr_code: qr,
          last_error: null,
        });
        return json({ ok: true, instanceId: instance.id, qrCode: qr });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await repos.instances.update(instance.id, { status: "error", last_error: msg });
        return json({ error: msg }, 502);
      }
    }

    if (!body.instanceId) return json({ error: "instanceId obrigatório" }, 400);
    const instance = await repos.instances.byId(body.instanceId);
    if (!instance || instance.restaurant_id !== body.restaurantId) {
      return json({ error: "Conexão não encontrada" }, 404);
    }

    const evo = new EvolutionService(evoConfig, log, {
      restaurantId: instance.restaurant_id,
      instanceId: instance.id,
    });

    switch (body.action) {
      case "qrcode": {
        const res = await evo.connect(instance.instance_name);
        const qr = extractQrCode(res);
        await evo.setWebhook(instance.instance_name, webhookUrl).catch(() => null);
        await repos.instances.update(instance.id, {
          qr_code: qr,
          status: qr ? "qr" : statusFromEvolution(res),
          last_error: null,
        });
        return json({ ok: true, qrCode: qr });
      }
      case "status": {
        const res = await evo.getStatus(instance.instance_name);
        const status = statusFromEvolution(res);
        await repos.instances.update(instance.id, {
          status,
          ...(status === "connected" ? { qr_code: null, connected_at: new Date().toISOString() } : {}),
        });
        return json({ ok: true, status });
      }
      case "restart": {
        await evo.restart(instance.instance_name);
        await repos.instances.update(instance.id, { status: "connecting", last_error: null });
        return json({ ok: true });
      }
      case "disconnect": {
        await evo.logout(instance.instance_name).catch(() => null);
        await repos.instances.update(instance.id, {
          status: "disconnected",
          qr_code: null,
          connected_at: null,
        });
        return json({ ok: true });
      }
      case "delete_instance": {
        await evo.logout(instance.instance_name).catch(() => null);
        await evo.deleteInstance(instance.instance_name).catch(() => null);
        await repos.instances.remove(instance.id);
        return json({ ok: true });
      }
      case "send_message": {
        if (!body.phone || !body.message) return json({ error: "Telefone e mensagem obrigatórios" }, 400);
        const phone = body.phone.replace(/\D/g, "");
        const sent = await evo.sendText(instance.instance_name, phone, body.message);

        const contact = await repos.contacts.upsert({
          restaurant_id: instance.restaurant_id,
          instance_id: instance.id,
          phone,
          last_message: body.message,
        });
        const conversation = await repos.conversations.ensure({
          restaurant_id: instance.restaurant_id,
          instance_id: instance.id,
          contact_id: contact.id,
        });
        await repos.messages.create({
          restaurant_id: instance.restaurant_id,
          instance_id: instance.id,
          conversation_id: conversation.id,
          phone,
          direction: "outbound",
          message: body.message,
          type: "text",
          status: "sent",
          source: "human",
          external_id: (sent as any)?.key?.id ?? null,
        });
        await repos.conversations.touch(conversation.id, { mode: "human", unread_count: 0 });
        return json({ ok: true, conversationId: conversation.id });
      }
    }

    return json({ error: "Ação não suportada" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[whatsapp-manage]", msg);
    await log({ restaurantId: body.restaurantId, kind: "error", action: body.action, error: msg });
    return json({ error: msg }, 500);
  }
});