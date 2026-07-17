import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageZoomDialog } from "./image-zoom-dialog";
import { ZoomIn, CameraOff, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "./button";

interface PreOrderProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  promotion?: string;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
}

export function PreOrderProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  image,
  promotion,
  quantity = 0,
  onAdd,
  onRemove,
  onClick,
}: PreOrderProductCardProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(originalPrice)
    : null;

  return (
    <div
      className={cn(
        "group relative bg-[#faf6ec]/70 rounded-2xl border border-[#064e3b]/10 overflow-hidden transition-all duration-300",
        "hover:border-[#c9a84c]/50 hover:shadow-lg",
        quantity > 0 && "ring-2 ring-[#c9a84c] ring-offset-2 ring-offset-[#f5efe4]"
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              className="w-full h-full cursor-zoom-in"
            >
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#064e3b]/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4 text-white" />
              </div>
            </button>
            <ImageZoomDialog
              src={image}
              alt={name}
              open={isZoomOpen}
              onOpenChange={setIsZoomOpen}
            />
          </>
        ) : (
          <div className="w-full h-full bg-[#faf6ec] flex items-center justify-center">
            <CameraOff className="h-12 w-12 text-[#064e3b]/30" />
          </div>
        )}

        {/* Promotion Badge */}
        {promotion && (
          <div className="absolute top-2 left-2">
            <span className="px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase bg-[#c9a84c] text-[#064e3b] rounded-full shadow-lg">
              {promotion}
            </span>
          </div>
        )}

        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center justify-center w-7 h-7 text-sm font-bold bg-[#064e3b] text-[#faf6ec] rounded-full shadow-lg border border-[#c9a84c]/40">
              {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <button
          onClick={onClick}
          className="text-left w-full"
        >
          <h3 className="editorial-title text-xl text-[#064e3b] line-clamp-1">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-[#064e3b]/60 mt-1 line-clamp-2 font-sans-editorial">
              {description}
            </p>
          )}
        </button>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#064e3b]/10">
          <div className="flex flex-col">
            {formattedOriginalPrice && (
              <span className="text-xs text-[#064e3b]/40 line-through">
                {formattedOriginalPrice}
              </span>
            )}
            <span className="editorial-title text-2xl text-[#c9a84c]">{formattedPrice}</span>
          </div>

          {/* Add/Remove Controls */}
          <div className="flex items-center gap-2">
            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-[#064e3b]/5 border border-[#c9a84c]/30 rounded-full p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-[#c9a84c]/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                  }}
                >
                  <Minus className="h-4 w-4 text-[#064e3b]" />
                </Button>
                <span className="w-6 text-center font-semibold text-[#064e3b]">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-[#c9a84c]/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd?.();
                  }}
                >
                  <Plus className="h-4 w-4 text-[#064e3b]" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="h-9 px-4 rounded-full gap-1.5 shadow-md hover:shadow-lg transition-all bg-[#064e3b] hover:bg-[#064e3b]/90 text-[#faf6ec] border border-[#c9a84c]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
