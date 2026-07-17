
-- RLS policies that reference these helpers need callers to have EXECUTE.
-- SECURITY DEFINER keeps their internal reads privileged; granting EXECUTE
-- to authenticated is safe and required for the ALL policies to evaluate.
GRANT EXECUTE ON FUNCTION public.has_tenant_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, tenant_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_restaurant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO authenticated;
