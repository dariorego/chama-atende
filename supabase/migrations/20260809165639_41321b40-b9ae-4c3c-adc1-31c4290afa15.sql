-- ===== ENUMS =====
CREATE TYPE public.ingredient_unit AS ENUM ('KG','LT','UN');
CREATE TYPE public.ingredient_type AS ENUM ('COMPRADO','PREPARACAO');
CREATE TYPE public.recipe_type AS ENUM ('PRODUTO_FINAL','PREPARACAO');
CREATE TYPE public.recipe_status AS ENUM ('RASCUNHO','PUBLICADA','FORA_DE_LINHA');
CREATE TYPE public.yield_unit AS ENUM ('KG','LT','PORCAO','UN');
CREATE TYPE public.waste_reason AS ENUM ('ESTRAGOU','QUEBRA','VENCIMENTO','ERRO_PREPARO','DEVOLUCAO','OUTRO');

-- ===== SUPPLIERS =====
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  document text,
  phone text,
  email text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== INGREDIENT CATEGORIES =====
CREATE TABLE public.ingredient_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredient_categories TO authenticated;
GRANT ALL ON public.ingredient_categories TO service_role;
ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read ing cat" ON public.ingredient_categories FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage ing cat" ON public.ingredient_categories FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== RECIPES (declared before ingredients for FK) =====
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  type public.recipe_type NOT NULL DEFAULT 'PRODUTO_FINAL',
  category text,
  yield_qty numeric NOT NULL DEFAULT 1 CHECK (yield_qty > 0),
  yield_unit public.yield_unit NOT NULL DEFAULT 'PORCAO',
  prep_time_min integer,
  utensils text[] NOT NULL DEFAULT '{}',
  shelf_life text,
  notes text,
  photo_url text,
  plating_photo_url text,
  status public.recipe_status NOT NULL DEFAULT 'RASCUNHO',
  menu_product_id uuid REFERENCES public.menu_products(id) ON DELETE SET NULL,
  total_cost numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read recipes" ON public.recipes FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage recipes" ON public.recipes FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== INGREDIENTS =====
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code text,
  name text NOT NULL,
  brand text,
  unit public.ingredient_unit NOT NULL DEFAULT 'KG',
  gross_weight_ref numeric NOT NULL DEFAULT 1 CHECK (gross_weight_ref > 0),
  net_weight_ref numeric NOT NULL DEFAULT 1 CHECK (net_weight_ref > 0),
  correction_factor numeric GENERATED ALWAYS AS (net_weight_ref / NULLIF(gross_weight_ref, 0)) STORED,
  package_price numeric,
  package_weight numeric,
  unit_price numeric NOT NULL DEFAULT 0,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.ingredient_categories(id) ON DELETE SET NULL,
  quoted_at date,
  type public.ingredient_type NOT NULL DEFAULT 'COMPRADO',
  source_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  is_packaging boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read ingredients" ON public.ingredients FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage ingredients" ON public.ingredients FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_ingredients_restaurant ON public.ingredients(restaurant_id);

-- ===== INGREDIENT QUOTES =====
CREATE TABLE public.ingredient_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  package_price numeric,
  package_weight numeric,
  unit_price numeric NOT NULL,
  quoted_at date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'MANUAL',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredient_quotes TO authenticated;
GRANT ALL ON public.ingredient_quotes TO service_role;
ALTER TABLE public.ingredient_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read quotes" ON public.ingredient_quotes FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage quotes" ON public.ingredient_quotes FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_quotes_ingredient ON public.ingredient_quotes(ingredient_id, quoted_at DESC);

-- ===== RECIPE COMPONENTS =====
CREATE TABLE public.recipe_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  sub_recipe_id uuid REFERENCES public.recipes(id) ON DELETE RESTRICT,
  net_weight numeric NOT NULL CHECK (net_weight > 0),
  unit public.ingredient_unit NOT NULL DEFAULT 'KG',
  correction_factor numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  gross_weight numeric NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  household_measure text,
  display_order integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recipe_component_target CHECK (
    (ingredient_id IS NOT NULL AND sub_recipe_id IS NULL)
    OR (ingredient_id IS NULL AND sub_recipe_id IS NOT NULL)
  )
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_components TO authenticated;
GRANT ALL ON public.recipe_components TO service_role;
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read components" ON public.recipe_components FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage components" ON public.recipe_components FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_components_recipe ON public.recipe_components(recipe_id);
CREATE INDEX idx_components_ingredient ON public.recipe_components(ingredient_id);
CREATE INDEX idx_components_sub ON public.recipe_components(sub_recipe_id);

-- ===== RECIPE VERSIONS =====
CREATE TABLE public.recipe_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  total_cost numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  published_by uuid,
  published_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_versions TO authenticated;
GRANT ALL ON public.recipe_versions TO service_role;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read versions" ON public.recipe_versions FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage versions" ON public.recipe_versions FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== RECIPE PRICING =====
CREATE TABLE public.recipe_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL UNIQUE REFERENCES public.recipes(id) ON DELETE CASCADE,
  target_cmv numeric NOT NULL DEFAULT 0.30 CHECK (target_cmv > 0 AND target_cmv <= 1),
  packaging_cost numeric NOT NULL DEFAULT 0,
  selling_price numeric,
  treatment_tag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_pricing TO authenticated;
GRANT ALL ON public.recipe_pricing TO service_role;
ALTER TABLE public.recipe_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read pricing" ON public.recipe_pricing FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage pricing" ON public.recipe_pricing FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== RECIPE STEPS =====
CREATE TABLE public.recipe_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 1,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_steps TO authenticated;
GRANT ALL ON public.recipe_steps TO service_role;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read steps" ON public.recipe_steps FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage steps" ON public.recipe_steps FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== PORTION STANDARDS =====
CREATE TABLE public.portion_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  family text NOT NULL,
  name text NOT NULL,
  standard_weight numeric NOT NULL,
  unit public.ingredient_unit NOT NULL DEFAULT 'KG',
  household_measure text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portion_standards TO authenticated;
GRANT ALL ON public.portion_standards TO service_role;
ALTER TABLE public.portion_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read portions" ON public.portion_standards FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage portions" ON public.portion_standards FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== WASTE =====
CREATE TABLE public.waste_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  reason public.waste_reason NOT NULL DEFAULT 'OUTRO',
  notes text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waste_entries TO authenticated;
GRANT ALL ON public.waste_entries TO service_role;
ALTER TABLE public.waste_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read waste" ON public.waste_entries FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage waste" ON public.waste_entries FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== INVENTORY =====
CREATE TABLE public.inventory_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  count_date date NOT NULL DEFAULT CURRENT_DATE,
  name text,
  status text NOT NULL DEFAULT 'ABERTA',
  total_value numeric NOT NULL DEFAULT 0,
  closed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_counts TO authenticated;
GRANT ALL ON public.inventory_counts TO service_role;
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read inventory" ON public.inventory_counts FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage inventory" ON public.inventory_counts FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE TABLE public.inventory_count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  count_id uuid NOT NULL REFERENCES public.inventory_counts(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (count_id, ingredient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_count_lines TO authenticated;
GRANT ALL ON public.inventory_count_lines TO service_role;
ALTER TABLE public.inventory_count_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read inv lines" ON public.inventory_count_lines FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage inv lines" ON public.inventory_count_lines FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== SEASONAL MENUS =====
CREATE TABLE public.seasonal_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  channel text,
  starts_on date,
  ends_on date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasonal_menus TO authenticated;
GRANT ALL ON public.seasonal_menus TO service_role;
ALTER TABLE public.seasonal_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read seasonal" ON public.seasonal_menus FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage seasonal" ON public.seasonal_menus FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

CREATE TABLE public.seasonal_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_id uuid NOT NULL REFERENCES public.seasonal_menus(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  price numeric,
  display_order integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasonal_menu_items TO authenticated;
GRANT ALL ON public.seasonal_menu_items TO service_role;
ALTER TABLE public.seasonal_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read seasonal items" ON public.seasonal_menu_items FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));
CREATE POLICY "tenant manage seasonal items" ON public.seasonal_menu_items FOR ALL TO authenticated USING (public.has_tenant_admin(restaurant_id)) WITH CHECK (public.has_tenant_admin(restaurant_id));

-- ===== AUDIT LOG =====
CREATE TABLE public.recipe_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipe_audit_log TO authenticated;
GRANT ALL ON public.recipe_audit_log TO service_role;
ALTER TABLE public.recipe_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant read audit" ON public.recipe_audit_log FOR SELECT TO authenticated USING (public.has_tenant_access(restaurant_id));

-- ===== TRIGGERS updated_at =====
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ing_cat_updated BEFORE UPDATE ON public.ingredient_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ingredients_updated BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_recipes_updated BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_components_updated BEFORE UPDATE ON public.recipe_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pricing_updated BEFORE UPDATE ON public.recipe_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_steps_updated BEFORE UPDATE ON public.recipe_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portions_updated BEFORE UPDATE ON public.portion_standards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_waste_updated BEFORE UPDATE ON public.waste_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.inventory_counts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_inv_lines_updated BEFORE UPDATE ON public.inventory_count_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_seasonal_updated BEFORE UPDATE ON public.seasonal_menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_seasonal_items_updated BEFORE UPDATE ON public.seasonal_menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== UNIT PRICE FROM PACKAGE =====
CREATE OR REPLACE FUNCTION public.ingredient_set_unit_price()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.type = 'COMPRADO' AND NEW.package_price IS NOT NULL AND COALESCE(NEW.package_weight,0) > 0 THEN
    NEW.unit_price := NEW.package_price / NEW.package_weight;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_ingredient_unit_price BEFORE INSERT OR UPDATE ON public.ingredients
FOR EACH ROW EXECUTE FUNCTION public.ingredient_set_unit_price();

-- ===== CYCLE GUARD =====
CREATE OR REPLACE FUNCTION public.recipe_component_no_cycle()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  _found boolean;
BEGIN
  IF NEW.sub_recipe_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.sub_recipe_id = NEW.recipe_id THEN
    RAISE EXCEPTION 'Referência circular: a ficha não pode ser componente dela mesma';
  END IF;
  WITH RECURSIVE tree AS (
    SELECT rc.sub_recipe_id AS rid FROM public.recipe_components rc WHERE rc.recipe_id = NEW.sub_recipe_id AND rc.sub_recipe_id IS NOT NULL
    UNION
    SELECT rc.sub_recipe_id FROM public.recipe_components rc JOIN tree t ON rc.recipe_id = t.rid WHERE rc.sub_recipe_id IS NOT NULL
  )
  SELECT EXISTS (SELECT 1 FROM tree WHERE rid = NEW.recipe_id) INTO _found;
  IF _found THEN
    RAISE EXCEPTION 'Referência circular detectada entre sub-receitas';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_component_no_cycle BEFORE INSERT OR UPDATE ON public.recipe_components
FOR EACH ROW EXECUTE FUNCTION public.recipe_component_no_cycle();

-- ===== COST CALC =====
CREATE OR REPLACE FUNCTION public.recipe_component_calc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  _fc numeric := 1;
  _price numeric := 0;
BEGIN
  IF NEW.ingredient_id IS NOT NULL THEN
    SELECT COALESCE(correction_factor,1), COALESCE(unit_price,0) INTO _fc, _price
    FROM public.ingredients WHERE id = NEW.ingredient_id;
  ELSE
    SELECT 1, COALESCE(unit_cost,0) INTO _fc, _price FROM public.recipes WHERE id = NEW.sub_recipe_id;
  END IF;
  IF COALESCE(_fc,0) <= 0 THEN
    RAISE EXCEPTION 'Fator de correção inválido para o componente';
  END IF;
  NEW.correction_factor := _fc;
  NEW.unit_price := _price;
  NEW.gross_weight := NEW.net_weight / _fc;
  NEW.cost := NEW.gross_weight * _price;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_component_calc BEFORE INSERT OR UPDATE ON public.recipe_components
FOR EACH ROW EXECUTE FUNCTION public.recipe_component_calc();

CREATE OR REPLACE FUNCTION public.recalc_recipe_cost(_recipe_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _total numeric;
  _yield numeric;
  _unit numeric;
BEGIN
  SELECT COALESCE(SUM(cost),0) INTO _total FROM public.recipe_components WHERE recipe_id = _recipe_id;
  SELECT NULLIF(yield_qty,0) INTO _yield FROM public.recipes WHERE id = _recipe_id;
  _unit := _total / COALESCE(_yield,1);
  UPDATE public.recipes SET total_cost = _total, unit_cost = _unit WHERE id = _recipe_id;
  UPDATE public.ingredients SET unit_price = _unit WHERE source_recipe_id = _recipe_id AND type = 'PREPARACAO';
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_recipe_tree(_recipe_id uuid, _depth integer DEFAULT 0)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _parent uuid;
BEGIN
  IF _depth > 12 THEN RETURN; END IF;
  PERFORM public.recalc_recipe_cost(_recipe_id);
  UPDATE public.recipe_components rc
  SET net_weight = rc.net_weight
  WHERE rc.sub_recipe_id = _recipe_id
     OR rc.ingredient_id IN (SELECT id FROM public.ingredients WHERE source_recipe_id = _recipe_id);
  FOR _parent IN
    SELECT DISTINCT rc.recipe_id FROM public.recipe_components rc
    WHERE rc.sub_recipe_id = _recipe_id
       OR rc.ingredient_id IN (SELECT id FROM public.ingredients WHERE source_recipe_id = _recipe_id)
  LOOP
    PERFORM public.recalc_recipe_tree(_parent, _depth + 1);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.recipe_component_after()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_recipe_tree(COALESCE(NEW.recipe_id, OLD.recipe_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_component_after AFTER INSERT OR UPDATE OR DELETE ON public.recipe_components
FOR EACH ROW EXECUTE FUNCTION public.recipe_component_after();

-- Propagate ingredient price change to all recipes that use it
CREATE OR REPLACE FUNCTION public.propagate_ingredient_price()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _rid uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.unit_price IS NOT DISTINCT FROM OLD.unit_price
     AND NEW.correction_factor IS NOT DISTINCT FROM OLD.correction_factor THEN
    RETURN NEW;
  END IF;
  UPDATE public.recipe_components SET net_weight = net_weight WHERE ingredient_id = NEW.id;
  FOR _rid IN SELECT DISTINCT recipe_id FROM public.recipe_components WHERE ingredient_id = NEW.id LOOP
    PERFORM public.recalc_recipe_tree(_rid);
  END LOOP;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_propagate_ingredient_price AFTER UPDATE ON public.ingredients
FOR EACH ROW EXECUTE FUNCTION public.propagate_ingredient_price();

-- Recalc when yield changes
CREATE OR REPLACE FUNCTION public.recipe_after_yield_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.yield_qty IS DISTINCT FROM OLD.yield_qty THEN
    PERFORM public.recalc_recipe_tree(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_recipe_yield AFTER UPDATE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.recipe_after_yield_change();

-- ===== AUDIT TRIGGER =====
CREATE OR REPLACE FUNCTION public.recipe_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.recipe_audit_log (restaurant_id, table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    COALESCE((to_jsonb(NEW)->>'restaurant_id')::uuid, (to_jsonb(OLD)->>'restaurant_id')::uuid),
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW)->>'id')::uuid, (to_jsonb(OLD)->>'id')::uuid),
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_audit_ingredients AFTER INSERT OR UPDATE OR DELETE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.recipe_audit();
CREATE TRIGGER trg_audit_recipes AFTER INSERT OR UPDATE OR DELETE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.recipe_audit();
CREATE TRIGGER trg_audit_pricing AFTER INSERT OR UPDATE OR DELETE ON public.recipe_pricing FOR EACH ROW EXECUTE FUNCTION public.recipe_audit();
CREATE TRIGGER trg_audit_inventory AFTER INSERT OR UPDATE OR DELETE ON public.inventory_counts FOR EACH ROW EXECUTE FUNCTION public.recipe_audit();

-- ===== QUOTE APPLIES PRICE =====
CREATE OR REPLACE FUNCTION public.apply_quote_to_ingredient()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ingredients
  SET package_price = COALESCE(NEW.package_price, package_price),
      package_weight = COALESCE(NEW.package_weight, package_weight),
      unit_price = NEW.unit_price,
      supplier_id = COALESCE(NEW.supplier_id, supplier_id),
      quoted_at = NEW.quoted_at
  WHERE id = NEW.ingredient_id
    AND (quoted_at IS NULL OR NEW.quoted_at >= quoted_at);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_apply_quote AFTER INSERT ON public.ingredient_quotes
FOR EACH ROW EXECUTE FUNCTION public.apply_quote_to_ingredient();