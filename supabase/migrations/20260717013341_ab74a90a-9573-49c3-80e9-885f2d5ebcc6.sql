
-- 1) Helper: tenant admin check (owner/admin/manager on that tenant)
CREATE OR REPLACE FUNCTION public.has_tenant_admin(_restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_user_roles
    WHERE user_id = auth.uid()
      AND restaurant_id = _restaurant_id
      AND role IN ('owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
  )
$$;

REVOKE ALL ON FUNCTION public.has_tenant_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_admin(uuid) TO service_role;

-- 2) Revoke public EXECUTE on SECURITY DEFINER functions that don't need it.
--    Client uses these via the public-api edge function now.
REVOKE ALL ON FUNCTION public.search_pre_orders_by_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_pre_orders_by_phone(text) TO service_role;

REVOKE ALL ON FUNCTION public.search_reservations_by_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_reservations_by_phone(text) TO service_role;

REVOKE ALL ON FUNCTION public.verify_admin_access() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

REVOKE ALL ON FUNCTION public.has_tenant_access(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.has_tenant_role(uuid, tenant_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, tenant_role) TO service_role;

REVOKE ALL ON FUNCTION public.get_user_restaurant_id() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_restaurant_id() TO service_role;

-- 3) Fix always-true INSERT policy on keep_alive
DROP POLICY IF EXISTS "allow anon insert keep_alive" ON public.keep_alive;
CREATE POLICY "authenticated insert keep_alive" ON public.keep_alive
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4) Rewrite admin policies to be tenant-scoped via has_tenant_admin(restaurant_id)

-- customer_reviews
DROP POLICY IF EXISTS "Admins and managers can view all reviews" ON public.customer_reviews;
CREATE POLICY "Tenant admins view reviews" ON public.customer_reviews
  FOR SELECT TO authenticated
  USING (public.has_tenant_admin(restaurant_id));

-- menu_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.menu_categories;
CREATE POLICY "Tenant admins manage categories" ON public.menu_categories
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- menu_products
DROP POLICY IF EXISTS "Admins can manage products" ON public.menu_products;
CREATE POLICY "Tenant admins manage products" ON public.menu_products
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- order_combination_groups
DROP POLICY IF EXISTS "Admins manage combination groups" ON public.order_combination_groups;
CREATE POLICY "Tenant admins manage combination groups" ON public.order_combination_groups
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- order_combination_options (via group_id)
DROP POLICY IF EXISTS "Admins manage combination options" ON public.order_combination_options;
CREATE POLICY "Tenant admins manage combination options" ON public.order_combination_options
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.order_combination_groups g
    WHERE g.id = order_combination_options.group_id
      AND public.has_tenant_admin(g.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.order_combination_groups g
    WHERE g.id = order_combination_options.group_id
      AND public.has_tenant_admin(g.restaurant_id)
  ));

-- order_item_groups (via order_item_id)
DROP POLICY IF EXISTS "Admins manage item groups" ON public.order_item_groups;
CREATE POLICY "Tenant admins manage item groups" ON public.order_item_groups
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.order_items oi
    WHERE oi.id = order_item_groups.order_item_id
      AND public.has_tenant_admin(oi.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.order_items oi
    WHERE oi.id = order_item_groups.order_item_id
      AND public.has_tenant_admin(oi.restaurant_id)
  ));

-- order_items
DROP POLICY IF EXISTS "Admins manage order items" ON public.order_items;
CREATE POLICY "Tenant admins manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- order_line_items (via order_id)
DROP POLICY IF EXISTS "Admins manage line items" ON public.order_line_items;
CREATE POLICY "Tenant admins manage line items" ON public.order_line_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_line_items.order_id
      AND public.has_tenant_admin(o.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_line_items.order_id
      AND public.has_tenant_admin(o.restaurant_id)
  ));

-- order_line_item_selections (via line_item_id -> order_line_items -> orders)
DROP POLICY IF EXISTS "Admins manage selections" ON public.order_line_item_selections;
CREATE POLICY "Tenant admins manage selections" ON public.order_line_item_selections
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.order_line_items li
    JOIN public.orders o ON o.id = li.order_id
    WHERE li.id = order_line_item_selections.line_item_id
      AND public.has_tenant_admin(o.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.order_line_items li
    JOIN public.orders o ON o.id = li.order_id
    WHERE li.id = order_line_item_selections.line_item_id
      AND public.has_tenant_admin(o.restaurant_id)
  ));

-- orders
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Tenant admins manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- pre_orders
DROP POLICY IF EXISTS "Admins can manage pre_orders" ON public.pre_orders;
CREATE POLICY "Tenant admins manage pre_orders" ON public.pre_orders
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- pre_order_items (via pre_order_id)
DROP POLICY IF EXISTS "Admins can manage pre_order_items" ON public.pre_order_items;
CREATE POLICY "Tenant admins manage pre_order_items" ON public.pre_order_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pre_orders p
    WHERE p.id = pre_order_items.pre_order_id
      AND public.has_tenant_admin(p.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pre_orders p
    WHERE p.id = pre_order_items.pre_order_id
      AND public.has_tenant_admin(p.restaurant_id)
  ));

-- profiles (admin viewing all profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Tenant admins view tenant profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (restaurant_id IS NOT NULL AND public.has_tenant_admin(restaurant_id));

-- queue_entries
DROP POLICY IF EXISTS "Admins can manage queue entries" ON public.queue_entries;
CREATE POLICY "Tenant admins manage queue entries" ON public.queue_entries
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- reservations
DROP POLICY IF EXISTS "Admins can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can view own reservations by phone" ON public.reservations;
CREATE POLICY "Tenant admins manage reservations" ON public.reservations
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- restaurant_modules
DROP POLICY IF EXISTS "Admins can manage modules" ON public.restaurant_modules;
DROP POLICY IF EXISTS "Admins can view all modules" ON public.restaurant_modules;
DROP POLICY IF EXISTS "Authenticated users view active modules" ON public.restaurant_modules;
CREATE POLICY "Tenant admins manage modules" ON public.restaurant_modules
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE POLICY "Tenant members view modules" ON public.restaurant_modules
  FOR SELECT TO authenticated
  USING (public.has_tenant_access(restaurant_id));

-- restaurants
DROP POLICY IF EXISTS "Admins can manage restaurant" ON public.restaurants;
CREATE POLICY "Tenant admins manage restaurant" ON public.restaurants
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(id))
  WITH CHECK (public.has_tenant_admin(id));

-- service_calls
DROP POLICY IF EXISTS "Admins can manage service calls" ON public.service_calls;
CREATE POLICY "Tenant admins manage service calls" ON public.service_calls
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- table_sessions
DROP POLICY IF EXISTS "Admins can manage table sessions" ON public.table_sessions;
CREATE POLICY "Tenant admins manage table sessions" ON public.table_sessions
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- tables
DROP POLICY IF EXISTS "Admins can manage tables" ON public.tables;
CREATE POLICY "Tenant admins manage tables" ON public.tables
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- waiters
DROP POLICY IF EXISTS "Admins can manage waiters" ON public.waiters;
CREATE POLICY "Tenant admins manage waiters" ON public.waiters
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- user_roles: drop the global admin-view policy (no tenant scoping possible; users keep the "view own" policy)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- 5) Revoke any pre-existing global admin app_role rows created by the old auto-grant
--    (these give cross-tenant access to every restaurant). Owners remain admins of
--    their own tenants via tenant_user_roles.
DELETE FROM public.user_roles WHERE role = 'admin'::app_role;
