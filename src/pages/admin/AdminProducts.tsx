import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtensilsCrossed, Plus, Search } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type MenuProduct,
} from '@/hooks/useAdminProducts';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default function AdminProducts() {
  const { restaurant } = useAdminSettings();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);

  const { data: products = [], isLoading: isLoadingProducts } = useAdminProducts({
    search: search || undefined,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter,
  });
  const { data: categories = [] } = useAdminCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleOpenCreate = () => { setEditingProduct(null); setIsDialogOpen(true); };
  const handleEdit = (product: MenuProduct) => { setEditingProduct(product); setIsDialogOpen(true); };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
        toast({ title: 'Produto atualizado', description: 'As alterações foram salvas.' });
      } else {
        await createProduct.mutateAsync({ ...data, restaurant_id: restaurant?.id });
        toast({ title: 'Produto criado', description: 'O produto foi adicionado.' });
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Erro ao salvar.', variant: 'destructive' });
      throw error;
    }
  };

  const handleDelete = async (product: MenuProduct) => {
    try {
      await deleteProduct.mutateAsync({ id: product.id });
      toast({ title: 'Produto desativado', description: 'O produto foi removido.' });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Erro ao desativar.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
        </div>
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Novo Produto</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UtensilsCrossed className="h-5 w-5" />Lista de Produtos</CardTitle>
          <CardDescription>{products.length} produto{products.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <TabsList><TabsTrigger value="all">Todos</TabsTrigger><TabsTrigger value="active">Ativos</TabsTrigger><TabsTrigger value="inactive">Inativos</TabsTrigger></TabsList>
            </Tabs>
          </div>
          <ProductsTable products={products} categories={categories} isLoading={isLoadingProducts} onEdit={handleEdit} onDelete={handleDelete} isDeleting={deleteProduct.isPending} />
        </CardContent>
      </Card>
      <ProductFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={editingProduct} categories={categories} onSubmit={handleSubmit} isLoading={createProduct.isPending || updateProduct.isPending} />
    </div>
  );
}
