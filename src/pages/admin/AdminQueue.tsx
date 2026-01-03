import { Users, Clock, UserCheck, UserX, Bell, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueueEntryCard } from "@/components/admin/QueueEntryCard";
import { QueueFormDialog } from "@/components/admin/QueueFormDialog";
import {
  useWaitingQueue,
  useCalledQueue,
  useQueueHistory,
  useQueueStats,
  useUpdateQueueEntry,
  useCallNextInQueue,
} from "@/hooks/useAdminQueue";

const AdminQueue = () => {
  const { data: waitingEntries, isLoading: isLoadingWaiting } = useWaitingQueue();
  const { data: calledEntries, isLoading: isLoadingCalled } = useCalledQueue();
  const { data: historyEntries, isLoading: isLoadingHistory } = useQueueHistory();
  const stats = useQueueStats();
  const updateEntry = useUpdateQueueEntry();
  const callNext = useCallNextInQueue();

  const isLoading = isLoadingWaiting || isLoadingCalled || isLoadingHistory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Espera</h1>
          <p className="text-muted-foreground">Gerencie a fila de clientes aguardando</p>
        </div>
        <QueueFormDialog />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Na Fila</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waiting}</div>
            <p className="text-xs text-muted-foreground">
              {stats.called > 0 && `+${stats.called} chamados`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{stats.avgWaitTime || 0} min</div>
            <p className="text-xs text-muted-foreground">de espera</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendidos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seated}</div>
            <p className="text-xs text-muted-foreground">hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desistências</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled + stats.noShow}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cancelled} cancelados, {stats.noShow} no-show
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Aguardando
            </CardTitle>
            <CardDescription>
              {waitingEntries?.length || 0} {waitingEntries?.length === 1 ? "cliente" : "clientes"} na fila
            </CardDescription>
          </div>
          {waitingEntries && waitingEntries.length > 0 && (
            <Button
              onClick={() => callNext.mutate()}
              disabled={callNext.isPending}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Chamar Próximo
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingWaiting ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : waitingEntries && waitingEntries.length > 0 ? (
            waitingEntries.map((entry, index) => (
              <QueueEntryCard
                key={entry.id}
                entry={entry}
                position={index + 1}
                onCall={() => updateEntry.mutate({ id: entry.id, status: 'called' })}
                onCancel={() => updateEntry.mutate({ id: entry.id, status: 'cancelled' })}
                isLoading={updateEntry.isPending}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente na fila</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Called Queue */}
      {calledEntries && calledEntries.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Chamados
            </CardTitle>
            <CardDescription>
              Aguardando comparecer ao balcão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {calledEntries.map((entry) => (
              <QueueEntryCard
                key={entry.id}
                entry={entry}
                onSeat={() => updateEntry.mutate({ id: entry.id, status: 'seated' })}
                onNoShow={() => updateEntry.mutate({ id: entry.id, status: 'no_show' })}
                isLoading={updateEntry.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico do Dia
          </CardTitle>
          <CardDescription>
            Clientes atendidos e desistências de hoje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingHistory ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : historyEntries && historyEntries.length > 0 ? (
            historyEntries.slice(0, 10).map((entry) => (
              <QueueEntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum atendimento registrado hoje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQueue;
