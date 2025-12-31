-- =====================================================
-- SAAS MULTI-TENANT DATABASE SCHEMA FOR RESTAURANTS
-- =====================================================

-- 1. CREATE RESTAURANTS TABLE (Tenants)
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  subtitle text,
  logo_url text,
  cover_image_url text,
  address text,
  phone text,
  email text,
  status text DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'busy')),
  opening_time time,
  closing_time time,
  social_links jsonb DEFAULT '{}',
  wifi_info jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. CREATE MENU CATEGORIES TABLE
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  slug text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(restaurant_id, slug)
);

-- 3. CREATE MENU PRODUCTS TABLE
CREATE TABLE public.menu_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  promotional_price decimal(10,2),
  image_url text,
  is_highlight boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. CREATE RESTAURANT MODULES TABLE
CREATE TABLE public.restaurant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  module_name text NOT NULL CHECK (module_name IN ('menu', 'waiter_call', 'reservations', 'queue', 'kitchen_order', 'customer_review')),
  is_active boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(restaurant_id, module_name)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_restaurants_is_active ON public.restaurants(is_active);
CREATE INDEX idx_menu_categories_restaurant ON public.menu_categories(restaurant_id);
CREATE INDEX idx_menu_categories_order ON public.menu_categories(restaurant_id, display_order);
CREATE INDEX idx_menu_products_restaurant ON public.menu_products(restaurant_id);
CREATE INDEX idx_menu_products_category ON public.menu_products(category_id);
CREATE INDEX idx_menu_products_highlight ON public.menu_products(restaurant_id, is_highlight) WHERE is_highlight = true;
CREATE INDEX idx_menu_products_active ON public.menu_products(restaurant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_restaurant_modules_restaurant ON public.restaurant_modules(restaurant_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_products_updated_at
  BEFORE UPDATE ON public.menu_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_modules_updated_at
  BEFORE UPDATE ON public.restaurant_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for restaurants"
  ON public.restaurants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for menu categories"
  ON public.menu_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for menu products"
  ON public.menu_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read access for restaurant modules"
  ON public.restaurant_modules FOR SELECT
  USING (is_active = true);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

INSERT INTO public.restaurants (id, name, slug, subtitle, logo_url, address, phone, email, status, opening_time, closing_time, social_links, wifi_info, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Bistro Verde',
  'bistro-verde',
  'Cozinha Natural & Bar',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
  'Rua das Flores, 123 - Jardim Paulista, São Paulo - SP',
  '(11) 99999-9999',
  'contato@bistroverde.com.br',
  'open',
  '11:30',
  '23:00',
  '{"instagram": "https://instagram.com/bistroverde", "facebook": "https://facebook.com/bistroverde", "website": "https://bistroverde.com.br"}',
  '{"network": "BistrôVerde_Guest", "password": "bemvindo2024"}',
  true
);

INSERT INTO public.menu_categories (id, restaurant_id, name, description, slug, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Entradas', 'Pratos para começar sua experiência', 'entradas', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Principais', 'Nossos pratos principais', 'principais', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sobremesas', 'Finalize com doçura', 'sobremesas', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bebidas', 'Drinks e bebidas', 'bebidas', 4, true);

INSERT INTO public.menu_products (restaurant_id, category_id, name, description, price, promotional_price, image_url, is_highlight, is_active, display_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Bruschetta Clássica', 'Pão italiano tostado com tomates frescos, manjericão e azeite extra virgem', 28.90, NULL, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', true, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Carpaccio de Carne', 'Finas fatias de filé mignon com rúcula, alcaparras e parmesão', 45.90, NULL, 'https://images.unsplash.com/photo-1608039829572-f56e0f0ff54d?w=400&h=300&fit=crop', false, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 'Salada Caesar', 'Alface romana, croutons, parmesão e molho caesar tradicional', 32.90, NULL, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop', false, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', 'Risoto de Funghi', 'Arroz arbóreo cremoso com mix de cogumelos frescos e parmesão', 68.90, NULL, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', true, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', 'Salmão Grelhado', 'Salmão grelhado com legumes da estação e molho de ervas', 95.90, 81.51, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', true, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', 'Filé Mignon ao Molho Madeira', 'Filé mignon grelhado com molho madeira e batatas rústicas', 89.90, NULL, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop', false, true, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333333', 'Tiramisù', 'Clássica sobremesa italiana com café, mascarpone e cacau', 32.90, NULL, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true, true, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333333', 'Petit Gâteau', 'Bolo de chocolate quente com sorvete de creme', 28.90, NULL, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', false, true, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '44444444-4444-4444-4444-444444444444', 'Suco Natural', 'Sucos naturais de frutas da estação', 12.90, NULL, 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop', false, true, 1);

INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'menu', true, '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'waiter_call', true, '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'reservations', true, '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'queue', true, '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'kitchen_order', true, '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'customer_review', true, '{}');