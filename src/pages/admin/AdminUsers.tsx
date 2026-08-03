import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Loader2, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminUsers, type AdminUser } from '@/hooks/useAdminUsers';
import { useTenant } from '@/hooks/useTenant';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { PERMISSION_MODULE_LABELS } from '@/lib/adminSections';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  manager: 'Gerente',
  staff: 'Equipe',
};

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'default',
  manager: 'secondary',
  staff: 'outline',
};

export default function AdminUsers() {
  const { users, isLoading, refetch } = useAdminUsers();
  const { tenantId } = useTenant();
  const { isTenantAdmin } = useAdminPermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setDialogOpen(true);
  };

  const handleRemove = async (user: AdminUser) => {
    if (!tenantId) return;
    if (!window.confirm(`Remover o acesso de ${user.full_name || user.email}?`)) return;

    setRemovingId(user.id);
    const { data, error } = await supabase.functions.invoke('manage-tenant-user', {
      body: { action: 'remove', restaurant_id: tenantId, user_id: user.id },
    });
    setRemovingId(null);

    const payload = data as { success?: boolean; error?: string } | null;
    if (error || !payload?.success) {
      toast.error(payload?.error || error?.message || 'Erro ao remover acesso');
      return;
    }
    toast.success('Acesso removido');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie a equipe e os módulos que cada pessoa pode acessar
          </p>
        </div>
        {isTenantAdmin && (
          <Button onClick={openNew}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo usuário
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            Lista de usuários com acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Status</TableHead>
                  {isTenantAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(user.full_name || user.email).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || 'Sem nome'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={ROLE_VARIANTS[role] || 'outline'}>
                            {ROLE_LABELS[role] || role}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <Badge variant="outline">Sem cargo</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.tenantRole === 'owner' || user.tenantRole === 'admin' ? (
                        <span className="text-sm text-muted-foreground">Todos os módulos</span>
                      ) : user.modules.length > 0 ? (
                        <div className="flex gap-1 flex-wrap max-w-xs">
                          {user.modules.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">
                              {PERMISSION_MODULE_LABELS[m] || m}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nenhum módulo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    {isTenantAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(user)}
                            disabled={user.tenantRole === 'owner'}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(user)}
                            disabled={user.tenantRole === 'owner' || removingId === user.id}
                          >
                            {removingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário encontrado.
            </p>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSaved={refetch}
      />
    </div>
  );
}
