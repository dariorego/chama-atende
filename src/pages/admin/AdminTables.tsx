import { useState } from "react";
import { Plus, Pencil, Trash2, Users, QrCode, LayoutGrid, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAdminTables, useDeleteTable, Table as TableType } from "@/hooks/useAdminTables";
import { TableFormDialog } from "@/components/admin/TableFormDialog";
import { QRCodeDialog } from "@/components/admin/QRCodeDialog";
import { BatchTableFormDialog } from "@/components/admin/BatchTableFormDialog";
import { TableFloorMap } from "@/components/admin/TableFloorMap";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantSettings } from "@/hooks/useAdminSettings";

const statusConfig = {
  available: { label: "Disponível", variant: "default" as const, color: "bg-green-500" },
  occupied: { label: "Ocupada", variant: "secondary" as const, color: "bg-amber-500" },
  reserved: { label: "Reservada", variant: "outline" as const, color: "bg-blue-500" },
  inactive: { label: "Inativa", variant: "outline" as const, color: "bg-gray-400" },
};

const AdminTables = () => {
  const { data: tables, isLoading } = useAdminTables();
  const { restaurant } = useTenantSettings();
  const deleteTable = useDeleteTable();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState<TableType | null>(null);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [defaultArea, setDefaultArea] = useState<string | undefined>(undefined);

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setDefaultArea(undefined);
    setDialogOpen(true);
  };

  const handleCreate = (area?: string) => {
    setEditingTable(null);
    setDefaultArea(area);
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBatchDialogOpen(true)}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Criar em Sequência
          </Button>
          <Button onClick={() => handleCreate()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Mesa
          </Button>
        </div>
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
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map"><Map className="h-4 w-4 mr-2" /> Mapa do Salão</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-2" /> Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Mapa do Salão</CardTitle>
              <CardDescription>
                Organize as mesas por área e arraste para reposicionar. Duplo clique edita a mesa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[560px] w-full" />
              ) : (
                <TableFloorMap
                  tables={tables || []}
                  onEdit={handleEdit}
                  onShowQR={handleShowQR}
                  onCreate={handleCreate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
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
                  <TableHead>Área</TableHead>
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
                      <TableCell>{table.area || "Salão"}</TableCell>
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
        </TabsContent>
      </Tabs>

      <TableFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        table={editingTable}
        defaultArea={defaultArea}
      />

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        table={selectedTableForQR}
        restaurantName={restaurant?.name}
        slug={restaurant?.slug}
      />

      <BatchTableFormDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
      />
    </div>
  );
};

export default AdminTables;
