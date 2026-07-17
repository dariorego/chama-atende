import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ImageZoomDialog } from "./image-zoom-dialog";
import { ZoomIn, CameraOff } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  highlight?: boolean;
  promotion?: string;
}

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden bg-[#f5efe4] border-t border-[#c9a84c]/30">
        {/* Image */}
        <div className="relative w-full aspect-[16/10] bg-[#faf6ec]">
          {product.image ? (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="w-full h-full cursor-zoom-in group"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 p-2 rounded-full bg-[#064e3b]/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4 text-white" />
              </div>
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#faf6ec]">
              <CameraOff className="h-16 w-16 text-[#064e3b]/30" />
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
            {product.highlight && (
              <span className="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase bg-[#c9a84c] text-[#064e3b] rounded-full">
                Sugestão do Chef
              </span>
            )}
            {product.promotion && (
              <span className="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase bg-[#064e3b] text-[#faf6ec] rounded-full">
                {product.promotion}
              </span>
            )}
          </div>
        </div>

        {product.image && (
          <ImageZoomDialog
            src={product.image}
            alt={product.name}
            open={isZoomOpen}
            onOpenChange={setIsZoomOpen}
          />
        )}

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-40vw)]">
          <SheetHeader className="text-left p-0">
            <SheetTitle className="editorial-title text-4xl text-[#064e3b]">
              {product.name}
            </SheetTitle>
          </SheetHeader>

          {product.description && (
            <p className="text-[#064e3b]/70 leading-relaxed font-sans-editorial">
              {product.description}
            </p>
          )}

          <div className="pt-4 border-t border-[#064e3b]/10 flex items-baseline gap-3">
            <span className="editorial-label text-[#064e3b]/50">Valor</span>
            <p className="editorial-title text-4xl text-[#c9a84c]">{formattedPrice}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
