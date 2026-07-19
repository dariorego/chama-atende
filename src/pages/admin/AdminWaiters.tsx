import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, User, CheckCircle, XCircle, Users, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAdminWaiters, useDeleteWaiter, useUpdateWaiter, useCreateWaiter, Waiter } from "@/hooks/useAdminWaiters";
import { WaiterFormDialog } from "@/components/admin/WaiterFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployees } from "@/hooks/useStaffSchedule";

const AdminWaiters = () => {
  const { data: waiters, isLoading } = useAdminWaiters();
  const { data: employees } = useEmployees();
  const deleteWaiter = useDeleteWaiter();
  const updateWaiter = useUpdateWaiter();
  const createWaiter = useCreateWaiter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importSelected, setImportSelected] = useState<Set<string>>(new Set());

  const unlinkedEmployees = useMemo(() => {
    const linked = new Set((waiters ?? []).map((w) => w.employee_id).filter(Boolean) as string[]);
    return (employees ?? []).filter((e) => e.is_active && !linked.has(e.id));
  }, [waiters, employees]);

  const toggleImportSelect = (id: string) => {
    setImportSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    const toCreate = unlinkedEmployees.filter((e) => importSelected.has(e.id));
    for (const emp of toCreate) {
      await createWaiter.mutateAsync({
        name: emp.full_name,
        is_available: true,
        is_active: true,
        user_id: null,
        employee_id: emp.id,
      });
    }
    setImportSelected(new Set());
    setImportOpen(false);
  };

  const handleEdit = (waiter: Waiter) => {
    setEditingWaiter(waiter);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingWaiter(null);
    setDialogOpen(true);
  };

  const toggleAvailability = (waiter: Waiter) => {
    updateWaiter.mutate({
      id: waiter.id,
      is_available: !waiter.is_available,
    });
  };

  const stats = {
    total: waiters?.filter(w => w.is_active).length || 0,
    available: waiters?.filter(w => w.is_active && w.is_available).length || 0,
    busy: waiters?.filter(w => w.is_active && !w.is_available).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendentes</h1>
          <p className="text-muted-foreground">Gerencie a equipe de atendimento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} disabled={unlinkedEmployees.length === 0}>
            <Users className="h-4 w-4 mr-2" />
            Importar da Agenda
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
            <XCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.busy}</div>
          </CardContent>
        </Card>
      </div>

      {/* Waiters Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : (
          waiters?.filter(w => w.is_active).map((waiter) => (
            <Card key={waiter.id} className={`transition-all ${waiter.is_available ? 'border-green-500/50' : 'border-amber-500/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${waiter.is_available ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                      <User className={`h-6 w-6 ${waiter.is_available ? 'text-green-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{waiter.name}</h3>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <Badge variant={waiter.is_available ? "default" : "secondary"}>
                          {waiter.is_available ? "Disponível" : "Ocupado"}
                        </Badge>
                        {waiter.employee ? (
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {waiter.employee.role || "Funcionário"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <Link2Off className="h-3 w-3" />
                            Sem vínculo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={waiter.is_available}
                      onCheckedChange={() => toggleAvailability(waiter)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(waiter)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Atendentes</CardTitle>
          <CardDescription>Lista completa da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waiters?.map((waiter) => (
                  <TableRow key={waiter.id} className={!waiter.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {waiter.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {waiter.employee ? (
                        <div className="text-sm">
                          <div>{waiter.employee.full_name}</div>
                          {waiter.employee.role && (
                            <div className="text-xs text-muted-foreground">{waiter.employee.role}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={waiter.is_available ? "default" : "secondary"}>
                        {waiter.is_available ? "Disponível" : "Ocupado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={waiter.is_active ? "default" : "outline"}>
                        {waiter.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(waiter)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir atendente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o atendente {waiter.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWaiter.mutate(waiter.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WaiterFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        waiter={editingWaiter}
      />
    </div>
  );
};

export default AdminWaiters;
