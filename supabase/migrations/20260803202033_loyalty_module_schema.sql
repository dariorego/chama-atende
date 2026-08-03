-- Extend customers table with loyalty fields
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS points_balance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS total_points_earned INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_points_redeemed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_purchases INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

UPDATE public.customers SET full_name = COALESCE(full_name, name, 'Cliente') WHERE full_name IS NULL;

-- Rename loyalty_tiers.min_points -> points_threshold to match spec
ALTER TABLE public.loyalty_tiers RENAME COLUMN min_points TO points_threshold;

-- Extend loyalty_rewards with fields from spec
ALTER TABLE public.loyalty_rewards
  ADD COLUMN IF NOT EXISTS reward_type TEXT NOT NULL DEFAULT 'discount',
  ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS free_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Extend loyalty_transactions with reference fields from spec
ALTER TABLE public.loyalty_transactions
  ADD COLUMN IF NOT EXISTS reference_type TEXT,
  ADD COLUMN IF NOT EXISTS reference_id UUID;

-- Create loyalty_rules table
CREATE TABLE IF NOT EXISTS public.loyalty_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points_per_currency NUMERIC(10,2) NOT NULL DEFAULT 1,
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'all',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant access to loyalty_rules"
  ON public.loyalty_rules
  FOR ALL
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));

CREATE TRIGGER set_loyalty_rules_updated_at
  BEFORE UPDATE ON public.loyalty_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
