import { Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminReservations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">Gerencie as reservas do restaurante</p>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-green-500/10 w-fit">
            <Calendar className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="mt-4">Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Aqui você poderá gerenciar todas as reservas, confirmar horários e visualizar o calendário de mesas.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReservations;
