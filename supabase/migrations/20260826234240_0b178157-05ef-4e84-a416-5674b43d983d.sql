ALTER TABLE public.hygiene_checklist_answers REPLICA IDENTITY FULL;
ALTER TABLE public.hygiene_checklist_runs REPLICA IDENTITY FULL;
ALTER TABLE public.hygiene_shelf_life_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='hygiene_checklist_answers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hygiene_checklist_answers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='hygiene_checklist_runs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hygiene_checklist_runs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='hygiene_shelf_life_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hygiene_shelf_life_items;
  END IF;
END $$;