CREATE TABLE public.tenant_user_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, restaurant_id, module_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_user_modules TO authenticated;
GRANT ALL ON public.tenant_user_modules TO service_role;

ALTER TABLE public.tenant_user_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own module permissions"
ON public.tenant_user_modules
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_tenant_admin(restaurant_id));

CREATE POLICY "Tenant admins can insert module permissions"
ON public.tenant_user_modules
FOR INSERT
TO authenticated
WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE POLICY "Tenant admins can update module permissions"
ON public.tenant_user_modules
FOR UPDATE
TO authenticated
USING (public.has_tenant_admin(restaurant_id))
WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE POLICY "Tenant admins can delete module permissions"
ON public.tenant_user_modules
FOR DELETE
TO authenticated
USING (public.has_tenant_admin(restaurant_id));

CREATE TRIGGER update_tenant_user_modules_updated_at
BEFORE UPDATE ON public.tenant_user_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_module_access(_restaurant_id uuid, _module_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_user_roles
    WHERE user_id = auth.uid()
      AND restaurant_id = _restaurant_id
      AND role IN ('owner'::tenant_role, 'admin'::tenant_role)
  )
  OR EXISTS (
    SELECT 1 FROM public.tenant_user_modules
    WHERE user_id = auth.uid()
      AND restaurant_id = _restaurant_id
      AND module_name = _module_name
  )
$$;

REVOKE ALL ON FUNCTION public.has_module_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_module_access(uuid, text) TO authenticated, service_role;