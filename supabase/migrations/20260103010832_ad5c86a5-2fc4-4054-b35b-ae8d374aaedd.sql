-- =============================================
-- MIGRATION: Convert to Single-Tenant Architecture
-- =============================================

-- 1. Drop ALL policies that depend on get_user_restaurant_id FIRST

-- menu_categories policies
DROP POLICY IF EXISTS "Admins can delete categories" ON menu_categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON menu_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON menu_categories;
DROP POLICY IF EXISTS "Admins can view all restaurant categories" ON menu_categories;
DROP POLICY IF EXISTS "Public read access for menu categories" ON menu_categories;

-- menu_products policies
DROP POLICY IF EXISTS "Admins can delete products" ON menu_products;
DROP POLICY IF EXISTS "Admins can insert products" ON menu_products;
DROP POLICY IF EXISTS "Admins can update products" ON menu_products;
DROP POLICY IF EXISTS "Admins can view all restaurant products" ON menu_products;
DROP POLICY IF EXISTS "Public read access for menu products" ON menu_products;

-- restaurant_modules policies
DROP POLICY IF EXISTS "Admins can update restaurant modules" ON restaurant_modules;
DROP POLICY IF EXISTS "Admins can view all restaurant modules" ON restaurant_modules;
DROP POLICY IF EXISTS "Public read access for restaurant modules" ON restaurant_modules;

-- restaurants policies
DROP POLICY IF EXISTS "Admins can update own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Admins can view own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Public read access for restaurants" ON restaurants;

-- profiles policies
DROP POLICY IF EXISTS "Admins can view profiles from same restaurant" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- user_roles policies
DROP POLICY IF EXISTS "Admins can view roles from same restaurant" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

-- 2. Now we can safely drop the function
DROP FUNCTION IF EXISTS public.get_user_restaurant_id(uuid);

-- 3. Update handle_new_user trigger to not require restaurant_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  
  RETURN NEW;
END;
$$;

-- 4. Create simplified RLS policies for menu_categories
CREATE POLICY "Admins can manage categories" ON menu_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Public read access for categories" ON menu_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- 5. Create simplified RLS policies for menu_products
CREATE POLICY "Admins can manage products" ON menu_products
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Public read access for products" ON menu_products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- 6. Create simplified RLS policies for restaurant_modules
CREATE POLICY "Admins can manage modules" ON restaurant_modules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Public read access for modules" ON restaurant_modules
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- 7. Create simplified RLS policies for restaurants
CREATE POLICY "Admins can manage restaurant" ON restaurants
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read access for restaurant" ON restaurants
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- 8. Create simplified RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 9. Create simplified RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));