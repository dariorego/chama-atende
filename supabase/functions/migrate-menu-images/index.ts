import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BUCKET = "imagens";

const BodySchema = z.object({
  restaurantId: z.string().uuid(),
  dryRun: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function safeName(url: string) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "imagem");
    return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase().slice(0, 48) || "imagem";
  } catch {
    return "imagem";
  }
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

  const { data: roleRow } = await db
    .from("tenant_user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("restaurant_id", body.restaurantId)
    .in("role", ["owner", "admin", "manager"])
    .maybeSingle();
  if (!roleRow) return json({ error: "Sem permissão neste estabelecimento" }, 403);

  const { data: restaurant, error: restErr } = await db
    .from("restaurants")
    .select("slug")
    .eq("id", body.restaurantId)
    .maybeSingle();
  if (restErr || !restaurant) return json({ error: "Estabelecimento não encontrado" }, 404);

  const slug = restaurant.slug as string;
  const targetPrefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}/cardapio/`;

  const { data: products, error: prodErr } = await db
    .from("menu_products")
    .select("id, name, image_url")
    .eq("restaurant_id", body.restaurantId)
    .not("image_url", "is", null);
  if (prodErr) return json({ error: prodErr.message }, 500);

  const pending = (products ?? []).filter(
    (p) => typeof p.image_url === "string" && p.image_url.length > 0 && !p.image_url.startsWith(targetPrefix),
  );

  if (body.dryRun) {
    return json({
      slug,
      total: products?.length ?? 0,
      pending: pending.length,
      sample: pending.slice(0, 5).map((p) => ({ name: p.name, image_url: p.image_url })),
    });
  }

  const batch = pending.slice(0, body.limit);
  const results: { ok: boolean; message: string }[] = [];

  for (const product of batch) {
    const sourceUrl = product.image_url as string;
    try {
      const res = await fetch(sourceUrl);
      if (!res.ok) throw new Error(`download HTTP ${res.status}`);
      const contentType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
      if (!contentType.startsWith("image/")) throw new Error(`tipo inesperado: ${contentType}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength === 0) throw new Error("arquivo vazio");

      const ext = EXT_BY_TYPE[contentType] ?? "jpg";
      const path = `${slug}/cardapio/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(sourceUrl)}.${ext}`;

      const { error: upErr } = await db.storage.from(BUCKET).upload(path, bytes, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw new Error(`upload: ${upErr.message}`);

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      const { error: updErr } = await db
        .from("menu_products")
        .update({ image_url: publicUrl })
        .eq("id", product.id);
      if (updErr) throw new Error(`update: ${updErr.message}`);

      results.push({ ok: true, message: `${product.name} → ${path}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "falha desconhecida";
      results.push({ ok: false, message: `${product.name}: ${msg}` });
    }
  }

  const migrated = results.filter((r) => r.ok).length;
  return json({
    slug,
    processed: batch.length,
    migrated,
    failed: results.length - migrated,
    remaining: Math.max(pending.length - migrated, 0),
    results,
  });
});
