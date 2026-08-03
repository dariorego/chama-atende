ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name = ANY (ARRAY['menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders','vitrine_digital','digital_comanda','event_bookings','staff_schedule','whatsapp_ai','loyalty_cashback','coupons','referral_program']));

-- customers
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_tenant" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));
CREATE INDEX idx_customers_restaurant_phone ON public.customers(restaurant_id, phone);

-- loyalty_programs
CREATE TABLE public.loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  points_per_currency numeric NOT NULL DEFAULT 1,
  currency_value_per_point numeric NOT NULL DEFAULT 0,
  welcome_points numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_programs TO authenticated;
GRANT ALL ON public.loyalty_programs TO service_role;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_programs_tenant_admin" ON public.loyalty_programs
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- loyalty_tiers
CREATE TABLE public.loyalty_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_points numeric NOT NULL DEFAULT 0,
  multiplier numeric NOT NULL DEFAULT 1,
  color text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_tiers TO authenticated;
GRANT ALL ON public.loyalty_tiers TO service_role;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_tiers_tenant_admin" ON public.loyalty_tiers
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_loyalty_tiers_restaurant ON public.loyalty_tiers(restaurant_id, min_points);

-- loyalty_rewards
CREATE TABLE public.loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  points_cost numeric NOT NULL DEFAULT 0,
  discount_value numeric NOT NULL DEFAULT 0,
  discount_type text NOT NULL DEFAULT 'fixed_amount',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_rewards TO authenticated;
GRANT ALL ON public.loyalty_rewards TO service_role;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_rewards_tenant_admin" ON public.loyalty_rewards
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_loyalty_rewards_restaurant ON public.loyalty_rewards(restaurant_id, points_cost);

-- customer_loyalty_balances
CREATE TABLE public.customer_loyalty_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.loyalty_tiers(id) ON DELETE SET NULL,
  points_balance numeric NOT NULL DEFAULT 0,
  total_earned_lifetime numeric NOT NULL DEFAULT 0,
  total_redeemed_lifetime numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, customer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_loyalty_balances TO authenticated;
GRANT ALL ON public.customer_loyalty_balances TO service_role;
ALTER TABLE public.customer_loyalty_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_loyalty_balances_tenant" ON public.customer_loyalty_balances
  FOR ALL TO authenticated
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));
CREATE INDEX idx_loyalty_balances_customer ON public.customer_loyalty_balances(restaurant_id, customer_id);

-- loyalty_transactions
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type text NOT NULL,
  points numeric NOT NULL DEFAULT 0,
  order_id uuid,
  coupon_id uuid,
  referral_id uuid,
  reward_id uuid REFERENCES public.loyalty_rewards(id) ON DELETE SET NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_transactions_tenant" ON public.loyalty_transactions
  FOR ALL TO authenticated
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));
CREATE INDEX idx_loyalty_transactions_customer ON public.loyalty_transactions(restaurant_id, customer_id, created_at DESC);

-- coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL DEFAULT 'percentage',
  value numeric NOT NULL DEFAULT 0,
  max_discount_value numeric,
  min_order_value numeric NOT NULL DEFAULT 0,
  usage_limit integer,
  usage_limit_per_customer integer,
  usage_count integer NOT NULL DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'active',
  is_first_order_only boolean NOT NULL DEFAULT false,
  apply_to text NOT NULL DEFAULT 'all',
  target_ids uuid[] DEFAULT '{}',
  auto_apply boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_tenant_admin" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_coupons_restaurant_code ON public.coupons(restaurant_id, code);

-- coupon_redemptions
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid,
  pre_order_id uuid,
  comanda_id uuid,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_phone text,
  discount_value numeric NOT NULL DEFAULT 0,
  applied_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupon_redemptions_tenant" ON public.coupon_redemptions
  FOR ALL TO authenticated
  USING (public.has_tenant_access(restaurant_id))
  WITH CHECK (public.has_tenant_access(restaurant_id));
CREATE INDEX idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id, applied_at DESC);
CREATE INDEX idx_coupon_redemptions_customer ON public.coupon_redemptions(restaurant_id, customer_phone);

-- referral_programs
CREATE TABLE public.referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  referrer_reward_type text NOT NULL DEFAULT 'points',
  referrer_reward_value numeric NOT NULL DEFAULT 0,
  referred_discount_type text NOT NULL DEFAULT 'percentage',
  referred_discount_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_programs TO authenticated;
GRANT ALL ON public.referral_programs TO service_role;
ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_programs_tenant_admin" ON public.referral_programs
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));

-- referral_codes
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  code text NOT NULL,
  referral_link text,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_codes_tenant_admin" ON public.referral_codes
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_referral_codes_customer ON public.referral_codes(restaurant_id, customer_id);

-- referral_referrals
CREATE TABLE public.referral_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  referrer_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referred_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  referred_customer_phone text,
  referred_order_id uuid,
  referred_pre_order_id uuid,
  referred_comanda_id uuid,
  status text NOT NULL DEFAULT 'pending',
  converted_at timestamptz,
  reward_applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_referrals TO authenticated;
GRANT ALL ON public.referral_referrals TO service_role;
ALTER TABLE public.referral_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_referrals_tenant_admin" ON public.referral_referrals
  FOR ALL TO authenticated
  USING (public.has_tenant_admin(restaurant_id))
  WITH CHECK (public.has_tenant_admin(restaurant_id));
CREATE INDEX idx_referral_referrals_code ON public.referral_referrals(referrer_code_id, status);

-- triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_tiers_updated_at BEFORE UPDATE ON public.loyalty_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON public.loyalty_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_balances_updated_at BEFORE UPDATE ON public.customer_loyalty_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referral_programs_updated_at BEFORE UPDATE ON public.referral_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referral_referrals_updated_at BEFORE UPDATE ON public.referral_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- realtime
ALTER TABLE public.loyalty_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.coupon_redemptions REPLICA IDENTITY FULL;
ALTER TABLE public.referral_referrals REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupon_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_referrals;

-- seed restaurant_modules for new modules (disabled by default)
INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active)
SELECT r.id, m.name, false
FROM public.restaurants r
CROSS JOIN (VALUES ('loyalty_cashback'), ('coupons'), ('referral_program')) AS m(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.restaurant_modules rm
  WHERE rm.restaurant_id = r.id AND rm.module_name = m.name
);