CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_platform_admin(_user_id uuid)
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
REVOKE ALL ON FUNCTION private.is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_platform_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_platform_admin(_user_id)
$$;

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
SECURITY INVOKER
SET search_path = public, private
AS $$
DECLARE
  _license public.restaurant_licenses;
  _old jsonb;
BEGIN
  IF NOT private.is_platform_admin(auth.uid()) THEN
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