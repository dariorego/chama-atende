import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePreOrderStatus } from '@/hooks/usePreOrderStatus';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import {
  Loader2,
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  XCircle,
  MessageCircle,
  Calendar,
  User,
  Phone,
  CreditCard,
  QrCode,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: 'Pendente', icon: Clock, color: 'text-[#c9a84c]' },
  confirmed: { label: 'Confirmada', icon: CheckCircle2, color: 'text-[#064e3b]' },
  preparing: { label: 'Em Preparo', icon: ChefHat, color: 'text-[#c9a84c]' },
  ready: { label: 'Pronta', icon: Package, color: 'text-[#064e3b]' },
  delivered: { label: 'Entregue', icon: CheckCircle2, color: 'text-[#064e3b]' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'text-destructive' },
};

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  pix: { label: 'PIX', icon: QrCode, color: 'text-[#c9a84c]' },
  card: { label: 'Cartão', icon: CreditCard, color: 'text-[#c9a84c]' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'ready', 'delivered'];

export default function PreOrderStatusPage() {
  const { orderId } = useParams();
  const { data: preOrder, isLoading, error } = usePreOrderStatus(orderId);
  const { restaurant } = useAdminSettings();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleShareWhatsApp = () => {
    if (!preOrder || !restaurant) return;

    const pickupDate = new Date(preOrder.pickup_date + 'T12:00:00');
    const formattedDate = format(pickupDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = preOrder.pickup_time.slice(0, 5);

    const paymentLabel = preOrder.payment_method === 'pix' ? 'PIX' : preOrder.payment_method === 'card' ? 'Cartão' : 'Não informado';

    const message = `Olá! Fiz uma encomenda:

📋 Encomenda #${preOrder.order_number.toString().padStart(3, '0')}
📅 Retirada: ${formattedDate} às ${formattedTime}
💳 Pagamento: ${paymentLabel}
🏠 ${restaurant.name}
📍 ${restaurant.address || 'Endereço não informado'}
📞 ${restaurant.phone || 'Telefone não informado'}

Itens:
${preOrder.items?.map((item) => `• ${item.quantity}x ${item.product_name}`).join('\n')}

💰 Total: ${formatPrice(Number(preOrder.total_amount))}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <ClientLayout title="Status da Encomenda" showBack backTo="/">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  if (error || !preOrder) {
    return (
      <ClientLayout title="Status da Encomenda" showBack backTo="/">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="editorial-title text-3xl text-[#064e3b] mb-2">Encomenda não encontrada</h2>
          <p className="text-[#064e3b]/60 font-sans-editorial">
            Verifique se o link está correto ou entre em contato conosco.
          </p>
        </div>
      </ClientLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[preOrder.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const currentStatusIndex = STATUS_ORDER.indexOf(preOrder.status);
  const isCancelled = preOrder.status === 'cancelled';

  const paymentConfig = preOrder.payment_method ? PAYMENT_METHOD_CONFIG[preOrder.payment_method] : null;
  const PaymentIcon = paymentConfig?.icon || CreditCard;

  return (
    <ClientLayout title="Status da Encomenda" showBack backTo="/">
      <div className="space-y-6">
        {/* Order Header */}
        <Card className="bg-[#064e3b] border-[#c9a84c]/40">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/40 mb-3">
                <StatusIcon className="h-8 w-8 text-[#c9a84c]" />
              </div>
              <p className="editorial-label text-[#c9a84c] mb-1">Encomenda</p>
              <h2 className="editorial-title text-4xl text-[#faf6ec] mb-2">
                Encomenda #{preOrder.order_number.toString().padStart(3, '0')}
              </h2>
              <span className="text-xs tracking-widest uppercase font-medium text-[#faf6ec]/80">
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Response */}
        {preOrder.admin_response && (
          <Card className="border-[#c9a84c]/30 bg-[#faf6ec]">
            <CardHeader className="pb-3">
              <CardTitle className="editorial-title text-xl text-[#064e3b] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#c9a84c]" />
                Mensagem do Estabelecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#064e3b] italic font-sans-editorial">{preOrder.admin_response}</p>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <Card className="bg-[#faf6ec]/70 border-[#064e3b]/10">
            <CardHeader className="pb-3">
              <CardTitle className="editorial-title text-2xl text-[#064e3b]">Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {STATUS_ORDER.slice(0, 3).map((status, index) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border',
                          isCompleted ? 'bg-[#064e3b] text-[#faf6ec] border-[#c9a84c]' : 'bg-[#faf6ec] text-[#064e3b]/30 border-[#064e3b]/10'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={cn(
                          'font-sans-editorial',
                          isCurrent ? 'editorial-title text-lg text-[#064e3b]' : 'text-sm text-[#064e3b]/50'
                        )}
                      >
                        {config.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto editorial-label text-[#c9a84c]">Atual</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pickup Info */}
        <Card className="bg-[#faf6ec]/70 border-[#064e3b]/10">
          <CardHeader className="pb-3">
            <CardTitle className="editorial-title text-2xl text-[#064e3b] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#c9a84c]" />
              Retirada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#064e3b] font-sans-editorial">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#c9a84c]" />
              <span>
                {format(new Date(preOrder.pickup_date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}{' '}
                às {preOrder.pickup_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#c9a84c]" />
              <span>{preOrder.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#c9a84c]" />
              <span>{preOrder.customer_phone}</span>
            </div>
            {paymentConfig && (
              <div className="flex items-center gap-2">
                <PaymentIcon className="h-4 w-4 text-[#c9a84c]" />
                <span>Pagamento: {paymentConfig.label}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-[#faf6ec]/70 border-[#064e3b]/10">
          <CardHeader className="pb-3">
            <CardTitle className="editorial-title text-2xl text-[#064e3b]">Itens da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {preOrder.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm font-sans-editorial">
                <span className="text-[#064e3b]/70">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-[#064e3b] font-medium">{formatPrice(Number(item.unit_price) * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-[#064e3b]/10 pt-3 mt-2 flex justify-between items-baseline">
              <span className="editorial-label text-[#064e3b]/60">Total</span>
              <span className="editorial-title text-3xl text-[#c9a84c]">{formatPrice(Number(preOrder.total_amount))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Observations */}
        {preOrder.observations && (
          <Card className="bg-[#faf6ec]/70 border-[#064e3b]/10">
            <CardHeader className="pb-3">
              <CardTitle className="editorial-title text-2xl text-[#064e3b]">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#064e3b]/70 font-sans-editorial italic">{preOrder.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Share Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 border-[#064e3b]/20 text-[#064e3b] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] tracking-widest uppercase text-xs"
          onClick={handleShareWhatsApp}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Compartilhar via WhatsApp
        </Button>
      </div>
    </ClientLayout>
  );
}
