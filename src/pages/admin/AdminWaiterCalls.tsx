import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminWaiterCalls = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chamar Atendente</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de atendimento dos clientes</p>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-blue-500/10 w-fit">
            <Bell className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="mt-4">Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Aqui você poderá ver e gerenciar todas as solicitações de atendimento dos clientes em tempo real.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWaiterCalls;
