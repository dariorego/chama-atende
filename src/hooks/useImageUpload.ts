import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

const BUCKET_NAME = 'imagens';
import { SUPABASE_PROJECT_URL } from '@/integrations/supabase/client';
const SUPABASE_URL = SUPABASE_PROJECT_URL;

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { slug } = useTenant();

  const uploadImage = async (blob: Blob, folder: string = 'cardapio'): Promise<string> => {
    setIsUploading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const extension = blob.type.split('/')[1] || 'jpg';
      const basePath = slug ? `${slug}/${folder}` : folder;
      const fileName = `${basePath}/${timestamp}-${randomId}.${extension}`;

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Retorna URL pública
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${data.path}`;
      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      // Extrai o path da URL
      const urlPattern = new RegExp(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/(.+)`);
      const match = url.match(urlPattern);
      
      if (!match || !match[1]) {
        throw new Error('URL de imagem inválida');
      }

      const filePath = match[1];
      
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar imagem';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    error,
  };
}
