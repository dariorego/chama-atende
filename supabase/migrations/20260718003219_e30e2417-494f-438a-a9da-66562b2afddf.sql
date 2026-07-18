
-- Update module check constraint to include new module
ALTER TABLE public.restaurant_modules DROP CONSTRAINT restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name = ANY (ARRAY['menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders','vitrine_digital','digital_comanda','event_bookings']));

-- Event Bookings table
CREATE TABLE public.event_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  booking_code text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('birthday','corporate','wedding','group','other')),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  guest_count integer NOT NULL CHECK (guest_count > 0),
  budget_range text,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','quoted','confirmed','cancelled','completed')),
  quote_amount numeric(10,2),
  quote_details text,
  admin_response text,
  quoted_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_bookings_restaurant ON public.event_bookings(restaurant_id, status);
CREATE INDEX idx_event_bookings_date ON public.event_bookings(event_date);

GRANT INSERT ON public.event_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_bookings TO authenticated;
GRANT ALL ON public.event_bookings TO service_role;

ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can request event booking"
  ON public.event_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id)
  );

CREATE POLICY "Tenant admins view event bookings"
  ON public.event_bookings FOR SELECT
  TO authenticated
  USING (public.has_tenant_admin(restaurant_id));

CREATE POLICY "Tenant admins update event bookings"
  ON public.event_bookings FOR UPDATE
  TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE POLICY "Tenant admins delete event bookings"
  ON public.event_bookings FOR DELETE
  TO authenticated
  USING (public.has_tenant_admin(restaurant_id));

CREATE TRIGGER update_event_bookings_updated_at
  BEFORE UPDATE ON public.event_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT id, 'event_bookings', false, '{}'::jsonb
FROM public.restaurants
ON CONFLICT DO NOTHING;
