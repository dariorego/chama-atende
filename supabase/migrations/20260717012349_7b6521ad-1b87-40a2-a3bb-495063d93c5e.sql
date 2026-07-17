
-- Storage: remove broad public SELECT; keep only my safer policy; also drop old
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public read individual imagens files" ON storage.objects;
-- Public buckets: files are still served via /storage/v1/object/public/... (bypasses RLS),
-- so no SELECT policy needed for individual reads. Listing (requires SELECT via RLS) is blocked.

-- Tighten INSERT policies (replace WITH CHECK (true) with real validations)
DROP POLICY IF EXISTS "Public can create reviews" ON public.customer_reviews;
CREATE POLICY "Public can create reviews"
ON public.customer_reviews FOR INSERT
TO anon, authenticated
WITH CHECK (
  restaurant_id IS NOT NULL
  AND char_length(customer_name) BETWEEN 1 AND 100
  AND (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20)
  AND (observations IS NULL OR char_length(observations) <= 1000)
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (
  restaurant_id IS NOT NULL
  AND (customer_name IS NULL OR char_length(customer_name) BETWEEN 1 AND 100)
  AND (table_number IS NULL OR char_length(table_number) BETWEEN 1 AND 20)
  AND (observations IS NULL OR char_length(observations) <= 1000)
);

DROP POLICY IF EXISTS "Public can create pre_orders" ON public.pre_orders;
CREATE POLICY "Public can create pre_orders"
ON public.pre_orders FOR INSERT
TO anon, authenticated
WITH CHECK (
  restaurant_id IS NOT NULL
  AND char_length(customer_name) BETWEEN 1 AND 100
  AND (customer_phone IS NULL OR char_length(customer_phone) BETWEEN 8 AND 20)
  AND (observations IS NULL OR char_length(observations) <= 1000)
);

DROP POLICY IF EXISTS "Public can create queue entries" ON public.queue_entries;
CREATE POLICY "Public can create queue entries"
ON public.queue_entries FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(customer_name) BETWEEN 1 AND 100
  AND (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20)
  AND party_size BETWEEN 1 AND 50
  AND (notes IS NULL OR char_length(notes) <= 500)
);

DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
CREATE POLICY "Public can create reservations"
ON public.reservations FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(customer_name) BETWEEN 1 AND 100
  AND (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20)
  AND party_size BETWEEN 1 AND 50
  AND (notes IS NULL OR char_length(notes) <= 500)
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Public can create service calls" ON public.service_calls;
CREATE POLICY "Public can create service calls"
ON public.service_calls FOR INSERT
TO anon, authenticated
WITH CHECK (
  table_id IS NOT NULL
  AND call_type IN ('waiter','bill','help')
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Public can create table sessions" ON public.table_sessions;
CREATE POLICY "Public can create table sessions"
ON public.table_sessions FOR INSERT
TO anon, authenticated
WITH CHECK (
  table_id IS NOT NULL
  AND (status IS NULL OR status = 'open')
);
