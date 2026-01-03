import { useState } from "react";
import { Plus, Pencil, Trash2, Users, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAdminTables, useDeleteTable, Table as TableType } from "@/hooks/useAdminTables";
import { TableFormDialog } from "@/components/admin/TableFormDialog";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  available: { label: "Disponível", variant: "default" as const, color: "bg-green-500" },
  occupied: { label: "Ocupada", variant: "secondary" as const, color: "bg-amber-500" },
  reserved: { label: "Reservada", variant: "outline" as const, color: "bg-blue-500" },
  inactive: { label: "Inativa", variant: "outline" as const, color: "bg-gray-400" },
};

const AdminTables = () => {
  const { data: tables, isLoading } = useAdminTables();
  const deleteTable = useDeleteTable();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<TableType | null>(null);

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTable(null);
    setDialogOpen(true);
  };

  const handleShowQR = (table: TableType) => {
    setSelectedTableForQR(table);
    setQrDialogOpen(true);
  };

  const stats = {
    total: tables?.length || 0,
    available: tables?.filter(t => t.status === 'available').length || 0,
    occupied: tables?.filter(t => t.status === 'occupied').length || 0,
    reserved: tables?.filter(t => t.status === 'reserved').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mesas</h1>
          <p className="text-muted-foreground">Gerencie as mesas do estabelecimento</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Mesa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupadas</CardTitle>
            <div className="h-3 w-3 rounded-full bg-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservadas</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reserved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Mesas</CardTitle>
          <CardDescription>Visualização rápida do status das mesas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {tables?.map((table) => {
                const status = statusConfig[table.status];
                return (
                  <button
                    key={table.id}
                    onClick={() => handleEdit(table)}
                    className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      table.status === 'available' ? 'border-green-500 bg-green-500/10' :
                      table.status === 'occupied' ? 'border-amber-500 bg-amber-500/10' :
                      table.status === 'reserved' ? 'border-blue-500 bg-blue-500/10' :
                      'border-gray-300 bg-gray-100 opacity-50'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowQR(table);
                      }}
                      className="absolute top-1 right-1 p-1 rounded hover:bg-black/10 transition-colors"
                      title="Ver QR Code"
                    >
                      <QrCode className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <div className="text-lg font-bold">{table.number.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity}
                    </div>
                    {table.name && (
                      <div className="text-xs truncate mt-1">{table.name}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Mesas</CardTitle>
          <CardDescription>Gerencie todas as mesas cadastradas</CardDescription>
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
                  <TableHead>Número</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables?.map((table) => {
                  const status = statusConfig[table.status];
                  return (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">
                        Mesa {table.number.toString().padStart(2, '0')}
                      </TableCell>
                      <TableCell>{table.name || "-"}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {table.capacity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={table.is_active ? "default" : "outline"}>
                          {table.is_active ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleShowQR(table)} title="QR Code">
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(table)}>
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
                                <AlertDialogTitle>Excluir mesa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a mesa {table.number}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTable.mutate(table.id)}
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TableFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        table={editingTable}
      />

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        table={selectedTableForQR}
      />
    </div>
  );
};

export default AdminTables;
