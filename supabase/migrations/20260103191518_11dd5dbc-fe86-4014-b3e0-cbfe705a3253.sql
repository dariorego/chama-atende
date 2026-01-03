ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS theme_settings jsonb DEFAULT '{"client_default_theme": "dark", "admin_default_theme": "dark"}'::jsonb;

COMMENT ON COLUMN public.restaurants.theme_settings IS 'Configurações de tema: client_default_theme, admin_default_theme (light/dark)';