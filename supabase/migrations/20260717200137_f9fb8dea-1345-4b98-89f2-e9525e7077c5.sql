
ALTER TABLE public.menu_products
  ADD COLUMN IF NOT EXISTS show_on_display boolean NOT NULL DEFAULT false;

ALTER TABLE public.restaurant_modules
  DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;

ALTER TABLE public.restaurant_modules
  ADD CONSTRAINT restaurant_modules_module_name_check
  CHECK (module_name = ANY (ARRAY[
    'menu','waiter_call','reservations','queue','kitchen_order',
    'customer_review','pre_orders','vitrine_digital'
  ]));

INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT r.id, 'vitrine_digital', false,
       '{"display_model":"cinema","interval_seconds":8,"show_price":true}'::jsonb
FROM public.restaurants r
WHERE NOT EXISTS (
  SELECT 1 FROM public.restaurant_modules m
  WHERE m.restaurant_id = r.id AND m.module_name = 'vitrine_digital'
);
