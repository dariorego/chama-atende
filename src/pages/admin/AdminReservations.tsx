import { useState } from "react";
import { Calendar, Clock, Users, CalendarCheck, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReservationCard } from "@/components/admin/ReservationCard";
import { ReservationFormDialog } from "@/components/admin/ReservationFormDialog";
import {
  usePendingReservations,
  useConfirmedReservations,
  useTodayReservations,
  useReservationStats,
  useUpdateReservation,
} from "@/hooks/useAdminReservations";

const AdminReservations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: pendingReservations, isLoading: loadingPending } = usePendingReservations();
  const { data: confirmedReservations, isLoading: loadingConfirmed } = useConfirmedReservations();
  const { data: todayReservations, isLoading: loadingToday } = useTodayReservations();
  const stats = useReservationStats();
  const updateReservation = useUpdateReservation();

  const handleConfirm = (id: string) => {
    updateReservation.mutate({ id, status: 'confirmed' });
  };

  const handleReject = (id: string) => {
    updateReservation.mutate({ id, status: 'cancelled' });
  };

  const handleCompleted = (id: string) => {
    updateReservation.mutate({ id, status: 'completed' });
  };

  const handleNoShow = (id: string) => {
    updateReservation.mutate({ id, status: 'no_show' });
  };

  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Gerencie as reservas do restaurante</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CalendarCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {stats.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-warning text-warning-foreground">
                {stats.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
        </TabsList>

        {/* Pendentes */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aguardando Aprovação</CardTitle>
              <CardDescription>
                Reservas que precisam ser analisadas e confirmadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : pendingReservations?.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhuma reserva pendente</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {pendingReservations?.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        variant="pending"
                        onConfirm={() => handleConfirm(reservation.id)}
                        onReject={() => handleReject(reservation.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hoje */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reservas de Hoje</CardTitle>
              <CardDescription className="capitalize">{today}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingToday ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : todayReservations?.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhuma reserva para hoje</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {todayReservations?.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        variant="today"
                        onCompleted={() => handleCompleted(reservation.id)}
                        onNoShow={() => handleNoShow(reservation.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Próximas */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Reservas Confirmadas</CardTitle>
              <CardDescription>
                Reservas confirmadas para os próximos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConfirmed ? (
                <p className="text-muted-foreground text-center py-8">Carregando...</p>
              ) : confirmedReservations?.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhuma reserva confirmada</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {confirmedReservations?.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        variant="confirmed"
                        onCompleted={() => handleCompleted(reservation.id)}
                        onNoShow={() => handleNoShow(reservation.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReservationFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
};

export default AdminReservations;
