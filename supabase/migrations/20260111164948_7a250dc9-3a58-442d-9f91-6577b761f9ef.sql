-- Remover política de leitura atual
DROP POLICY IF EXISTS "Public read access for modules" ON restaurant_modules;

-- Criar nova política de leitura para usuários públicos (apenas ativos)
CREATE POLICY "Public can view active modules"
ON restaurant_modules
FOR SELECT
TO anon
USING (is_active = true);

-- Criar política de leitura para admins/managers (todos os módulos)
CREATE POLICY "Admins can view all modules"
ON restaurant_modules
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Criar política para usuários autenticados normais (apenas ativos)
CREATE POLICY "Authenticated users view active modules"
ON restaurant_modules
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);