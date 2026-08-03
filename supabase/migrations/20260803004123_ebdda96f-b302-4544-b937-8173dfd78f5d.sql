ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name = ANY (ARRAY['menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders','vitrine_digital','digital_comanda','event_bookings','staff_schedule','whatsapp_ai']));

-- 1) whatsapp_instances
CREATE TABLE public.whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  instance_name text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'disconnected',
  qr_code text,
  last_error text,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instance_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_instances_tenant_admin" ON public.whatsapp_instances
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 2) whatsapp_contacts
CREATE TABLE public.whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  instance_id uuid NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text,
  photo_url text,
  last_message text,
  last_seen timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instance_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contacts TO authenticated;
GRANT ALL ON public.whatsapp_contacts TO service_role;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_contacts_tenant_admin" ON public.whatsapp_contacts
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 3) whatsapp_conversations
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  instance_id uuid NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'ai',
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  unread_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instance_id, contact_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_conversations TO authenticated;
GRANT ALL ON public.whatsapp_conversations TO service_role;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_conversations_tenant_admin" ON public.whatsapp_conversations
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 4) whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  instance_id uuid NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  phone text NOT NULL,
  direction text NOT NULL,
  message text,
  media_url text,
  type text NOT NULL DEFAULT 'text',
  status text NOT NULL DEFAULT 'sent',
  source text NOT NULL DEFAULT 'human',
  tokens_prompt integer NOT NULL DEFAULT 0,
  tokens_completion integer NOT NULL DEFAULT 0,
  response_ms integer,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_messages_tenant_admin" ON public.whatsapp_messages
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_wa_messages_conversation ON public.whatsapp_messages(conversation_id, created_at);
CREATE INDEX idx_wa_messages_restaurant_created ON public.whatsapp_messages(restaurant_id, created_at);

-- 5) ai_prompts
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  prompt text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT false,
  parent_id uuid REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prompts_tenant_admin" ON public.ai_prompts
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 6) ai_settings
CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  model text NOT NULL DEFAULT 'openai/gpt-4o-mini',
  temperature numeric NOT NULL DEFAULT 0.7,
  top_p numeric NOT NULL DEFAULT 1,
  max_tokens integer NOT NULL DEFAULT 800,
  timeout_ms integer NOT NULL DEFAULT 30000,
  retry integer NOT NULL DEFAULT 2,
  welcome_message text,
  fallback_message text NOT NULL DEFAULT 'Não tenho essa informação agora. Vou encaminhar para um atendente.',
  reply_delay_ms integer NOT NULL DEFAULT 1000,
  abandon_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_settings_tenant_admin" ON public.ai_settings
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 7) whatsapp_logs
CREATE TABLE public.whatsapp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  instance_id uuid REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL,
  kind text NOT NULL,
  action text NOT NULL,
  status_code integer,
  duration_ms integer,
  request jsonb,
  response jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_logs TO authenticated;
GRANT ALL ON public.whatsapp_logs TO service_role;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_logs_tenant_admin_select" ON public.whatsapp_logs
  FOR SELECT TO authenticated
  USING (restaurant_id IS NOT NULL AND public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_wa_logs_restaurant_created ON public.whatsapp_logs(restaurant_id, created_at DESC);

-- updated_at triggers
CREATE TRIGGER trg_wa_instances_updated BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_wa_contacts_updated BEFORE UPDATE ON public.whatsapp_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_wa_conversations_updated BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_prompts_updated BEFORE UPDATE ON public.ai_prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_settings_updated BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- realtime
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_instances REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_instances;

-- módulo para estabelecimentos existentes
INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active)
SELECT r.id, 'whatsapp_ai', false FROM public.restaurants r
WHERE NOT EXISTS (
  SELECT 1 FROM public.restaurant_modules m
  WHERE m.restaurant_id = r.id AND m.module_name = 'whatsapp_ai'
);