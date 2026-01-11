-- Create pre_orders table
CREATE TABLE pre_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  observations TEXT,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create pre_order_items table
CREATE TABLE pre_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_order_id UUID NOT NULL REFERENCES pre_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES menu_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create updated_at trigger for pre_orders
CREATE TRIGGER update_pre_orders_updated_at
  BEFORE UPDATE ON pre_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for pre_orders
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;

-- Pre-orders policies
CREATE POLICY "Public can create pre_orders" ON pre_orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view pre_orders" ON pre_orders 
  FOR SELECT USING (true);

CREATE POLICY "Public can update own pre_orders" ON pre_orders 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage pre_orders" ON pre_orders 
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Enable RLS for pre_order_items
ALTER TABLE pre_order_items ENABLE ROW LEVEL SECURITY;

-- Pre-order items policies
CREATE POLICY "Public can create pre_order_items" ON pre_order_items 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view pre_order_items" ON pre_order_items 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pre_order_items" ON pre_order_items 
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

-- Create indexes for better performance
CREATE INDEX idx_pre_orders_restaurant_id ON pre_orders(restaurant_id);
CREATE INDEX idx_pre_orders_status ON pre_orders(status);
CREATE INDEX idx_pre_orders_pickup_date ON pre_orders(pickup_date);
CREATE INDEX idx_pre_orders_customer_phone ON pre_orders(customer_phone);
CREATE INDEX idx_pre_order_items_pre_order_id ON pre_order_items(pre_order_id);