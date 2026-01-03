import { Bell, Receipt, Users, User, Clock, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingServiceCalls, useAdminServiceCalls } from "@/hooks/useAdminServiceCalls";
import { useAdminWaiters } from "@/hooks/useAdminWaiters";
import { useAdminTables } from "@/hooks/useAdminTables";
import { useTableSessions } from "@/hooks/useTableSessions";
import { ServiceCallCard } from "@/components/admin/ServiceCallCard";
import { TableSessionCard } from "@/components/admin/TableSessionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const AdminWaiterCalls = () => {
  const { data: pendingCalls, isLoading: loadingCalls } = usePendingServiceCalls();
  const { data: allCalls } = useAdminServiceCalls();
  const { data: waiters, isLoading: loadingWaiters } = useAdminWaiters();
  const { data: tables, isLoading: loadingTables } = useAdminTables();
  const { data: sessions, isLoading: loadingSessions } = useTableSessions();

  const stats = {
    pendingCalls: pendingCalls?.length || 0,
    availableWaiters: waiters?.filter(w => w.is_active && w.is_available).length || 0,
    totalWaiters: waiters?.filter(w => w.is_active).length || 0,
    occupiedTables: tables?.filter(t => t.status === 'occupied').length || 0,
    totalTables: tables?.filter(t => t.is_active).length || 0,
    activeSessions: sessions?.length || 0,
  };

  const statusConfig = {
    available: "bg-green-500",
    occupied: "bg-amber-500",
    reserved: "bg-blue-500",
    inactive: "bg-gray-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atendimentos</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de atendimento em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={pendingCalls && pendingCalls.length > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados</CardTitle>
            <Bell className={`h-4 w-4 ${pendingCalls && pendingCalls.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingCalls && pendingCalls.length > 0 ? 'text-destructive' : ''}`}>
              {stats.pendingCalls}
            </div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendentes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.availableWaiters}/{stats.totalWaiters}
            </div>
            <p className="text-xs text-muted-foreground">disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.occupiedTables}/{stats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">ocupadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calls" className="relative">
            Chamados
            {stats.pendingCalls > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {stats.pendingCalls}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sessions">Atendimentos Ativos</TabsTrigger>
          <TabsTrigger value="tables">Mapa de Mesas</TabsTrigger>
          <TabsTrigger value="waiters">Atendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chamados Pendentes</CardTitle>
              <CardDescription>Solicitações aguardando atendimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingCalls ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : pendingCalls && pendingCalls.length > 0 ? (
                pendingCalls.map((call) => (
                  <ServiceCallCard key={call.id} call={call} waiters={waiters} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum chamado pendente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {allCalls && allCalls.filter(c => c.status === 'completed').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico Recente</CardTitle>
                <CardDescription>Últimos chamados finalizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {allCalls
                  .filter(c => c.status === 'completed')
                  .slice(0, 5)
                  .map((call) => (
                    <ServiceCallCard key={call.id} call={call} />
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos em Andamento</CardTitle>
              <CardDescription>Mesas com clientes sendo atendidos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingSessions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableSessionCard key={session.id} session={session} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum atendimento ativo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Mesas</CardTitle>
              <CardDescription>Visão geral do salão</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTables ? (
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {tables?.filter(t => t.is_active).map((table) => {
                      const hasPendingCall = pendingCalls?.some(c => c.table_id === table.id);
                      return (
                        <div
                          key={table.id}
                          className={`relative p-3 rounded-lg border-2 transition-all ${
                            hasPendingCall ? 'border-destructive bg-destructive/10 animate-pulse' :
                            table.status === 'available' ? 'border-green-500 bg-green-500/10' :
                            table.status === 'occupied' ? 'border-amber-500 bg-amber-500/10' :
                            table.status === 'reserved' ? 'border-blue-500 bg-blue-500/10' :
                            'border-gray-300 bg-gray-100'
                          }`}
                        >
                          {hasPendingCall && (
                            <Bell className="absolute -top-1 -right-1 h-4 w-4 text-destructive" />
                          )}
                          <div className="text-lg font-bold">{table.number.toString().padStart(2, '0')}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {table.capacity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span>Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span>Ocupada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span>Reservada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                      <span>Chamando</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiters">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Atendentes</CardTitle>
              <CardDescription>Disponibilidade da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWaiters ? (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {waiters?.filter(w => w.is_active).map((waiter) => (
                    <div
                      key={waiter.id}
                      className={`p-4 rounded-lg border-2 ${
                        waiter.is_available 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-amber-500 bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${waiter.is_available ? 'bg-green-500' : 'bg-amber-500'}`}>
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{waiter.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {waiter.is_available ? 'Disponível' : 'Ocupado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWaiterCalls;
