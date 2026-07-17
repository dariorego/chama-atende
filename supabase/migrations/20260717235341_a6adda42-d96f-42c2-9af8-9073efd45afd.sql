
-- 0. Extend module_name allowed values
ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name IN (
    'menu','waiter_call','reservations','queue','kitchen_order',
    'customer_review','pre_orders','vitrine_digital','digital_comanda'
  ));

-- 1. Table
CREATE TABLE public.comandas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  table_session_id uuid REFERENCES public.table_sessions(id) ON DELETE SET NULL,
  code text NOT NULL,
  sequence integer NOT NULL DEFAULT 1,
  customer_name text,
  status text NOT NULL DEFAULT 'open',
  waiter_id uuid REFERENCES public.waiters(id) ON DELETE SET NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  bill_requested_at timestamptz,
  closed_at timestamptz,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comandas_status_check CHECK (status IN ('open','bill_requested','closed','cancelled'))
);

CREATE INDEX idx_comandas_restaurant ON public.comandas(restaurant_id);
CREATE INDEX idx_comandas_table ON public.comandas(table_id);
CREATE INDEX idx_comandas_status ON public.comandas(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comandas TO authenticated;
GRANT ALL ON public.comandas TO service_role;

ALTER TABLE public.comandas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view comandas"
  ON public.comandas FOR SELECT TO authenticated
  USING (public.has_tenant_access(restaurant_id));

CREATE POLICY "Tenant admins can manage comandas"
  ON public.comandas FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE TRIGGER trg_comandas_updated_at
  BEFORE UPDATE ON public.comandas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add comanda_id to order_line_items
ALTER TABLE public.order_line_items
  ADD COLUMN comanda_id uuid REFERENCES public.comandas(id) ON DELETE SET NULL;

CREATE INDEX idx_order_line_items_comanda ON public.order_line_items(comanda_id);

-- 3. Generate comanda code function
CREATE OR REPLACE FUNCTION public.generate_comanda_code(_restaurant_id uuid, _table_id uuid)
RETURNS TABLE(code text, sequence integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _table_number integer;
  _next_seq integer;
BEGIN
  IF _table_id IS NULL THEN
    _table_number := 0;
  ELSE
    SELECT number INTO _table_number FROM public.tables WHERE id = _table_id;
  END IF;

  SELECT COALESCE(MAX(c.sequence), 0) + 1 INTO _next_seq
  FROM public.comandas c
  WHERE c.restaurant_id = _restaurant_id
    AND (c.table_id = _table_id OR (c.table_id IS NULL AND _table_id IS NULL))
    AND c.status IN ('open','bill_requested');

  code := LPAD(COALESCE(_table_number,0)::text, 2, '0') || '.' || LPAD(_next_seq::text, 2, '0');
  sequence := _next_seq;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_comanda_code(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_comanda_code(uuid, uuid) TO authenticated;

-- 4. Recalculate total trigger
CREATE OR REPLACE FUNCTION public.recalc_comanda_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cid uuid;
BEGIN
  _cid := COALESCE(NEW.comanda_id, OLD.comanda_id);
  IF _cid IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  UPDATE public.comandas c
  SET total_amount = COALESCE((
    SELECT SUM(
      (li.unit_price * li.quantity) + COALESCE((
        SELECT SUM(s.additional_price * s.quantity)
        FROM public.order_line_item_selections s
        WHERE s.line_item_id = li.id
      ), 0)
    )
    FROM public.order_line_items li
    WHERE li.comanda_id = _cid
  ), 0)
  WHERE c.id = _cid;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalc_comanda_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_line_items
  FOR EACH ROW EXECUTE FUNCTION public.recalc_comanda_total();

-- 5. Register module
INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT id, 'digital_comanda', false, '{}'::jsonb
FROM public.restaurants
WHERE NOT EXISTS (
  SELECT 1 FROM public.restaurant_modules m
  WHERE m.restaurant_id = restaurants.id AND m.module_name = 'digital_comanda'
);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comandas;
