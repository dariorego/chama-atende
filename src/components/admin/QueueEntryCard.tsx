import { Users, Clock, Phone, MessageSquare, UserCheck, UserX, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QueueEntry } from "@/hooks/useAdminQueue";

interface QueueEntryCardProps {
  entry: QueueEntry;
  position?: number;
  onCall?: () => void;
  onSeat?: () => void;
  onCancel?: () => void;
  onNoShow?: () => void;
  isLoading?: boolean;
}

const statusConfig = {
  waiting: { label: "Aguardando", className: "bg-warning/20 text-warning" },
  called: { label: "Chamado", className: "bg-primary/20 text-primary" },
  seated: { label: "Acomodado", className: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  no_show: { label: "Não compareceu", className: "bg-destructive/20 text-destructive" },
};

export function QueueEntryCard({
  entry,
  position,
  onCall,
  onSeat,
  onCancel,
  onNoShow,
  isLoading,
}: QueueEntryCardProps) {
  const statusInfo = statusConfig[entry.status];
  const isWaiting = entry.status === 'waiting';
  const isCalled = entry.status === 'called';

  const getTimeAgo = () => {
    if (isCalled && entry.called_at) {
      return `Chamado ${formatDistanceToNow(new Date(entry.called_at), { addSuffix: true, locale: ptBR })}`;
    }
    return `Entrou ${formatDistanceToNow(new Date(entry.joined_at), { addSuffix: true, locale: ptBR })}`;
  };

  const getCompletedTime = () => {
    if (entry.status === 'seated' && entry.seated_at) {
      return `Acomodado às ${new Date(entry.seated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if ((entry.status === 'cancelled' || entry.status === 'no_show') && entry.cancelled_at) {
      return `${entry.status === 'cancelled' ? 'Cancelado' : 'No-show'} às ${new Date(entry.cancelled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all",
        isCalled && "border-primary bg-primary/5",
        isWaiting && "border-border bg-card",
        !isWaiting && !isCalled && "border-border bg-muted/30"
      )}
    >
      {/* Position */}
      {position && (
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
            isWaiting ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          )}
        >
          {position}º
        </div>
      )}

      {/* Queue Code */}
      {!position && (
        <div className="w-16 h-12 rounded-lg bg-secondary flex items-center justify-center font-mono font-bold text-sm shrink-0">
          {entry.queue_code}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {position && (
            <span className="font-mono text-sm text-muted-foreground">
              {entry.queue_code}
            </span>
          )}
          <p className="font-semibold text-foreground truncate">
            {entry.customer_name}
          </p>
          <Badge variant="secondary" className={cn("text-xs", statusInfo.className)}>
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {entry.party_size} {entry.party_size === 1 ? "pessoa" : "pessoas"}
          </span>
          
          {entry.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {entry.phone}
            </span>
          )}
          
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {getCompletedTime() || getTimeAgo()}
          </span>
        </div>

        {entry.notes && (
          <div className="flex items-start gap-1 mt-2 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{entry.notes}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(isWaiting || isCalled) && (
        <div className="flex items-center gap-2 shrink-0">
          {isWaiting && (
            <>
              <Button
                size="sm"
                onClick={onCall}
                disabled={isLoading}
                className="gap-1"
              >
                <Bell className="h-4 w-4" />
                Chamar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="text-muted-foreground hover:text-destructive"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {isCalled && (
            <>
              <Button
                size="sm"
                onClick={onSeat}
                disabled={isLoading}
                className="gap-1"
              >
                <UserCheck className="h-4 w-4" />
                Acomodar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onNoShow}
                disabled={isLoading}
                className="text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                No-show
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
