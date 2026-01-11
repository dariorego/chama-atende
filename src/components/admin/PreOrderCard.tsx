import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface PreOrderCardProps {
  preOrder: PreOrder;
  onUpdateStatus: (params: { id: string; status: string }) => void;
  isUpdating?: boolean;
}

export function PreOrderCard({ preOrder, onUpdateStatus, isUpdating }: PreOrderCardProps) {
  const statusConfig = STATUS_CONFIG[preOrder.status] || STATUS_CONFIG.pending;
  
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
