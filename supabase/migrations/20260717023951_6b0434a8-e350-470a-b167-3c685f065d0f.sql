
-- =========================================================
-- Security fixes migration
-- =========================================================

-- 1) customer_reviews: replace legacy-role admin policy with tenant-scoped one
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.customer_reviews;
CREATE POLICY "Tenant admins manage reviews"
ON public.customer_reviews
FOR ALL
TO authenticated
USING (public.has_tenant_admin(restaurant_id))
WITH CHECK (public.has_tenant_admin(restaurant_id));

-- 2) storage.objects (imagens bucket): drop legacy-role policies, replace with tenant-scoped
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;

CREATE POLICY "Tenant admins upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagens'
  AND EXISTS (
    SELECT 1 FROM public.tenant_user_roles
    WHERE user_id = auth.uid()
      AND role IN ('owner'::public.tenant_role, 'admin'::public.tenant_role, 'manager'::public.tenant_role)
  )
);

CREATE POLICY "Tenant admins update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imagens'
  AND EXISTS (
    SELECT 1 FROM public.tenant_user_roles
    WHERE user_id = auth.uid()
      AND role IN ('owner'::public.tenant_role, 'admin'::public.tenant_role, 'manager'::public.tenant_role)
  )
);

CREATE POLICY "Tenant admins delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imagens'
  AND EXISTS (
    SELECT 1 FROM public.tenant_user_roles
    WHERE user_id = auth.uid()
      AND role IN ('owner'::public.tenant_role, 'admin'::public.tenant_role, 'manager'::public.tenant_role)
  )
);

-- 3) Remove public SELECT on customer order line items / selections / pre_order_items
--    Reads for customers go through the public-api edge function using the service role.
DROP POLICY IF EXISTS "Public can view line items" ON public.order_line_items;
DROP POLICY IF EXISTS "Public can view selections" ON public.order_line_item_selections;
DROP POLICY IF EXISTS "Public can view pre_order_items" ON public.pre_order_items;

-- 4) Remove public INSERT on order line items / selections (price tampering)
--    All order line item creation must go through the public-api edge function which
--    fetches authoritative prices server-side.
DROP POLICY IF EXISTS "Public can create line items for recent orders" ON public.order_line_items;
DROP POLICY IF EXISTS "Public can create selections for recent orders" ON public.order_line_item_selections;

-- Also remove public INSERT on pre_order_items so items must go through the edge function
-- (create-preorder), which will insert them with server-computed prices.
DROP POLICY IF EXISTS "Public can create pre_order_items for recent orders" ON public.pre_order_items;

-- 5) order_item_groups: scope public read to active parent order_items
DROP POLICY IF EXISTS "Public read item groups" ON public.order_item_groups;
CREATE POLICY "Public read item groups"
ON public.order_item_groups
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    WHERE oi.id = order_item_groups.order_item_id
      AND oi.is_active = true
  )
);

-- 6) table_sessions: add per-session token so only the client that opened the
--    session can view/cancel service calls tied to it.
ALTER TABLE public.table_sessions
  ADD COLUMN IF NOT EXISTS session_token uuid DEFAULT gen_random_uuid();

UPDATE public.table_sessions
SET session_token = gen_random_uuid()
WHERE session_token IS NULL;

-- 7) Tighten SECURITY DEFINER function EXECUTE grants.
--    Functions used only inside RLS policies or triggers should not be
--    directly executable by end users via PostgREST.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- Keep EXECUTE for functions that are called from the client via .rpc()
-- (verify_admin_access, search_reservations_by_phone, search_pre_orders_by_phone)
-- and for tenant helpers that MUST be resolvable during RLS policy evaluation
-- (has_tenant_admin, has_tenant_access, has_tenant_role).
