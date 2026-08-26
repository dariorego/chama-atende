ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS google_review_url text,
  ADD COLUMN IF NOT EXISTS google_review_min_rating integer NOT NULL DEFAULT 4;