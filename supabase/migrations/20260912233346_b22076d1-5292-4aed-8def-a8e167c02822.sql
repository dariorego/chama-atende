CREATE TYPE public.license_status AS ENUM ('active', 'suspended');

CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE profile_id = _user_id AND is_active = true
  )
$$;
REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;

CREATE POLICY "Platform admins view platform admins"
ON public.platform_admins FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins create platform admins"
ON public.platform_admins FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins update platform admins"
ON public.platform_admins FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins delete platform admins"
ON public.platform_admins FOR DELETE TO authenticated
USING (public.is_platform_admin(auth.uid()));

CREATE TABLE public.restaurant_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL UNIQUE REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter',
  status public.license_status NOT NULL DEFAULT 'active',
  starts_at date NOT NULL DEFAULT CURRENT_DATE,
  expires_at date,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_licenses TO authenticated;
GRANT ALL ON public.restaurant_licenses TO service_role;
ALTER TABLE public.restaurant_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins manage licenses"
ON public.restaurant_licenses FOR ALL TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Tenant members view own license"
ON public.restaurant_licenses FOR SELECT TO authenticated
USING (public.has_tenant_access(restaurant_id));

CREATE TABLE public.license_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES public.restaurant_licenses(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_data jsonb,
  new_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.license_audit_log TO authenticated;
GRANT ALL ON public.license_audit_log TO service_role;
ALTER TABLE public.license_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins view license history"
ON public.license_audit_log FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins create license history"
ON public.license_audit_log FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TRIGGER update_platform_admins_updated_at
BEFORE UPDATE ON public.platform_admins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurant_licenses_updated_at
BEFORE UPDATE ON public.restaurant_licenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Platform admins view all restaurants"
ON public.restaurants FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins update all restaurants"
ON public.restaurants FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins view all modules"
ON public.restaurant_modules FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins create modules"
ON public.restaurant_modules FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins update modules"
ON public.restaurant_modules FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins delete modules"
ON public.restaurant_modules FOR DELETE TO authenticated
USING (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.save_platform_license(
  _restaurant_id uuid,
  _plan text,
  _status public.license_status,
  _starts_at date,
  _expires_at date,
  _module_names text[]
)
RETURNS public.restaurant_licenses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _license public.restaurant_licenses;
  _old jsonb;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso não autorizado';
  END IF;
  IF _plan NOT IN ('starter', 'professional', 'enterprise') THEN
    RAISE EXCEPTION 'Plano inválido';
  END IF;
  IF _expires_at IS NOT NULL AND _expires_at < _starts_at THEN
    RAISE EXCEPTION 'O vencimento não pode ser anterior ao início';
  END IF;

  SELECT to_jsonb(l) INTO _old
  FROM public.restaurant_licenses l
  WHERE l.restaurant_id = _restaurant_id;

  INSERT INTO public.restaurant_licenses (
    restaurant_id, plan, status, starts_at, expires_at, created_by, updated_by
  ) VALUES (
    _restaurant_id, _plan, _status, _starts_at, _expires_at, auth.uid(), auth.uid()
  )
  ON CONFLICT (restaurant_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    starts_at = EXCLUDED.starts_at,
    expires_at = EXCLUDED.expires_at,
    updated_by = auth.uid(),
    updated_at = now()
  RETURNING * INTO _license;

  UPDATE public.restaurants
  SET plan = _plan,
      is_active = (_status = 'active'),
      updated_at = now()
  WHERE id = _restaurant_id;

  INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active)
  SELECT _restaurant_id, module_name, (module_name = ANY(COALESCE(_module_names, ARRAY[]::text[])))
  FROM unnest(ARRAY[
    'menu','waiter_call','reservations','queue','kitchen_order','customer_review',
    'pre_orders','vitrine_digital','digital_comanda','event_bookings','staff_schedule',
    'whatsapp_ai','loyalty_cashback','coupons','referral_program','technical_sheet',
    'hygiene_checklists'
  ]) AS module_name
  ON CONFLICT (restaurant_id, module_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    updated_at = now();

  INSERT INTO public.license_audit_log (license_id, restaurant_id, changed_by, old_data, new_data)
  VALUES (_license.id, _restaurant_id, auth.uid(), _old, to_jsonb(_license));

  RETURN _license;
END;
$$;
REVOKE ALL ON FUNCTION public.save_platform_license(uuid, text, public.license_status, date, date, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_platform_license(uuid, text, public.license_status, date, date, text[]) TO authenticated, service_role;