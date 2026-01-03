-- Adicionar campo para tipo de identificação preferido
ALTER TABLE public.restaurants 
ADD COLUMN identification_type text DEFAULT 'table';

-- Valores possíveis: 'table', 'room', 'phone'
COMMENT ON COLUMN public.restaurants.identification_type IS 
'Tipo de identificação: table (Mesa), room (Quarto), phone (Telefone Celular)';