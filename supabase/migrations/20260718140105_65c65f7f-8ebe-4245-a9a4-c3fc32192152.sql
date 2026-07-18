
-- Update module_name check constraint to include staff_schedule
ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name = ANY (ARRAY['menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders','vitrine_digital','digital_comanda','event_bookings','staff_schedule']));

-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  role text,
  hourly_rate numeric(10,2),
  weekly_hours integer,
  hire_date date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins manage employees" ON public.employees
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_employees_restaurant ON public.employees(restaurant_id);

-- Shifts
CREATE TABLE public.employee_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  role text,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, shift_date, start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_shifts TO authenticated;
GRANT ALL ON public.employee_shifts TO service_role;
ALTER TABLE public.employee_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins manage shifts" ON public.employee_shifts
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE TRIGGER employee_shifts_updated_at BEFORE UPDATE ON public.employee_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_shifts_restaurant_date ON public.employee_shifts(restaurant_id, shift_date);
ALTER TABLE public.employee_shifts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_shifts;

-- Time off
CREATE TABLE public.employee_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'day_off',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_time_off TO authenticated;
GRANT ALL ON public.employee_time_off TO service_role;
ALTER TABLE public.employee_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins manage time off" ON public.employee_time_off
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE TRIGGER employee_time_off_updated_at BEFORE UPDATE ON public.employee_time_off
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_timeoff_restaurant ON public.employee_time_off(restaurant_id, status);

-- Time clock entries
CREATE TABLE public.time_clock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id uuid REFERENCES public.employee_shifts(id) ON DELETE SET NULL,
  clock_in timestamptz NOT NULL DEFAULT now(),
  clock_out timestamptz,
  break_minutes integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_clock_entries TO authenticated;
GRANT ALL ON public.time_clock_entries TO service_role;
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins manage time clock" ON public.time_clock_entries
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE TRIGGER time_clock_updated_at BEFORE UPDATE ON public.time_clock_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_time_clock_employee ON public.time_clock_entries(employee_id, clock_in DESC);
ALTER TABLE public.time_clock_entries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_clock_entries;

-- Register module for existing tenants (inactive by default)
INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT id, 'staff_schedule', false, '{}'::jsonb FROM public.restaurants
ON CONFLICT DO NOTHING;
