-- Adicionar campo JSONB para horários por dia da semana
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{
  "monday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "tuesday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "wednesday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "thursday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "friday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "saturday": {"open": "11:30", "close": "23:00", "is_closed": false},
  "sunday": {"open": "11:30", "close": "22:00", "is_closed": false}
}'::jsonb;

-- Adicionar campo para fuso horário
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Sao_Paulo';

COMMENT ON COLUMN public.restaurants.business_hours IS 
'Horários de funcionamento por dia da semana: {day: {open, close, is_closed}}';

COMMENT ON COLUMN public.restaurants.timezone IS 
'Fuso horário do restaurante (ex: America/Sao_Paulo, America/Recife)';