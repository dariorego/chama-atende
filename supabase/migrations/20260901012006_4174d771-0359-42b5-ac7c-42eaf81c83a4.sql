CREATE OR REPLACE FUNCTION public.expire_old_service_calls()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.service_calls
  SET status = 'cancelled',
      completed_at = COALESCE(completed_at, now()),
      updated_at = now()
  WHERE status IN ('pending', 'acknowledged', 'in_progress')
    AND (called_at AT TIME ZONE 'America/Recife')::date < (now() AT TIME ZONE 'America/Recife')::date;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_old_service_calls() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_old_service_calls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_service_calls() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('expire-old-service-calls')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-old-service-calls');
    PERFORM cron.schedule(
      'expire-old-service-calls',
      '5 3 * * *',
      $cron$SELECT public.expire_old_service_calls();$cron$
    );
  END IF;
END;
$$;