import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Phone, Users, MessageSquare, Check, X, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Reservation } from "@/hooks/useAdminReservations";

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm?: () => void;
  onReject?: () => void;
  onCompleted?: () => void;
  onNoShow?: () => void;
  variant?: 'pending' | 'confirmed' | 'today' | 'history';
}

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-success/20 text-success border-success/30",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  completed: {
    label: "Compareceu",
    className: "bg-success/20 text-success border-success/30",
  },
  no_show: {
    label: "Não compareceu",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function ReservationCard({ 
  reservation, 
  onConfirm, 
  onReject, 
  onCompleted, 
  onNoShow,
  variant = 'pending' 
}: ReservationCardProps) {
  const status = statusConfig[reservation.status];
  const reservationDate = new Date(reservation.reservation_date + 'T12:00:00');
  const formattedDate = format(reservationDate, "dd/MM", { locale: ptBR });
  const formattedTime = reservation.reservation_time.slice(0, 5);
  const createdAt = format(new Date(reservation.created_at), "dd/MM 'às' HH:mm", { locale: ptBR });

  return (
    <Card className={cn(
      "transition-all",
      variant === 'pending' && "border-warning/30 bg-warning/5",
      variant === 'confirmed' && "border-success/30 bg-success/5",
      variant === 'today' && "border-primary/30 bg-primary/5",
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-primary">
                {reservation.reservation_code}
              </span>
              <Badge variant="outline" className={cn("text-xs", status.className)}>
                {status.label}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Solicitado em {createdAt}
            </span>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              {reservation.customer_name}
            </h3>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{reservation.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{reservation.party_size} pessoas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {reservation.notes && (
              <div className="flex items-start gap-1.5 text-sm">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">{reservation.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {variant === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  onClick={onConfirm}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={onReject}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
              </>
            )}
            
            {(variant === 'confirmed' || variant === 'today') && reservation.status === 'confirmed' && (
              <>
                <Button 
                  size="sm" 
                  onClick={onCompleted}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Compareceu
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onNoShow}
                  className="flex-1"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Não veio
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
