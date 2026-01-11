import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePreOrderCart } from '@/hooks/usePreOrderCart';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function PreOrderCartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = usePreOrderCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <ClientLayout title="Carrinho de Encomendas" showBack backTo="/encomendas">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-6">
            Adicione produtos disponíveis para encomenda
          </p>
          <Button asChild>
            <Link to="/encomendas">Ver Produtos</Link>
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Carrinho de Encomendas" showBack backTo="/encomendas">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                  <p className="text-sm text-primary font-semibold">
                    {formatPrice(item.unitPrice)}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive ml-auto"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Total */}
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">{formatPrice(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/encomendas/checkout')}
          >
            Continuar Encomenda
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={clearCart}
          >
            Limpar Carrinho
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
