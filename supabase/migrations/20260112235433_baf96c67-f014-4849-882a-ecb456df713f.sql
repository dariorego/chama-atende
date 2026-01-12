-- =============================================
-- FASE 1: MIGRAÇÃO MULTI-TENANT SAAS
-- =============================================

-- 1.1 Expandir tabela restaurants (tenants)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 3;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"customDomain": false, "analytics": false, "api": false}'::jsonb;

-- 1.2 Adicionar restaurant_id às tabelas que não têm
ALTER TABLE tables ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE waiters ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

-- Para service_calls e table_sessions, vamos adicionar restaurant_id derivado da table
ALTER TABLE service_calls ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE table_sessions ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

-- 1.3 Criar enum de roles por tenant (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_role') THEN
    CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'manager', 'staff', 'kitchen', 'waiter');
  END IF;
END $$;

-- 1.4 Criar tabela de roles por tenant
CREATE TABLE IF NOT EXISTS tenant_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  role tenant_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, restaurant_id, role)
);

-- Habilitar RLS
ALTER TABLE tenant_user_roles ENABLE ROW LEVEL SECURITY;

-- 1.5 Criar funções auxiliares para multi-tenant
CREATE OR REPLACE FUNCTION get_user_restaurant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION has_tenant_access(_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND restaurant_id = _restaurant_id
  )
  OR EXISTS (
    SELECT 1 FROM tenant_user_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = _restaurant_id
  )
$$;

CREATE OR REPLACE FUNCTION has_tenant_role(_restaurant_id UUID, _role tenant_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_user_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = _restaurant_id
    AND role = _role
  )
$$;

-- 1.6 Policies para tenant_user_roles
CREATE POLICY "Users can view own tenant roles"
ON tenant_user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Tenant owners can manage roles"
ON tenant_user_roles FOR ALL
USING (
  has_tenant_role(restaurant_id, 'owner'::tenant_role)
  OR has_tenant_role(restaurant_id, 'admin'::tenant_role)
)
WITH CHECK (
  has_tenant_role(restaurant_id, 'owner'::tenant_role)
  OR has_tenant_role(restaurant_id, 'admin'::tenant_role)
);

-- 1.7 Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waiters_restaurant_id ON waiters(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_restaurant_id ON queue_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_service_calls_restaurant_id ON service_calls(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_restaurant_id ON table_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_user_roles_user_id ON tenant_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_user_roles_restaurant_id ON tenant_user_roles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_custom_domain ON restaurants(custom_domain) WHERE custom_domain IS NOT NULL;