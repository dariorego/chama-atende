import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { AiPrompt, AiSettings, WhatsappInstance } from "./types.ts";

export function createRepositories(db: SupabaseClient) {
  return {
    instances: {
      async byId(id: string): Promise<WhatsappInstance | null> {
        const { data } = await db.from("whatsapp_instances").select("*").eq("id", id).maybeSingle();
        return (data as WhatsappInstance) ?? null;
      },
      async byInstanceName(instanceName: string): Promise<WhatsappInstance | null> {
        const { data } = await db
          .from("whatsapp_instances")
          .select("*")
          .eq("instance_name", instanceName)
          .maybeSingle();
        return (data as WhatsappInstance) ?? null;
      },
      async create(payload: {
        restaurant_id: string;
        name: string;
        instance_name: string;
      }): Promise<WhatsappInstance> {
        const { data, error } = await db.from("whatsapp_instances").insert(payload).select("*").single();
        if (error) throw new Error(error.message);
        return data as WhatsappInstance;
      },
      async update(id: string, patch: Record<string, unknown>) {
        const { error } = await db.from("whatsapp_instances").update(patch).eq("id", id);
        if (error) throw new Error(error.message);
      },
      async remove(id: string) {
        const { error } = await db.from("whatsapp_instances").delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
    },

    contacts: {
      async upsert(payload: {
        restaurant_id: string;
        instance_id: string;
        phone: string;
        name?: string | null;
        photo_url?: string | null;
        last_message?: string | null;
      }) {
        const { data, error } = await db
          .from("whatsapp_contacts")
          .upsert(
            { ...payload, last_seen: new Date().toISOString() },
            { onConflict: "instance_id,phone" },
          )
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        return data as { id: string; phone: string; name: string | null };
      },
    },

    conversations: {
      async ensure(payload: { restaurant_id: string; instance_id: string; contact_id: string }) {
        const { data: existing } = await db
          .from("whatsapp_conversations")
          .select("*")
          .eq("instance_id", payload.instance_id)
          .eq("contact_id", payload.contact_id)
          .maybeSingle();
        if (existing) return existing as { id: string; mode: string; status: string };

        const { data, error } = await db
          .from("whatsapp_conversations")
          .insert({ ...payload, last_message_at: new Date().toISOString() })
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        return data as { id: string; mode: string; status: string };
      },
      async touch(id: string, patch: Record<string, unknown> = {}) {
        await db
          .from("whatsapp_conversations")
          .update({ last_message_at: new Date().toISOString(), ...patch })
          .eq("id", id);
      },
      async bumpUnread(id: string, current: number) {
        await db
          .from("whatsapp_conversations")
          .update({ unread_count: current + 1, last_message_at: new Date().toISOString() })
          .eq("id", id);
      },
    },

    messages: {
      async create(payload: Record<string, unknown>) {
        const { data, error } = await db.from("whatsapp_messages").insert(payload).select("id").single();
        if (error) throw new Error(error.message);
        return data as { id: string };
      },
      async history(conversationId: string, limit = 20) {
        const { data } = await db
          .from("whatsapp_messages")
          .select("direction, message, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(limit);
        return (data ?? []).reverse() as { direction: string; message: string | null }[];
      },
      async existsExternal(externalId: string) {
        const { data } = await db
          .from("whatsapp_messages")
          .select("id")
          .eq("external_id", externalId)
          .maybeSingle();
        return !!data;
      },
    },

    prompts: {
      async active(restaurantId: string): Promise<AiPrompt | null> {
        const { data } = await db
          .from("ai_prompts")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .eq("is_active", true)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();
        return (data as AiPrompt) ?? null;
      },
    },

    settings: {
      async byRestaurant(restaurantId: string): Promise<AiSettings | null> {
        const { data } = await db
          .from("ai_settings")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .maybeSingle();
        return (data as AiSettings) ?? null;
      },
    },
  };
}

export type Repositories = ReturnType<typeof createRepositories>;