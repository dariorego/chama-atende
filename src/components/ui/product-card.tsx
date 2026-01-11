import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageZoomDialog } from "./image-zoom-dialog";
import { ZoomIn, CameraOff, Plus, ShoppingBag } from "lucide-react";
import { Button } from "./button";

interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  image?: string;
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
  highlight,
  promotion,
  isOrderable,
  className,
  onClick,
  onAddToCart,
}: ProductCardProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 rounded-xl border bg-card transition-all duration-300",
        highlight
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-border/80",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {/* Image */}
      {image ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
          className="relative shrink-0 cursor-zoom-in group"
        >
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="absolute bottom-1 right-1 p-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3 w-3 text-white" />
          </div>
          {highlight && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              Chef
            </span>
          )}
        </button>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-muted shrink-0 flex items-center justify-center">
          <CameraOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {image && (
        <ImageZoomDialog
          src={image}
          alt={name}
          open={isZoomOpen}
          onOpenChange={setIsZoomOpen}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground line-clamp-1">{name}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOrderable && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full border border-primary/30 flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                Encomenda
              </span>
            )}
            {promotion && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-warning/20 text-warning rounded-full border border-warning/30">
                {promotion}
              </span>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-primary font-bold">{formattedPrice}</p>
          {isOrderable && onAddToCart && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
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
