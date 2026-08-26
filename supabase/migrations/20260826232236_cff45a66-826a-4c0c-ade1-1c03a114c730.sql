-- Enums
CREATE TYPE public.hygiene_shift AS ENUM ('MANHA','TARDE','NOITE','INTEGRAL');
CREATE TYPE public.hygiene_item_type AS ENUM ('CONFORMIDADE','NUMERICO','TEXTO');
CREATE TYPE public.hygiene_answer AS ENUM ('CONFORME','NAO_CONFORME','NA');
CREATE TYPE public.hygiene_run_status AS ENUM ('EM_ANDAMENTO','CONCLUIDO');
CREATE TYPE public.hygiene_shelf_status AS ENUM ('ATIVO','DESCARTADO','CONSUMIDO');

-- Templates
CREATE TABLE public.hygiene_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  shift public.hygiene_shift NOT NULL DEFAULT 'MANHA',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hygiene_checklists TO authenticated;
GRANT ALL ON public.hygiene_checklists TO service_role;
ALTER TABLE public.hygiene_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read hygiene checklists" ON public.hygiene_checklists FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage hygiene checklists" ON public.hygiene_checklists FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE TABLE public.hygiene_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.hygiene_checklists(id) ON DELETE CASCADE,
  label text NOT NULL,
  item_type public.hygiene_item_type NOT NULL DEFAULT 'CONFORMIDADE',
  unit text,
  min_value numeric,
  max_value numeric,
  is_required boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hygiene_checklist_items TO authenticated;
GRANT ALL ON public.hygiene_checklist_items TO service_role;
ALTER TABLE public.hygiene_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read hygiene items" ON public.hygiene_checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hygiene_checklists c WHERE c.id = checklist_id AND public.has_tenant_access(c.restaurant_id)));
CREATE POLICY "tenant manage hygiene items" ON public.hygiene_checklist_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hygiene_checklists c WHERE c.id = checklist_id AND public.has_tenant_admin(c.restaurant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hygiene_checklists c WHERE c.id = checklist_id AND public.has_tenant_admin(c.restaurant_id)));

-- Runs
CREATE TABLE public.hygiene_checklist_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  checklist_id uuid NOT NULL REFERENCES public.hygiene_checklists(id) ON DELETE CASCADE,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  shift public.hygiene_shift NOT NULL DEFAULT 'MANHA',
  status public.hygiene_run_status NOT NULL DEFAULT 'EM_ANDAMENTO',
  performed_by uuid,
  performed_by_name text,
  completed_at timestamptz,
  compliance_pct numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hygiene_runs_tenant_date ON public.hygiene_checklist_runs (restaurant_id, run_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hygiene_checklist_runs TO authenticated;
GRANT ALL ON public.hygiene_checklist_runs TO service_role;
ALTER TABLE public.hygiene_checklist_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read hygiene runs" ON public.hygiene_checklist_runs FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage hygiene runs" ON public.hygiene_checklist_runs FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE TABLE public.hygiene_checklist_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.hygiene_checklist_runs(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.hygiene_checklist_items(id) ON DELETE CASCADE,
  answer public.hygiene_answer,
  numeric_value numeric,
  text_value text,
  is_out_of_range boolean NOT NULL DEFAULT false,
  corrective_action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hygiene_checklist_answers TO authenticated;
GRANT ALL ON public.hygiene_checklist_answers TO service_role;
ALTER TABLE public.hygiene_checklist_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read hygiene answers" ON public.hygiene_checklist_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hygiene_checklist_runs r WHERE r.id = run_id AND public.has_tenant_access(r.restaurant_id)));
CREATE POLICY "tenant manage hygiene answers" ON public.hygiene_checklist_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hygiene_checklist_runs r WHERE r.id = run_id AND public.has_tenant_admin(r.restaurant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hygiene_checklist_runs r WHERE r.id = run_id AND public.has_tenant_admin(r.restaurant_id)));

-- Shelf life
CREATE TABLE public.hygiene_shelf_life_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  batch_code text,
  opened_at date NOT NULL DEFAULT CURRENT_DATE,
  expires_at date NOT NULL,
  storage_location text,
  quantity numeric,
  unit text,
  status public.hygiene_shelf_status NOT NULL DEFAULT 'ATIVO',
  discarded_reason text,
  discarded_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_hygiene_shelf_tenant_expires ON public.hygiene_shelf_life_items (restaurant_id, expires_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hygiene_shelf_life_items TO authenticated;
GRANT ALL ON public.hygiene_shelf_life_items TO service_role;
ALTER TABLE public.hygiene_shelf_life_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read hygiene shelf" ON public.hygiene_shelf_life_items FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage hygiene shelf" ON public.hygiene_shelf_life_items FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- updated_at triggers
CREATE TRIGGER trg_hyg_checklists_updated BEFORE UPDATE ON public.hygiene_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hyg_items_updated BEFORE UPDATE ON public.hygiene_checklist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hyg_runs_updated BEFORE UPDATE ON public.hygiene_checklist_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hyg_answers_updated BEFORE UPDATE ON public.hygiene_checklist_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hyg_shelf_updated BEFORE UPDATE ON public.hygiene_shelf_life_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation: numeric range coherence
CREATE OR REPLACE FUNCTION public.hygiene_item_validate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.min_value IS NOT NULL AND NEW.max_value IS NOT NULL AND NEW.min_value > NEW.max_value THEN
    RAISE EXCEPTION 'Faixa inválida: mínimo maior que o máximo';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_hyg_item_validate BEFORE INSERT OR UPDATE ON public.hygiene_checklist_items FOR EACH ROW EXECUTE FUNCTION public.hygiene_item_validate();

-- Shelf life date validation
CREATE OR REPLACE FUNCTION public.hygiene_shelf_validate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.expires_at < NEW.opened_at THEN
    RAISE EXCEPTION 'A validade não pode ser anterior à data de manipulação';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_hyg_shelf_validate BEFORE INSERT OR UPDATE ON public.hygiene_shelf_life_items FOR EACH ROW EXECUTE FUNCTION public.hygiene_shelf_validate();

-- Auto compute out_of_range + recalc compliance
CREATE OR REPLACE FUNCTION public.hygiene_answer_before()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _min numeric;
  _max numeric;
  _type public.hygiene_item_type;
BEGIN
  SELECT min_value, max_value, item_type INTO _min, _max, _type
  FROM public.hygiene_checklist_items WHERE id = NEW.item_id;

  NEW.is_out_of_range := false;
  IF _type = 'NUMERICO' AND NEW.numeric_value IS NOT NULL THEN
    IF (_min IS NOT NULL AND NEW.numeric_value < _min) OR (_max IS NOT NULL AND NEW.numeric_value > _max) THEN
      NEW.is_out_of_range := true;
    END IF;
  END IF;
  IF NEW.answer = 'NAO_CONFORME' THEN
    NEW.is_out_of_range := true;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_hyg_answer_before BEFORE INSERT OR UPDATE ON public.hygiene_checklist_answers FOR EACH ROW EXECUTE FUNCTION public.hygiene_answer_before();

CREATE OR REPLACE FUNCTION public.hygiene_recalc_compliance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _run uuid;
  _total integer;
  _ok integer;
BEGIN
  _run := COALESCE(NEW.run_id, OLD.run_id);
  SELECT COUNT(*) FILTER (WHERE a.answer IS NOT NULL OR a.numeric_value IS NOT NULL),
         COUNT(*) FILTER (WHERE (a.answer IS NOT NULL OR a.numeric_value IS NOT NULL) AND a.is_out_of_range = false AND COALESCE(a.answer, 'CONFORME') <> 'NA')
    INTO _total, _ok
  FROM public.hygiene_checklist_answers a
  WHERE a.run_id = _run;

  UPDATE public.hygiene_checklist_runs
    SET compliance_pct = CASE WHEN COALESCE(_total,0) = 0 THEN 0 ELSE ROUND((_ok::numeric / _total) * 100, 1) END
  WHERE id = _run;

  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_hyg_recalc_compliance AFTER INSERT OR UPDATE OR DELETE ON public.hygiene_checklist_answers FOR EACH ROW EXECUTE FUNCTION public.hygiene_recalc_compliance();

-- Allow the new module name
ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check CHECK (module_name = ANY (ARRAY[
  'menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders','vitrine_digital',
  'digital_comanda','event_bookings','staff_schedule','whatsapp_ai','loyalty_cashback','coupons','referral_program',
  'technical_sheet','metrics','hygiene_checklists'
]));