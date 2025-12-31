import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
        <p className="text-muted-foreground">
          Gerencie os itens do seu cardápio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Lista de Produtos
          </CardTitle>
          <CardDescription>
            Adicione, edite ou remova produtos do cardápio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Funcionalidade em desenvolvimento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
