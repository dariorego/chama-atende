import { cn } from "@/lib/utils";
import { CameraOff, Plus, ShoppingBag } from "lucide-react";
import { Button } from "./button";

interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  image?: string;
  isFallbackImage?: boolean;
  highlight?: boolean;
  promotion?: string;
  isOrderable?: boolean;
  className?: string;
  onClick?: () => void;
  onAddToCart?: (e: React.MouseEvent) => void;
}

export function ProductCard({
  name,
  description,
  price,
  image,
  isFallbackImage,
  highlight,
  promotion,
  isOrderable,
  className,
  onClick,
  onAddToCart,
}: ProductCardProps) {
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 rounded-xl border bg-[#faf6ec]/70 transition-all duration-300",
        highlight
          ? "border-[#c9a84c]/50 bg-[#c9a84c]/5"
          : "border-[#064e3b]/10 hover:border-[#c9a84c]/40 hover:bg-[#faf6ec]",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {/* Image */}
      {image ? (
        <div className="relative shrink-0">
          <img
            src={image}
            alt={name}
            className={cn(
              "w-24 h-24 rounded-xl border border-[#064e3b]/10",
              isFallbackImage ? "object-contain bg-[#faf6ec] p-2" : "object-cover"
            )}
          />
          {highlight && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase bg-[#c9a84c] text-[#064e3b] rounded-full">
              Chef
            </span>
          )}
        </div>
      ) : (
        <div className="w-24 h-24 rounded-xl bg-[#faf6ec] border border-[#064e3b]/10 shrink-0 flex items-center justify-center">
          <CameraOff className="h-8 w-8 text-[#064e3b]/30" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="editorial-title text-base sm:text-lg text-[#064e3b] break-words hyphens-auto leading-snug"
            style={{ overflowWrap: 'anywhere' }}
          >
            {name}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOrderable && (
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase bg-[#064e3b]/5 text-[#064e3b] rounded-full border border-[#064e3b]/20 flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                Encomenda
              </span>
            )}
            {promotion && (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase bg-[#c9a84c] text-[#064e3b] rounded-full">
                {promotion}
              </span>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-[#064e3b]/60 mt-1 line-clamp-2 font-sans-editorial">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="editorial-title text-2xl text-[#c9a84c]">{formattedPrice}</p>
          {isOrderable && onAddToCart && (
            <Button
              size="sm"
              className="h-9 px-4 text-xs tracking-widest uppercase bg-[#064e3b] hover:bg-[#064e3b]/90 text-[#faf6ec] border border-[#c9a84c]/40"
              onClick={onAddToCart}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
