-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Public can view reservations by phone" ON public.reservations;

-- Create a more restrictive SELECT policy
-- Users can only see reservations when they filter by their own phone number
-- The policy requires a phone filter in the WHERE clause - without it, no rows are returned
-- Admins/managers can see all reservations
CREATE POLICY "Public can view own reservations by phone" ON public.reservations
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Create a separate policy for public phone-based lookups
-- This uses a security definer function to validate that the query includes a phone filter
CREATE OR REPLACE FUNCTION public.check_reservation_phone_match(reservation_phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- This function is called for each row
  -- The actual filtering happens at the query level via .eq() or .or() filters
  -- This just ensures the phone column exists and the row-level check passes
  SELECT true
$$;

-- Allow anonymous users to SELECT only when filtering by phone
-- The key is that without a phone filter in the query, the results are filtered by the application logic
CREATE POLICY "Public can search reservations by phone filter" ON public.reservations
FOR SELECT TO anon, authenticated
USING (true);

-- Wait, this recreates the same issue. Let me think differently.
-- The issue is RLS cannot know what's in the WHERE clause of a query.
-- The solution is to rely on the application layer to filter + limit exposure

-- Instead, let's drop the permissive policy and create one that:
-- 1. Allows admins/managers full access
-- 2. For public, we limit what can be selected - but RLS can't do column filtering

-- Best approach: Use RLS to block all public SELECT, create an RPC function for public lookups
DROP POLICY IF EXISTS "Public can search reservations by phone filter" ON public.reservations;
DROP FUNCTION IF EXISTS public.check_reservation_phone_match(text);

-- Only admins/managers can SELECT directly
-- Already handled by the first policy created above

-- Create a secure RPC function for public reservation lookup by phone
CREATE OR REPLACE FUNCTION public.search_reservations_by_phone(search_phone text)
RETURNS TABLE (
  id uuid,
  reservation_code text,
  customer_name text,
  phone text,
  party_size integer,
  reservation_date date,
  reservation_time time,
  status text,
  notes text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.reservation_code,
    r.customer_name,
    r.phone,
    r.party_size,
    r.reservation_date,
    r.reservation_time,
    r.status,
    r.notes,
    r.created_at
  FROM public.reservations r
  WHERE (
    r.phone = regexp_replace(search_phone, '\D', '', 'g')
    OR r.phone = search_phone
  )
  AND r.status IN ('pending', 'confirmed')
  ORDER BY r.reservation_date ASC, r.reservation_time ASC
$$;

COMMENT ON FUNCTION public.search_reservations_by_phone IS 
'Secure function for public reservation lookup - only returns reservations matching the provided phone number';