-- Add payment_method and admin_response columns to pre_orders table
ALTER TABLE public.pre_orders 
ADD COLUMN payment_method text DEFAULT NULL,
ADD COLUMN admin_response text DEFAULT NULL;

-- Create function to search pre-orders by phone (similar to reservations)
CREATE OR REPLACE FUNCTION public.search_pre_orders_by_phone(search_phone text)
RETURNS TABLE (
  id uuid,
  order_number integer,
  customer_name text,
  customer_phone text,
  pickup_date date,
  pickup_time time,
  status text,
  observations text,
  total_amount numeric,
  payment_method text,
  admin_response text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.order_number,
    p.customer_name,
    p.customer_phone,
    p.pickup_date,
    p.pickup_time,
    p.status,
    p.observations,
    p.total_amount,
    p.payment_method,
    p.admin_response,
    p.created_at
  FROM public.pre_orders p
  WHERE (
    p.customer_phone = regexp_replace(search_phone, '\D', '', 'g')
    OR p.customer_phone = search_phone
  )
  AND p.status NOT IN ('delivered', 'cancelled')
  ORDER BY p.pickup_date DESC, p.pickup_time DESC
$$;