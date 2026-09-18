DROP POLICY IF EXISTS "Public can create queue entries" ON public.queue_entries;

CREATE POLICY "Public can create tenant queue entries"
ON public.queue_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  restaurant_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = queue_entries.restaurant_id
      AND r.is_active = true
  )
  AND char_length(customer_name) BETWEEN 1 AND 100
  AND (phone IS NULL OR char_length(phone) BETWEEN 8 AND 20)
  AND party_size BETWEEN 1 AND 50
  AND (notes IS NULL OR char_length(notes) <= 500)
);