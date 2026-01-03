import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FolderTree, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type MenuCategory,
} from '@/hooks/useAdminCategories';
import { CategoryFormDialog, type CategoryFormData } from '@/components/admin/CategoryFormDialog';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function AdminCategories() {
  const { restaurant } = useAdminSettings();
  const restaurantId = restaurant?.id;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);

  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((category) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.is_active) ||
        (statusFilter === 'inactive' && !category.is_active);

      const matchesSearch =
        !searchQuery ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [categories, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category: MenuCategory) => {
    setDeletingCategory(category);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (!restaurantId) return;

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          display_order: data.display_order,
          is_active: data.is_active,
        });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          slug: data.slug,
          description: data.description,
          display_order: data.display_order,
          is_active: data.is_active,
          restaurant_id: restaurantId,
        });
        toast.success('Categoria criada com sucesso!');
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error('Erro ao salvar categoria');
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory.mutateAsync({
        id: deletingCategory.id,
      });
      toast.success('Categoria desativada com sucesso!');
      setDeletingCategory(null);
    } catch (error) {
      toast.error('Erro ao desativar categoria');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-muted-foreground">
            Organize os produtos em categorias
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Lista de Categorias
          </CardTitle>
          <CardDescription>
            Adicione, edite ou remova categorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="inactive">Inativas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <CategoriesTable
            categories={filteredCategories}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSubmit={handleFormSubmit}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria "{deletingCategory?.name}" será desativada e não
              aparecerá mais no cardápio público. Os produtos associados não
              serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
