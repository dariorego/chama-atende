import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie a equipe do restaurante
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            Adicione ou remova usuários
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
