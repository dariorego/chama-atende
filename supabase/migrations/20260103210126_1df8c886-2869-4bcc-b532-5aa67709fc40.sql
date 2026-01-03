-- Adicionar campos de localização na tabela restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS google_maps_url text,
ADD COLUMN IF NOT EXISTS location_coordinates jsonb DEFAULT '{}';