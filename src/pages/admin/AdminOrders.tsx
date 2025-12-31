import { ChefHat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe os pedidos da cozinha</p>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-red-500/10 w-fit">
            <ChefHat className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="mt-4">Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Aqui você poderá acompanhar todos os pedidos em tempo real, atualizar status e gerenciar a produção da cozinha.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
