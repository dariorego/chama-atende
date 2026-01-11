-- Add is_orderable column to menu_products for pre-order functionality
ALTER TABLE menu_products 
ADD COLUMN IF NOT EXISTS is_orderable BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN menu_products.is_orderable IS 
  'Indica se o produto está disponível para encomenda antecipada';