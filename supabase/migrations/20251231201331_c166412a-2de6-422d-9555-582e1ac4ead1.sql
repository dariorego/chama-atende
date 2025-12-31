-- Add UPDATE policies for restaurant_modules table
CREATE POLICY "Admins can update restaurant modules"
ON public.restaurant_modules
FOR UPDATE
USING (
  restaurant_id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
)
WITH CHECK (
  restaurant_id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);

-- Add SELECT policy for admins to view ALL modules (including inactive)
CREATE POLICY "Admins can view all restaurant modules"
ON public.restaurant_modules
FOR SELECT
USING (
  restaurant_id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);

-- Add UPDATE policy for restaurants table
CREATE POLICY "Admins can update own restaurant"
ON public.restaurants
FOR UPDATE
USING (
  id = get_user_restaurant_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  id = get_user_restaurant_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add SELECT policy for admins to view their restaurant details
CREATE POLICY "Admins can view own restaurant"
ON public.restaurants
FOR SELECT
USING (
  id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);