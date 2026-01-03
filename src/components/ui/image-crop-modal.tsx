import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropModal({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const getCroppedImg = async (): Promise<Blob> => {
    const image = imgRef.current;
    if (!image || !crop) {
      throw new Error('Imagem ou crop não definidos');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calcula dimensões do crop em pixels reais
    const pixelCrop = {
      x: (crop.x / 100) * image.width * scaleX,
      y: (crop.y / 100) * image.height * scaleY,
      width: (crop.width / 100) * image.width * scaleX,
      height: (crop.height / 100) * image.height * scaleY,
    };

    // Tamanho final da imagem (quadrado)
    const outputSize = Math.min(pixelCrop.width, pixelCrop.height, 800);
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível criar contexto do canvas');
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erro ao gerar imagem'));
          }
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg();
      onCropComplete(blob);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao processar crop:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
          <DialogDescription>
            Arraste para ajustar a área de recorte. A imagem será salva em formato quadrado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4 max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={aspectRatio}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Imagem para recorte"
              onLoad={onImageLoad}
              className="max-h-[50vh] w-auto"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !crop}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
