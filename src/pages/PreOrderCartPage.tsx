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
          <div className="w-24 h-24 rounded-full bg-[#faf6ec] border border-[#c9a84c]/40 flex items-center justify-center mb-4">
            <ShoppingBag className="h-10 w-10 text-[#c9a84c]" />
          </div>
          <h2 className="editorial-title text-3xl text-[#064e3b] mb-2">Carrinho vazio</h2>
          <p className="text-[#064e3b]/60 mb-6 font-sans-editorial">
            Adicione produtos disponíveis para encomenda
          </p>
          <Button asChild className="bg-[#064e3b] hover:bg-[#064e3b]/90 text-[#faf6ec] border border-[#c9a84c]/40 tracking-widest uppercase text-xs">
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
          <Card key={item.productId} className="overflow-hidden bg-[#faf6ec]/70 border-[#064e3b]/10">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover border border-[#064e3b]/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[#faf6ec] border border-[#064e3b]/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-[#064e3b]/40" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="editorial-title text-xl text-[#064e3b] line-clamp-1">{item.productName}</h3>
                  <p className="editorial-title text-lg text-[#c9a84c]">
                    {formatPrice(item.unitPrice)}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[#c9a84c]/40 text-[#064e3b] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c]"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-[#064e3b]">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-[#c9a84c]/40 text-[#064e3b] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c]"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#064e3b]/40 hover:text-destructive hover:bg-destructive/10 ml-auto"
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
        <Card className="bg-[#064e3b] border-[#c9a84c]/40">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="editorial-label text-[#c9a84c]">Subtotal</span>
              <span className="editorial-title text-3xl text-[#faf6ec]">{formatPrice(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            className="w-full bg-[#064e3b] hover:bg-[#064e3b]/90 text-[#faf6ec] border border-[#c9a84c]/40 tracking-widest uppercase text-xs h-14"
            onClick={() => navigate('/encomendas/checkout')}
          >
            Continuar Encomenda
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-[#064e3b]/20 text-[#064e3b] hover:bg-[#064e3b]/5 tracking-widest uppercase text-xs"
            onClick={clearCart}
          >
            Limpar Carrinho
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
