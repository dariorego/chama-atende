
-- =====================================================
-- CUSTOMER_REVIEWS: Restringir leitura pública (esconder phone)
-- =====================================================
DROP POLICY IF EXISTS "Public can view published reviews" ON public.customer_reviews;

-- Somente admin/manager podem ler reviews (elimina exposição de phone)
CREATE POLICY "Admins and managers can view all reviews"
ON public.customer_reviews FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role));

-- Constraints de validação
ALTER TABLE public.customer_reviews
  DROP CONSTRAINT IF EXISTS customer_reviews_customer_name_len,
  DROP CONSTRAINT IF EXISTS customer_reviews_phone_len,
  DROP CONSTRAINT IF EXISTS customer_reviews_observations_len,
  DROP CONSTRAINT IF EXISTS customer_reviews_ambiente_rating_range,
  DROP CONSTRAINT IF EXISTS customer_reviews_atendimento_rating_range,
  DROP CONSTRAINT IF EXISTS customer_reviews_comida_rating_range;

ALTER TABLE public.customer_reviews
  ADD CONSTRAINT customer_reviews_customer_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT customer_reviews_phone_len CHECK (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20),
  ADD CONSTRAINT customer_reviews_observations_len CHECK (observations IS NULL OR char_length(observations) <= 1000),
  ADD CONSTRAINT customer_reviews_ambiente_rating_range CHECK (ambiente_rating IS NULL OR ambiente_rating BETWEEN 1 AND 5),
  ADD CONSTRAINT customer_reviews_atendimento_rating_range CHECK (atendimento_rating IS NULL OR atendimento_rating BETWEEN 1 AND 5),
  ADD CONSTRAINT customer_reviews_comida_rating_range CHECK (comida_rating IS NULL OR comida_rating BETWEEN 1 AND 5);

-- =====================================================
-- ORDERS: Remover leitura/atualização pública
-- =====================================================
DROP POLICY IF EXISTS "Public can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update recent orders" ON public.orders;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_customer_name_len,
  DROP CONSTRAINT IF EXISTS orders_table_number_len,
  DROP CONSTRAINT IF EXISTS orders_observations_len;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_name_len CHECK (customer_name IS NULL OR char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT orders_table_number_len CHECK (table_number IS NULL OR char_length(table_number) BETWEEN 1 AND 20),
  ADD CONSTRAINT orders_observations_len CHECK (observations IS NULL OR char_length(observations) <= 1000);

-- =====================================================
-- PRE_ORDERS
-- =====================================================
DROP POLICY IF EXISTS "Public can view pre_orders" ON public.pre_orders;
DROP POLICY IF EXISTS "Public can update recent pre_orders" ON public.pre_orders;

ALTER TABLE public.pre_orders
  DROP CONSTRAINT IF EXISTS pre_orders_customer_name_len,
  DROP CONSTRAINT IF EXISTS pre_orders_customer_phone_len,
  DROP CONSTRAINT IF EXISTS pre_orders_observations_len;

ALTER TABLE public.pre_orders
  ADD CONSTRAINT pre_orders_customer_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT pre_orders_customer_phone_len CHECK (customer_phone IS NULL OR char_length(customer_phone) BETWEEN 8 AND 20),
  ADD CONSTRAINT pre_orders_observations_len CHECK (observations IS NULL OR char_length(observations) <= 1000);

-- =====================================================
-- QUEUE_ENTRIES
-- =====================================================
DROP POLICY IF EXISTS "Public can view queue entries" ON public.queue_entries;
DROP POLICY IF EXISTS "Public can update today queue entries" ON public.queue_entries;

ALTER TABLE public.queue_entries
  DROP CONSTRAINT IF EXISTS queue_entries_customer_name_len,
  DROP CONSTRAINT IF EXISTS queue_entries_phone_len,
  DROP CONSTRAINT IF EXISTS queue_entries_notes_len,
  DROP CONSTRAINT IF EXISTS queue_entries_party_size_range;

ALTER TABLE public.queue_entries
  ADD CONSTRAINT queue_entries_customer_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT queue_entries_phone_len CHECK (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20),
  ADD CONSTRAINT queue_entries_notes_len CHECK (notes IS NULL OR char_length(notes) <= 500),
  ADD CONSTRAINT queue_entries_party_size_range CHECK (party_size BETWEEN 1 AND 50);

-- =====================================================
-- RESERVATIONS
-- =====================================================
DROP POLICY IF EXISTS "Public can update own reservation" ON public.reservations;

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_customer_name_len,
  DROP CONSTRAINT IF EXISTS reservations_phone_len,
  DROP CONSTRAINT IF EXISTS reservations_notes_len,
  DROP CONSTRAINT IF EXISTS reservations_party_size_range;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_customer_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT reservations_phone_len CHECK (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20),
  ADD CONSTRAINT reservations_notes_len CHECK (notes IS NULL OR char_length(notes) <= 500),
  ADD CONSTRAINT reservations_party_size_range CHECK (party_size BETWEEN 1 AND 50);

-- =====================================================
-- SERVICE_CALLS
-- =====================================================
DROP POLICY IF EXISTS "Public read access for service calls" ON public.service_calls;
DROP POLICY IF EXISTS "Public can update recent service calls" ON public.service_calls;

-- =====================================================
-- TABLE_SESSIONS
-- =====================================================
DROP POLICY IF EXISTS "Public read access for table sessions" ON public.table_sessions;
DROP POLICY IF EXISTS "Public can update open table sessions" ON public.table_sessions;

-- =====================================================
-- SECURITY DEFINER FUNCTIONS: revogar EXECUTE de anon/authenticated
-- onde inadequado. Manter search_* pois são pontos de acesso público intencionais.
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.get_user_restaurant_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_tenant_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, tenant_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- =====================================================
-- verify_admin_access RPC (server-side check)
-- =====================================================
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  )
$$;
REVOKE EXECUTE ON FUNCTION public.verify_admin_access() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO authenticated;

-- =====================================================
-- STORAGE: restringir listagem do bucket 'imagens'
-- Arquivos individuais continuam acessíveis por URL pública direta.
-- =====================================================
DROP POLICY IF EXISTS "Public listing imagens" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can list imagens" ON storage.objects;
DROP POLICY IF EXISTS "Public read imagens" ON storage.objects;

CREATE POLICY "Public read individual imagens files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'imagens'
  AND (current_setting('request.method', true) IS DISTINCT FROM 'GET' OR name IS NOT NULL)
);
