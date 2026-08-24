ALTER TABLE public.menu_products
  ADD COLUMN IF NOT EXISTS availability_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  ADD COLUMN IF NOT EXISTS available_from time,
  ADD COLUMN IF NOT EXISTS available_to time;

ALTER TABLE public.menu_categories
  ADD COLUMN IF NOT EXISTS availability_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  ADD COLUMN IF NOT EXISTS available_from time,
  ADD COLUMN IF NOT EXISTS available_to time;