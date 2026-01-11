import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  XCircle,
  Calendar,
  User,
  Phone,
  MessageSquare,
  CreditCard,
  QrCode,
  Save,
  Loader2,
} from 'lucide-react';
import type { PreOrder } from '@/hooks/usePreOrders';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  pending: { label: 'Pendente', variant: 'secondary', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  confirmed: { label: 'Confirmada', variant: 'default', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  preparing: { label: 'Em Preparo', variant: 'default', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  ready: { label: 'Pronta', variant: 'default', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  delivered: { label: 'Entregue', variant: 'outline', color: 'bg-green-600/10 text-green-600 border-green-600/20' },
  cancelled: { label: 'Cancelada', variant: 'destructive', color: '' },
};

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  pix: { label: 'PIX', icon: QrCode, color: 'text-green-500' },
  card: { label: 'Cartão', icon: CreditCard, color: 'text-blue-500' },
};

interface PreOrderCardProps {
  preOrder: PreOrder;
  onUpdateStatus: (params: { id: string; status: string }) => void;
  onSaveResponse: (params: { id: string; adminResponse: string }) => void;
  isUpdating?: boolean;
  isSavingResponse?: boolean;
}

export function PreOrderCard({ 
  preOrder, 
  onUpdateStatus, 
  onSaveResponse,
  isUpdating,
  isSavingResponse 
}: PreOrderCardProps) {
  const [adminResponse, setAdminResponse] = useState(preOrder.admin_response || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const statusConfig = STATUS_CONFIG[preOrder.status] || STATUS_CONFIG.pending;
  const paymentConfig = preOrder.payment_method ? PAYMENT_METHOD_CONFIG[preOrder.payment_method] : null;
  const PaymentIcon = paymentConfig?.icon || CreditCard;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getNextStatus = () => {
    const statusFlow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
    };
    return statusFlow[preOrder.status];
  };

  const getNextStatusLabel = () => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmar',
      preparing: 'Iniciar Preparo',
      ready: 'Marcar como Pronta',
      delivered: 'Marcar como Entregue',
    };
    const next = getNextStatus();
    return next ? labels[next] : null;
  };

  const handleSaveResponse = () => {
    onSaveResponse({ id: preOrder.id, adminResponse });
    setIsEditing(false);
  };

  const nextStatus = getNextStatus();
  const nextStatusLabel = getNextStatusLabel();
  const isFinalStatus = preOrder.status === 'delivered' || preOrder.status === 'cancelled';

  const pickupDate = new Date(preOrder.pickup_date + 'T12:00:00');
  const formattedPickupDate = format(pickupDate, "dd/MM/yyyy", { locale: ptBR });
  const formattedPickupTime = preOrder.pickup_time.slice(0, 5);

  return (
    <Card className={cn(isFinalStatus && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">
                #{preOrder.order_number.toString().padStart(3, '0')}
              </span>
              <Badge className={cn('border', statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedPickupDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formattedPickupTime}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-primary">
              {formatPrice(Number(preOrder.total_amount))}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Customer Info */}
        <div className="space-y-1 text-sm">
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
        </div>

        {/* Items */}
        <div className="border-t pt-3 space-y-1">
          {preOrder.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.product_name}
              </span>
              <span>{formatPrice(Number(item.unit_price) * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Observations */}
        {preOrder.observations && (
          <div className="border-t pt-3">
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{preOrder.observations}</span>
            </div>
          </div>
        )}

        {/* Admin Response */}
        <div className="border-t pt-3 space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Resposta para o cliente
          </Label>
          {isEditing || !preOrder.admin_response ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Ex: Seu pedido estará pronto às 14h. Traga documento com foto para retirada."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="resize-none min-h-[80px] bg-surface border-border placeholder:text-surface-foreground"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveResponse}
                  disabled={isSavingResponse || !adminResponse.trim()}
                >
                  {isSavingResponse ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Salvar Resposta
                </Button>
                {preOrder.admin_response && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAdminResponse(preOrder.admin_response || '');
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="p-3 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <p className="text-sm">{preOrder.admin_response}</p>
              <p className="text-xs text-muted-foreground mt-1">Clique para editar</p>
            </div>
          )}
        </div>
      </CardContent>

      {!isFinalStatus && (
        <CardFooter className="gap-2 pt-0">
          {nextStatus && nextStatusLabel && (
            <Button
              className="flex-1"
              onClick={() => onUpdateStatus({ id: preOrder.id, status: nextStatus })}
              disabled={isUpdating}
            >
              {nextStatusLabel}
            </Button>
          )}
          {preOrder.status !== 'cancelled' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onUpdateStatus({ id: preOrder.id, status: 'cancelled' })}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
