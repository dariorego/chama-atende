
-- Add table area + map coordinates
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT 'Salão',
  ADD COLUMN IF NOT EXISTS position_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS position_y numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS shape text NOT NULL DEFAULT 'square';

-- Enable realtime for tables (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE public.tables REPLICA IDENTITY FULL;
