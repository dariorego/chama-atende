import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, User, Receipt, X } from "lucide-react";
import { TableSession, useCloseTableSession, useUpdateTableSession } from "@/hooks/useTableSessions";

interface TableSessionCardProps {
  session: TableSession;
}

const statusConfig = {
  open: { label: "Em Atendimento", variant: "default" as const, color: "bg-green-500" },
  bill_requested: { label: "Conta Solicitada", variant: "secondary" as const, color: "bg-amber-500" },
  closed: { label: "Finalizado", variant: "outline" as const, color: "bg-gray-400" },
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TableSessionCard({ session }: TableSessionCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const closeSession = useCloseTableSession();
  const updateSession = useUpdateTableSession();

  const statusInfo = statusConfig[session.status];
  const tableName = session.tables?.name 
    ? `Mesa ${session.tables.number} (${session.tables.name})`
    : `Mesa ${session.tables?.number}`;

  useEffect(() => {
    if (session.status === 'closed') {
      if (session.closed_at && session.opened_at) {
        const opened = new Date(session.opened_at).getTime();
        const closed = new Date(session.closed_at).getTime();
        setElapsed(Math.floor((closed - opened) / 1000));
      }
      return;
    }

    const openedAt = new Date(session.opened_at).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - openedAt) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session.opened_at, session.status, session.closed_at]);

  const handleRequestBill = () => {
    updateSession.mutate({
      id: session.id,
      status: 'bill_requested',
      bill_requested_at: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    closeSession.mutate({
      sessionId: session.id,
      tableId: session.table_id,
    });
  };

  return (
    <Card className={`border-l-4`} style={{ borderLeftColor: statusInfo.color.replace('bg-', '') }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{tableName}</span>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {session.customer_count} {session.customer_count === 1 ? 'pessoa' : 'pessoas'}
              </span>
              
              {session.waiters && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {session.waiters.name}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(elapsed)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'open' && (
              <Button size="sm" variant="secondary" onClick={handleRequestBill}>
                <Receipt className="h-4 w-4 mr-1" />
                Pedir Conta
              </Button>
            )}
            
            {session.status !== 'closed' && (
              <Button 
                size="sm" 
                variant={session.status === 'bill_requested' ? 'default' : 'outline'}
                onClick={handleClose}
                disabled={closeSession.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Encerrar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
