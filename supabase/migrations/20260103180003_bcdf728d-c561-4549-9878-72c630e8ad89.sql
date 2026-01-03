-- Add theme_colors column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS theme_colors jsonb DEFAULT '{}'::jsonb;