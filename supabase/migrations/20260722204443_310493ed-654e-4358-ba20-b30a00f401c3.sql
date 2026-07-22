GRANT SELECT ON public.tables TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tables TO authenticated;
GRANT ALL ON public.tables TO service_role;