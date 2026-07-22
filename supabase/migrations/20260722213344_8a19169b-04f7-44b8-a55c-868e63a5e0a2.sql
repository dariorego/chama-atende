
CREATE OR REPLACE FUNCTION public.set_service_call_restaurant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.restaurant_id IS NULL AND NEW.table_id IS NOT NULL THEN
    SELECT restaurant_id INTO NEW.restaurant_id FROM public.tables WHERE id = NEW.table_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_service_call_restaurant_id_trg ON public.service_calls;
CREATE TRIGGER set_service_call_restaurant_id_trg
BEFORE INSERT ON public.service_calls
FOR EACH ROW EXECUTE FUNCTION public.set_service_call_restaurant_id();
