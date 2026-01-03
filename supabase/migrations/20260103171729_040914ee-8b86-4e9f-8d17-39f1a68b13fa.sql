-- ===========================================
-- MÓDULO DE PEDIDOS CONFIGURÁVEIS
-- ===========================================

-- 1. Itens Principais (Tapioca, Crepioca, Omelete, etc.)
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Grupos de Combinações (Queijos, Proteínas, Vegetais, etc.)
CREATE TABLE public.order_combination_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  selection_type text DEFAULT 'multiple' CHECK (selection_type IN ('single', 'multiple', 'quantity')),
  min_selections integer DEFAULT 0,
  max_selections integer,
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Opções de Combinação (Mozzarella, Bacon, Tomate, etc.)
CREATE TABLE public.order_combination_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.order_combination_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  emoji text,
  additional_price numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Vinculação Item ↔ Grupos disponíveis
CREATE TABLE public.order_item_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  combination_group_id uuid NOT NULL REFERENCES public.order_combination_groups(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_item_id, combination_group_id)
);

-- 5. Pedidos
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_number serial,
  table_id uuid REFERENCES public.tables(id),
  table_number text,
  customer_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  observations text,
  total_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

-- 6. Itens do Pedido
CREATE TABLE public.order_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id),
  item_name text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) DEFAULT 0,
  observations text,
  created_at timestamptz DEFAULT now()
);

-- 7. Seleções de cada item do pedido
CREATE TABLE public.order_line_item_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_item_id uuid NOT NULL REFERENCES public.order_line_items(id) ON DELETE CASCADE,
  combination_option_id uuid NOT NULL REFERENCES public.order_combination_options(id),
  option_name text NOT NULL,
  quantity integer DEFAULT 1,
  additional_price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_order_items_restaurant ON public.order_items(restaurant_id);
CREATE INDEX idx_order_items_active ON public.order_items(is_active, display_order);
CREATE INDEX idx_order_groups_restaurant ON public.order_combination_groups(restaurant_id);
CREATE INDEX idx_order_options_group ON public.order_combination_options(group_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_order_line_items_order ON public.order_line_items(order_id);

-- Triggers para updated_at
CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_combination_groups_updated_at
  BEFORE UPDATE ON public.order_combination_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_combination_options_updated_at
  BEFORE UPDATE ON public.order_combination_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_combination_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_combination_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_item_selections ENABLE ROW LEVEL SECURITY;

-- Políticas para order_items
CREATE POLICY "Public read active order items" ON public.order_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Políticas para order_combination_groups
CREATE POLICY "Public read active combination groups" ON public.order_combination_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage combination groups" ON public.order_combination_groups
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Políticas para order_combination_options
CREATE POLICY "Public read active combination options" ON public.order_combination_options
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage combination options" ON public.order_combination_options
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Políticas para order_item_groups
CREATE POLICY "Public read item groups" ON public.order_item_groups
  FOR SELECT USING (true);

CREATE POLICY "Admins manage item groups" ON public.order_item_groups
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Políticas para orders
CREATE POLICY "Public can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own orders" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE POLICY "Public can update orders" ON public.orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Políticas para order_line_items
CREATE POLICY "Public can create line items" ON public.order_line_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view line items" ON public.order_line_items
  FOR SELECT USING (true);

CREATE POLICY "Admins manage line items" ON public.order_line_items
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Políticas para order_line_item_selections
CREATE POLICY "Public can create selections" ON public.order_line_item_selections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view selections" ON public.order_line_item_selections
  FOR SELECT USING (true);

CREATE POLICY "Admins manage selections" ON public.order_line_item_selections
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Habilitar realtime para pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;