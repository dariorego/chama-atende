import { useState, useRef } from 'react';
import { ImageCropModal } from './image-crop-modal';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadWithCropProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImageUploadWithCrop({
  value,
  onChange,
  folder = 'produtos',
  className,
  disabled = false,
}: ImageUploadWithCropProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, isUploading } = useImageUpload();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas imagens JPG, PNG ou WebP.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: 'Arquivo muito grande',
        description: `O tamanho máximo é ${MAX_SIZE_MB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Criar URL temporária e abrir modal de crop
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setIsCropModalOpen(true);

    // Limpar input para permitir re-selecionar o mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    try {
      const url = await uploadImage(blob, folder);
      onChange(url);
      toast({
        title: 'Imagem enviada',
        description: 'A imagem foi salva com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro ao enviar imagem.',
        variant: 'destructive',
      });
    } finally {
      // Limpar URL temporária
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      await deleteImage(value);
      onChange(null);
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida com sucesso.',
      });
    } catch (error) {
      // Mesmo se falhar ao deletar do storage, limpa o campo
      onChange(null);
      console.error('Erro ao deletar imagem:', error);
    }
  };

  const handleCropModalClose = (open: boolean) => {
    if (!open && selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    setIsCropModalOpen(open);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative group">
          <div className="aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={value}
              alt="Imagem do produto"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 max-w-[200px] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'aspect-square w-full max-w-[200px] rounded-lg border-2 border-dashed border-border',
            'flex flex-col items-center justify-center gap-2 text-muted-foreground',
            'hover:border-primary hover:text-primary transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed bg-surface'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Selecionar imagem</span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WebP. Máximo {MAX_SIZE_MB}MB. Formato quadrado.
      </p>

      {selectedImage && (
        <ImageCropModal
          open={isCropModalOpen}
          onOpenChange={handleCropModalClose}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </div>
  );
}
