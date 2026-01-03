import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, CheckCircle, Truck, XCircle, MapPin } from "lucide-react";
import type { Order } from "@/hooks/useAdminOrders";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  isUpdating?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  preparing: {
    label: "Preparando",
    icon: ChefHat,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  ready: {
    label: "Pronto",
    icon: CheckCircle,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  delivered: {
    label: "Entregue",
    icon: Truck,
    className: "bg-muted text-muted-foreground border-border",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function OrderCard({ order, onUpdateStatus, isUpdating }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  const getNextAction = () => {
    switch (order.status) {
      case "pending":
        return { label: "Iniciar Preparo", status: "preparing" };
      case "preparing":
        return { label: "Marcar Pronto", status: "ready" };
      case "ready":
        return { label: "Entregar", status: "delivered" };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">#{order.order_number}</span>
            <Badge variant="outline" className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(order.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
        {order.table_number && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            Mesa {order.table_number}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Line Items */}
        <div className="space-y-2">
          {order.line_items.map((item) => (
            <div key={item.id} className="bg-surface rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold">{item.quantity}x {item.item_name}</span>
                  {item.selections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selections.map((selection) => (
                        <Badge key={selection.id} variant="secondary" className="text-xs">
                          {selection.quantity > 1 && `${selection.quantity}x `}
                          {selection.option_name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.observations && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{item.observations}"
                    </p>
                  )}
                </div>
                {item.unit_price > 0 && (
                  <span className="text-sm text-muted-foreground">
                    R$ {(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Observations */}
        {order.observations && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
            <p className="text-sm text-yellow-400">
              <strong>Obs:</strong> {order.observations}
            </p>
          </div>
        )}

        {/* Total */}
        {order.total_amount > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-lg">R$ {order.total_amount.toFixed(2)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {nextAction && (
            <Button
              onClick={() => onUpdateStatus(order.id, nextAction.status)}
              disabled={isUpdating}
              className="flex-1"
            >
              {nextAction.label}
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
