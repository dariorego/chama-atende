import { useState, useMemo } from 'react';
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
import { UtensilsCrossed, Plus, Search, Info } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustProductOrder,
  useReorderProducts,
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
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const { data: categories = [] } = useAdminCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustProductOrder = useAdjustProductOrder();
  const reorderProducts = useReorderProducts();

  // Calculate next order for new products in selected category
  const getNextOrderForCategory = (categoryId: string) => {
    const categoryProducts = products.filter((p) => p.category_id === categoryId);
    if (categoryProducts.length === 0) return 1;
    const maxOrder = Math.max(...categoryProducts.map((p) => p.display_order ?? 0));
    return maxOrder + 1;
  };

  // Suggested order for the dialog (based on selected category or first category)
  const suggestedOrder = useMemo(() => {
    if (editingProduct) return undefined; // Don't suggest when editing
    const targetCategoryId = categoryFilter !== 'all' ? categoryFilter : categories[0]?.id;
    if (!targetCategoryId) return 1;
    return getNextOrderForCategory(targetCategoryId);
  }, [categoryFilter, categories, products, editingProduct]);

  // Check if drag-and-drop should be enabled
  const isDragDisabled = categoryFilter === 'all' || !!search || statusFilter !== 'all';

  const handleOpenCreate = () => { setEditingProduct(null); setIsDialogOpen(true); };
  const handleEdit = (product: MenuProduct) => { setEditingProduct(product); setIsDialogOpen(true); };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        // If order changed, adjust other products first
        const oldOrder = editingProduct.display_order ?? 0;
        const newOrder = data.display_order;
        
        if (newOrder !== oldOrder) {
          await adjustProductOrder.mutateAsync({
            productId: editingProduct.id,
            categoryId: editingProduct.category_id,
            newOrder,
            oldOrder,
            currentProducts: products,
          });
        }
        
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
        toast({ title: 'Produto atualizado', description: 'As alterações foram salvas.' });
      } else {
        // For new products, calculate the next order for the selected category
        const nextOrder = getNextOrderForCategory(data.category_id);
        await createProduct.mutateAsync({ 
          ...data, 
          restaurant_id: restaurant?.id,
          display_order: data.display_order || nextOrder,
        });
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desativar.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleReorder = async (reorderedProducts: MenuProduct[]) => {
    const updates = reorderedProducts.map((product, index) => ({
      id: product.id,
      display_order: index + 1, // Start from 1
    }));

    try {
      await reorderProducts.mutateAsync(updates);
      toast({ title: 'Ordem atualizada', description: 'A ordem dos produtos foi salva.' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reordenar.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
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
          
          {isDragDisabled && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <Info className="h-4 w-4" />
              <span>Selecione uma categoria específica para reordenar produtos por arraste</span>
            </div>
          )}
          
          <ProductsTable 
            products={products} 
            categories={categories} 
            isLoading={isLoadingProducts} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            isDeleting={deleteProduct.isPending}
            onReorder={handleReorder}
            isDragDisabled={isDragDisabled}
          />
        </CardContent>
      </Card>
      <ProductFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        product={editingProduct} 
        categories={categories} 
        onSubmit={handleSubmit} 
        isLoading={createProduct.isPending || updateProduct.isPending}
        suggestedOrder={suggestedOrder}
      />
    </div>
  );
}
