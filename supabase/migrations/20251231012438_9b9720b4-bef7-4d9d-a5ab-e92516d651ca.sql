-- Políticas RLS para menu_products - Admins e Managers podem gerenciar produtos do seu restaurante

-- Admins podem ver TODOS os produtos do seu restaurante (incluindo inativos)
CREATE POLICY "Admins can view all restaurant products"
ON public.menu_products
FOR SELECT
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem inserir produtos no seu restaurante
CREATE POLICY "Admins can insert products"
ON public.menu_products
FOR INSERT
TO authenticated
WITH CHECK (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem atualizar produtos do seu restaurante
CREATE POLICY "Admins can update products"
ON public.menu_products
FOR UPDATE
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem deletar produtos do seu restaurante
CREATE POLICY "Admins can delete products"
ON public.menu_products
FOR DELETE
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Políticas RLS para menu_categories - Admins e Managers podem gerenciar categorias

-- Admins podem ver TODAS as categorias do seu restaurante (incluindo inativas)
CREATE POLICY "Admins can view all restaurant categories"
ON public.menu_categories
FOR SELECT
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem inserir categorias no seu restaurante
CREATE POLICY "Admins can insert categories"
ON public.menu_categories
FOR INSERT
TO authenticated
WITH CHECK (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem atualizar categorias do seu restaurante
CREATE POLICY "Admins can update categories"
ON public.menu_categories
FOR UPDATE
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Admins podem deletar categorias do seu restaurante
CREATE POLICY "Admins can delete categories"
ON public.menu_categories
FOR DELETE
TO authenticated
USING (
  restaurant_id = get_user_restaurant_id(auth.uid())
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);