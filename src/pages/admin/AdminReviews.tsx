import { Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminReviews = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
        <p className="text-muted-foreground">Veja o feedback dos clientes</p>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-yellow-500/10 w-fit">
            <Star className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="mt-4">Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Aqui você poderá ver todas as avaliações dos clientes, responder comentários e acompanhar métricas de satisfação.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
