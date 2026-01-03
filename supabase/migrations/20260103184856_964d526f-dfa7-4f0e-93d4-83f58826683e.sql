-- Adicionar campo para configurações de notificação
ALTER TABLE public.restaurants 
ADD COLUMN notification_settings jsonb DEFAULT '{"sound_enabled": true}'::jsonb;

COMMENT ON COLUMN public.restaurants.notification_settings IS 
'Configurações de notificação: sound_enabled (boolean)';