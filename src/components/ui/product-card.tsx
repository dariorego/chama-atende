import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  description?: string;
  price: number;
  image?: string;
  highlight?: boolean;
  promotion?: string;
  className?: string;
}

export function ProductCard({
  name,
  description,
  price,
  image,
  highlight,
  promotion,
  className,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl border bg-card transition-all duration-300",
        highlight
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-border/80",
        className
      )}
    >
      {/* Image */}
      {image ? (
        <div className="relative shrink-0">
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          {highlight && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              Chef
            </span>
          )}
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-secondary shrink-0 flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground line-clamp-1">{name}</h4>
          {promotion && (
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium bg-warning/20 text-warning rounded-full border border-warning/30">
              {promotion}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-primary font-bold mt-2">{formattedPrice}</p>
      </div>
    </div>
  );
}
