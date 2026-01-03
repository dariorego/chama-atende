-- Criar bucket público para imagens do cardápio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagens',
  'imagens',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Política: Admins e managers podem fazer upload
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagens' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

-- Política: Admins e managers podem atualizar
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imagens' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

-- Política: Admins e managers podem deletar
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'imagens' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
);

-- Política: Qualquer pessoa pode visualizar (bucket público)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'imagens');