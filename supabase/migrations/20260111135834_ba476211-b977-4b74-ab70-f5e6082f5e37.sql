-- Drop existing constraint and recreate with pre_orders included
ALTER TABLE restaurant_modules 
DROP CONSTRAINT restaurant_modules_module_name_check;

ALTER TABLE restaurant_modules 
ADD CONSTRAINT restaurant_modules_module_name_check 
CHECK (module_name = ANY (ARRAY['menu'::text, 'waiter_call'::text, 'reservations'::text, 'queue'::text, 'kitchen_order'::text, 'customer_review'::text, 'pre_orders'::text]));

-- Insert pre_orders module for existing restaurants (if not exists)
INSERT INTO restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT id, 'pre_orders', false, '{"min_advance_hours": 24}'::jsonb
FROM restaurants
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_modules rm 
  WHERE rm.restaurant_id = restaurants.id 
  AND rm.module_name = 'pre_orders'
);