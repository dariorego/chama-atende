import { useState } from "react";
import { Plus, Pencil, Trash2, Link2, Loader2, CameraOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import {
  useAdminOrderItems,
  useCreateOrderItem,
  useUpdateOrderItem,
  useDeleteOrderItem,
  type OrderItem,
} from "@/hooks/useAdminOrderItems";
import { OrderItemFormDialog } from "@/components/admin/OrderItemFormDialog";
import { ItemGroupsDialog } from "@/components/admin/ItemGroupsDialog";

const TAG_STYLES = {
  positive: "bg-primary/20 text-primary",
  neutral: "bg-blue-400/20 text-blue-300",
  warning: "bg-orange-400/20 text-orange-300",
};

export default function AdminOrderItems() {
  const { restaurant: settings } = useAdminSettings();
  const restaurantId = settings?.id;

  const { data: items, isLoading } = useAdminOrderItems(restaurantId);
  const createItem = useCreateOrderItem();
  const updateItem = useUpdateOrderItem();
  const deleteItem = useDeleteOrderItem();

  const [formOpen, setFormOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: OrderItem) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const handleManageGroups = (item: OrderItem) => {
    setSelectedItem(item);
    setGroupsOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedItem) {
      await updateItem.mutateAsync({ id: selectedItem.id, ...data });
    } else if (restaurantId) {
      await createItem.mutateAsync({ restaurant_id: restaurantId, ...data });
    }
    setFormOpen(false);
  };

  const handleToggleActive = async (item: OrderItem) => {
    await updateItem.mutateAsync({ id: item.id, is_active: !item.is_active });
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteItem.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens do Pedido</h1>
          <p className="text-muted-foreground">
            Cadastre os itens principais disponíveis para pedido
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {items?.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Nenhum item cadastrado</CardTitle>
            <CardDescription>
              Comece cadastrando os itens principais como Tapioca, Crepioca, Omelete, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => (
            <Card key={item.id} className={`bg-card ${!item.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <CameraOff className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.price > 0 && (
                        <p className="text-sm text-primary font-semibold">
                          R$ {item.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={() => handleToggleActive(item)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={TAG_STYLES[tag.type] || TAG_STYLES.neutral}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleManageGroups(item)}
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Combinações
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={selectedItem}
        onSubmit={handleSubmit}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      {selectedItem && (
        <ItemGroupsDialog
          open={groupsOpen}
          onOpenChange={setGroupsOpen}
          orderItem={selectedItem}
          restaurantId={restaurantId}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os vínculos com grupos de combinação
              serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
