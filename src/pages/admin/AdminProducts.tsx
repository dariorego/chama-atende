import { useState, useMemo, useEffect } from 'react';
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
import { UtensilsCrossed, Plus, Search, Info, LayoutGrid, List, ChevronLeft, ChevronRight, Pencil, Trash2, Star, CameraOff, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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

type ViewMode = 'list' | 'card';
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function AdminProducts() {
  const { restaurant } = useAdminSettings();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [pageSize, setPageSize] = useState<number>(50);
  const [page, setPage] = useState<number>(1);

  const { data: products = [], isLoading: isLoadingProducts } = useAdminProducts({
    search: search || undefined,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const { data: categories = [] } = useAdminCategories();

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, categoryFilter, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIdx, startIdx + pageSize);
  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || 'Sem categoria';

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
      toast({ title: 'Produto excluído', description: 'O produto foi removido definitivamente.' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (product: MenuProduct, active: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, is_active: active });
      toast({ title: active ? 'Produto ativado' : 'Produto inativado', description: product.name });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar status.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
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

  const handleToggleShowOnDisplay = async (product: MenuProduct, show: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, show_on_display: show });
      toast({
        title: show ? 'Adicionado à vitrine' : 'Removido da vitrine',
        description: product.name,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar vitrine.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
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

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Visualização:</span>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list"><List className="h-4 w-4 mr-1" />Lista</TabsTrigger>
                  <TabsTrigger value="card"><LayoutGrid className="h-4 w-4 mr-1" />Card</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === 'list' ? (
            <ProductsTable
              products={paginatedProducts}
              categories={categories}
              isLoading={isLoadingProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteProduct.isPending}
              onReorder={handleReorder}
              isDragDisabled={isDragDisabled || currentPage !== 1 || products.length > pageSize}
              onToggleActive={handleToggleActive}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingProducts ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-md border bg-muted/40 animate-pulse" />
                ))
              ) : paginatedProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              ) : (
                paginatedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-square bg-muted shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CameraOff className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {product.is_highlight && (
                        <div className="absolute top-2 left-2 bg-background/90 rounded-full p-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3 flex flex-col gap-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          <Badge variant="outline" className="mt-1 text-xs">{getCategoryName(product.category_id)}</Badge>
                        </div>
                        <div className="text-right shrink-0">
                          {product.promotional_price ? (
                            <>
                              <div className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.price))}</div>
                              <div className="font-semibold text-green-600">{formatPrice(Number(product.promotional_price))}</div>
                            </>
                          ) : (
                            <div className="font-semibold">{formatPrice(Number(product.price))}</div>
                          )}
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Tv className="h-3.5 w-3.5" />
                          Vitrine
                          <Switch
                            checked={!!product.show_on_display}
                            onCheckedChange={(checked) => handleToggleShowOnDisplay(product, checked)}
                          />
                        </label>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {products.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIdx + 1}–{Math.min(startIdx + pageSize, products.length)} de {products.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Página {currentPage} de {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
