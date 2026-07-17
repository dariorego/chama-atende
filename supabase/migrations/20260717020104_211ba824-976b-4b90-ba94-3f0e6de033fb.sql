CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.tenant_user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner'::tenant_role, 'admin'::tenant_role, 'manager'::tenant_role)
    )
  )
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO authenticated;