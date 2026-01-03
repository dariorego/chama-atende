import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Receipt, HelpCircle, Clock, User, Check, X } from "lucide-react";
import { ServiceCall, useUpdateServiceCall } from "@/hooks/useAdminServiceCalls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Waiter } from "@/hooks/useAdminWaiters";

interface ServiceCallCardProps {
  call: ServiceCall;
  waiters?: Waiter[];
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

export function ServiceCallCard({ call, waiters }: ServiceCallCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const updateCall = useUpdateServiceCall();
  const [selectedWaiter, setSelectedWaiter] = useState<string>(call.waiter_id || "");

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

  const handleAcknowledge = () => {
    updateCall.mutate({
      id: call.id,
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
    });
  };

  const handleStartService = () => {
    updateCall.mutate({
      id: call.id,
      status: 'in_progress',
      waiter_id: selectedWaiter || null,
    });
  };

  const handleComplete = () => {
    updateCall.mutate({
      id: call.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  };

  const handleCancel = () => {
    updateCall.mutate({
      id: call.id,
      status: 'cancelled',
    });
  };

  const isActive = ['pending', 'acknowledged', 'in_progress'].includes(call.status);
  const tableName = call.tables?.name 
    ? `Mesa ${call.tables.number} (${call.tables.name})`
    : `Mesa ${call.tables?.number}`;

  return (
    <Card className={`transition-all ${isActive ? 'border-l-4' : ''}`} 
          style={{ borderLeftColor: isActive ? config.color.replace('bg-', '') : undefined }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{tableName}</span>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
          </div>
        </div>

        {isActive && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {waiters && waiters.length > 0 && call.status !== 'in_progress' && (
              <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Atendente" />
                </SelectTrigger>
                <SelectContent>
                  {waiters.filter(w => w.is_available).map((waiter) => (
                    <SelectItem key={waiter.id} value={waiter.id}>
                      {waiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {call.status === 'pending' && (
              <Button size="sm" variant="secondary" onClick={handleAcknowledge}>
                Visualizar
              </Button>
            )}
            
            {(call.status === 'pending' || call.status === 'acknowledged') && (
              <Button size="sm" onClick={handleStartService}>
                Atender
              </Button>
            )}

            {call.status === 'in_progress' && (
              <Button size="sm" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-1" />
                Concluir
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
