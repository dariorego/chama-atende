-- Vincular atendentes (waiters) aos funcionários (employees)
ALTER TABLE public.waiters
  ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS waiters_employee_id_unique
  ON public.waiters(employee_id) WHERE employee_id IS NOT NULL;

-- Trigger para desativar atendente ao desativar funcionário
CREATE OR REPLACE FUNCTION public.sync_waiter_active_from_employee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true THEN
    UPDATE public.waiters
      SET is_active = false, is_available = false
      WHERE employee_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_waiter_active_from_employee ON public.employees;
CREATE TRIGGER trg_sync_waiter_active_from_employee
  AFTER UPDATE OF is_active ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.sync_waiter_active_from_employee();