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
  pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Confirmada', icon: CheckCircle2, color: 'text-blue-500' },
  preparing: { label: 'Em Preparo', icon: ChefHat, color: 'text-orange-500' },
  ready: { label: 'Pronta', icon: Package, color: 'text-green-500' },
  delivered: { label: 'Entregue', icon: CheckCircle2, color: 'text-green-600' },
  cancelled: { label: 'Cancelada', icon: XCircle, color: 'text-destructive' },
};

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  pix: { label: 'PIX', icon: QrCode, color: 'text-green-500' },
  card: { label: 'Cartão', icon: CreditCard, color: 'text-blue-500' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

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
          <h2 className="text-xl font-semibold mb-2">Encomenda não encontrada</h2>
          <p className="text-muted-foreground">
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
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <StatusIcon className={cn('h-12 w-12 mx-auto mb-3', statusConfig.color)} />
              <h2 className="text-xl font-bold mb-1">
                Encomenda #{preOrder.order_number.toString().padStart(3, '0')}
              </h2>
              <span className={cn('text-sm font-medium', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Response */}
        {preOrder.admin_response && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Mensagem do Estabelecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{preOrder.admin_response}</p>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {STATUS_ORDER.slice(0, 4).map((status, index) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={cn(
                          'text-sm',
                          isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {config.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-primary">Atual</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pickup Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Retirada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(preOrder.pickup_date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}{' '}
                às {preOrder.pickup_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{preOrder.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{preOrder.customer_phone}</span>
            </div>
            {paymentConfig && (
              <div className="flex items-center gap-2">
                <PaymentIcon className={cn("h-4 w-4", paymentConfig.color)} />
                <span>Pagamento: {paymentConfig.label}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Itens da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {preOrder.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product_name}
                </span>
                <span>{formatPrice(Number(item.unit_price) * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(Number(preOrder.total_amount))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Observations */}
        {preOrder.observations && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{preOrder.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Share Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleShareWhatsApp}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Compartilhar via WhatsApp
        </Button>
      </div>
    </ClientLayout>
  );
}
