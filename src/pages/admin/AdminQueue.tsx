import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminQueue = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fila de Espera</h1>
        <p className="text-muted-foreground">Gerencie a fila de clientes aguardando</p>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-purple-500/10 w-fit">
            <Users className="h-12 w-12 text-purple-500" />
          </div>
          <CardTitle className="mt-4">Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Aqui você poderá gerenciar a fila de espera, chamar clientes e acompanhar o tempo médio de espera.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQueue;
