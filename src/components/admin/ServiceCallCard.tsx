import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Receipt, HelpCircle, Clock, User, Check, X, ChevronDown } from "lucide-react";
import { ServiceCall, useUpdateServiceCall } from "@/hooks/useAdminServiceCalls";
import { Waiter } from "@/hooks/useAdminWaiters";

interface ServiceCallCardProps {
  call: ServiceCall;
  waiters?: Waiter[];
  duplicateIds?: string[];
}

const callTypeConfig = {
  waiter: { icon: Bell, label: "Chamar Garçom", color: "bg-blue-500" },
  bill: { icon: Receipt, label: "Pedir Conta", color: "bg-amber-500" },
  help: { icon: HelpCircle, label: "Ajuda", color: "bg-purple-500" },
};

const statusConfig = {
  pending: { label: "Pendente", variant: "destructive" as const },
  acknowledged: { label: "Visto", variant: "secondary" as const },
  in_progress: { label: "Em Atendimento", variant: "default" as const },
  completed: { label: "Concluído", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "outline" as const },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function ServiceCallCard({ call, waiters, duplicateIds }: ServiceCallCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const updateCall = useUpdateServiceCall();
  const [showActions, setShowActions] = useState(false);

  const extraIds = (duplicateIds ?? []).filter((id) => id !== call.id);
  const totalCount = 1 + extraIds.length;

  const config = callTypeConfig[call.call_type];
  const statusInfo = statusConfig[call.status];
  const Icon = config.icon;

  useEffect(() => {
    if (call.status === 'completed' || call.status === 'cancelled') {
      if (call.response_time_seconds) {
        setElapsed(call.response_time_seconds);
      }
      return;
    }

    const calledAt = new Date(call.called_at).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - calledAt) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [call.called_at, call.status, call.response_time_seconds]);

  const handleAttend = () => {
    const now = new Date().toISOString();
    updateCall.mutate({
      id: call.id,
      status: 'completed',
      completed_at: now,
      acknowledged_at: call.acknowledged_at || now,
    });
    extraIds.forEach((id) =>
      updateCall.mutate({ id, status: 'completed', completed_at: now })
    );
    setShowActions(false);
  };

  const handleCancel = () => {
    updateCall.mutate({
      id: call.id,
      status: 'cancelled',
    });
    extraIds.forEach((id) => updateCall.mutate({ id, status: 'cancelled' }));
    setShowActions(false);
  };

  const isActive = ['pending', 'acknowledged', 'in_progress'].includes(call.status);
  const tableName = call.tables?.name 
    ? `Mesa ${call.tables.number} (${call.tables.name})`
    : `Mesa ${call.tables?.number}`;

  return (
    <Card
      className={`transition-all ${isActive ? 'border-l-4 cursor-pointer hover:bg-accent/40' : ''}`}
      style={{ borderLeftColor: isActive ? config.color.replace('bg-', '') : undefined }}
      onClick={isActive ? () => setShowActions((v) => !v) : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{tableName}</span>
                {call.customer_name && (
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    {call.customer_name}
                  </Badge>
                )}
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {totalCount > 1 && (
                  <Badge variant="secondary" title={`Cliente chamou ${totalCount} vezes antes do atendimento`}>
                    chamou {totalCount}×
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{config.label}</p>
              {call.waiters && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {call.waiters.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${isActive && elapsed > 180 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              <Clock className="h-4 w-4" />
              {formatDuration(elapsed)}
            </div>
            {isActive && (
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${showActions ? 'rotate-180' : ''}`}
              />
            )}
          </div>
        </div>

        {isActive && showActions && (
          <div className="mt-4 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={handleAttend} disabled={updateCall.isPending}>
              <Check className="h-4 w-4 mr-1" />
              Atender
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={updateCall.isPending}>
              <X className="h-4 w-4 mr-1" />
              Cancelar chamado
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
