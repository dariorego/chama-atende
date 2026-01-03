import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Star, CameraOff, GripVertical } from 'lucide-react';
import type { MenuProduct } from '@/hooks/useAdminProducts';
import type { MenuCategory } from '@/hooks/useAdminCategories';

interface ProductsTableProps {
  products: MenuProduct[];
  categories: MenuCategory[];
  isLoading?: boolean;
  onEdit: (product: MenuProduct) => void;
  onDelete: (product: MenuProduct) => void;
  isDeleting?: boolean;
  onReorder?: (products: MenuProduct[]) => void;
  isDragDisabled?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function calculateDiscount(price: number, promoPrice: number) {
  return Math.round(((price - promoPrice) / price) * 100);
}

interface SortableProductRowProps {
  product: MenuProduct;
  getCategoryName: (categoryId: string) => string;
  onEdit: (product: MenuProduct) => void;
  onDeleteClick: (product: MenuProduct) => void;
  isDragDisabled?: boolean;
}

function SortableProductRow({
  product,
  getCategoryName,
  onEdit,
  onDeleteClick,
  isDragDisabled,
}: SortableProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        {!isDragDisabled ? (
          <button
            className="cursor-grab touch-none p-1 hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <span className="text-muted-foreground text-sm">{product.display_order ?? '-'}</span>
        )}
      </TableCell>
      <TableCell>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
            <CameraOff className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{product.name}</span>
          {product.is_highlight && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.description}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-1">
          {product.promotional_price ? (
            <>
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(Number(product.price))}
              </div>
              <div className="font-medium text-green-600">
                {formatPrice(Number(product.promotional_price))}
                <Badge variant="secondary" className="ml-2 text-xs">
                  -{calculateDiscount(Number(product.price), Number(product.promotional_price))}%
                </Badge>
              </div>
            </>
          ) : (
            <div className="font-medium">
              {formatPrice(Number(product.price))}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={product.is_active ? 'default' : 'secondary'}>
          {product.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(product)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductsTable({
  products,
  categories,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
  onReorder,
  isDragDisabled,
}: ProductsTableProps) {
  const [deleteProduct, setDeleteProduct] = useState<MenuProduct | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  const handleConfirmDelete = () => {
    if (deleteProduct) {
      onDelete(deleteProduct);
      setDeleteProduct(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(products, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum produto encontrado
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Ordem</TableHead>
                <TableHead className="w-16">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={products.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {products.map((product) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    getCategoryName={getCategoryName}
                    onEdit={onEdit}
                    onDeleteClick={setDeleteProduct}
                    isDragDisabled={isDragDisabled}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </div>
      </DndContext>

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto "{deleteProduct?.name}" será desativado e não aparecerá mais no cardápio.
              Você pode reativá-lo a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
