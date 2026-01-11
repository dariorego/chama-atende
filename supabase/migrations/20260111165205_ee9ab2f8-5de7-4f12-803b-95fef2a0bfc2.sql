-- =============================================
-- CORREÇÃO DE POLÍTICAS RLS PERMISSIVAS
-- =============================================

-- 1. ORDERS - Restringir update apenas para pedidos recentes (últimas 24h)
DROP POLICY IF EXISTS "Public can update orders" ON orders;
CREATE POLICY "Public can update recent orders"
ON orders
FOR UPDATE
TO anon
USING (created_at > now() - interval '24 hours')
WITH CHECK (created_at > now() - interval '24 hours');

-- 2. PRE_ORDERS - Restringir update para encomendas recentes
DROP POLICY IF EXISTS "Public can update own pre_orders" ON pre_orders;
CREATE POLICY "Public can update recent pre_orders"
ON pre_orders
FOR UPDATE
TO anon
USING (created_at > now() - interval '24 hours')
WITH CHECK (created_at > now() - interval '24 hours');

-- 3. QUEUE_ENTRIES - Restringir update para entradas do dia
DROP POLICY IF EXISTS "Public can update own queue entry" ON queue_entries;
CREATE POLICY "Public can update today queue entries"
ON queue_entries
FOR UPDATE
TO anon
USING (created_at::date = current_date)
WITH CHECK (created_at::date = current_date);

-- 4. SERVICE_CALLS - Restringir update para chamados recentes
DROP POLICY IF EXISTS "Public can update service calls" ON service_calls;
CREATE POLICY "Public can update recent service calls"
ON service_calls
FOR UPDATE
TO anon
USING (created_at > now() - interval '2 hours')
WITH CHECK (created_at > now() - interval '2 hours');

-- 5. TABLE_SESSIONS - Restringir update para sessões abertas
DROP POLICY IF EXISTS "Public can update table sessions" ON table_sessions;
CREATE POLICY "Public can update open table sessions"
ON table_sessions
FOR UPDATE
TO anon
USING (status = 'open')
WITH CHECK (status = 'open');

-- 6. ORDER_LINE_ITEMS - Restringir criação para pedidos recentes
DROP POLICY IF EXISTS "Public can create line items" ON order_line_items;
CREATE POLICY "Public can create line items for recent orders"
ON order_line_items
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_id 
    AND orders.created_at > now() - interval '24 hours'
  )
);

-- 7. ORDER_LINE_ITEM_SELECTIONS - Restringir criação
DROP POLICY IF EXISTS "Public can create selections" ON order_line_item_selections;
CREATE POLICY "Public can create selections for recent orders"
ON order_line_item_selections
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_line_items li
    JOIN orders o ON o.id = li.order_id
    WHERE li.id = line_item_id
    AND o.created_at > now() - interval '24 hours'
  )
);

-- 8. PRE_ORDER_ITEMS - Restringir criação para encomendas recentes
DROP POLICY IF EXISTS "Public can create pre_order_items" ON pre_order_items;
CREATE POLICY "Public can create pre_order_items for recent orders"
ON pre_order_items
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pre_orders 
    WHERE pre_orders.id = pre_order_id 
    AND pre_orders.created_at > now() - interval '24 hours'
  )
);