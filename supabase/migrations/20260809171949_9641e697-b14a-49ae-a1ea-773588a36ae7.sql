ALTER TABLE public.restaurant_modules DROP CONSTRAINT IF EXISTS restaurant_modules_module_name_check;
ALTER TABLE public.restaurant_modules ADD CONSTRAINT restaurant_modules_module_name_check CHECK (module_name IN (
 'menu','waiter_call','reservations','queue','kitchen_order','customer_review','pre_orders',
 'vitrine_digital','digital_comanda','event_bookings','staff_schedule','whatsapp_ai',
 'loyalty_cashback','coupons','referral_program','technical_sheet','metrics'
));

INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_active, settings)
SELECT r.id, m.name, false, '{}'::jsonb
FROM public.restaurants r
CROSS JOIN (VALUES ('technical_sheet'),('whatsapp_ai'),('loyalty_cashback'),('coupons'),('referral_program')) AS m(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.restaurant_modules rm
  WHERE rm.restaurant_id = r.id AND rm.module_name = m.name
);