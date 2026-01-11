import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  itemCount: number;
  className?: string;
}

export function CartButton({ itemCount, className }: CartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <Link
      to="/encomendas/carrinho"
      className={cn(
        "fixed bottom-6 left-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      aria-label={`Carrinho com ${itemCount} itens`}
    >
      <ShoppingBag className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold flex items-center justify-center">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  );
}
