
-- Revoke from PUBLIC role (default grantee) plus authenticated for internal functions
REVOKE EXECUTE ON FUNCTION public.get_user_restaurant_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_tenant_access(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_tenant_role(uuid, tenant_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- search_* are intentional public lookup endpoints, keep public execute for anon
GRANT EXECUTE ON FUNCTION public.search_pre_orders_by_phone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_reservations_by_phone(text) TO anon, authenticated;

-- verify_admin_access stays for authenticated only
REVOKE EXECUTE ON FUNCTION public.verify_admin_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO authenticated;
