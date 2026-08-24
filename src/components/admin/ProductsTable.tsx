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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Star, CameraOff, GripVertical, ZoomIn } from 'lucide-react';
import { ImageZoomDialog } from '@/components/ui/image-zoom-dialog';
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
  onToggleActive?: (product: MenuProduct, active: boolean) => void;
  fallbackImageUrl?: string | null;
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
  position: number;
  onEdit: (product: MenuProduct) => void;
  onDeleteClick: (product: MenuProduct) => void;
  isDragDisabled?: boolean;
  onToggleActive?: (product: MenuProduct, active: boolean) => void;
  onZoom: (product: MenuProduct) => void;
  fallbackImageUrl?: string | null;
}

function SortableProductRow({
  product,
  position,
  onEdit,
  onDeleteClick,
  isDragDisabled,
  onToggleActive,
  onZoom,
  fallbackImageUrl,
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

  const imageSrc = product.image_url || fallbackImageUrl || null;

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
        ) : product.display_order != null ? (
          <span className="text-muted-foreground text-sm">{product.display_order}</span>
        ) : (
          <span
            className="text-muted-foreground/60 text-sm italic"
            title="Ordem provisória (alfabética)"
          >
            {position}
          </span>
        )}
      </TableCell>
      <TableCell>
        {imageSrc ? (
          <button
            type="button"
            onClick={() => onZoom(product)}
            className="group relative h-12 w-12 rounded-md overflow-hidden"
            aria-label={`Ampliar imagem de ${product.name}`}
          >
            <img
              src={imageSrc}
              alt={product.name}
              className={`h-12 w-12 rounded-md transition-transform group-hover:scale-110 ${product.image_url ? 'object-cover' : 'object-contain bg-muted p-1'}`}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-4 w-4 text-white" />
            </span>
          </button>
        ) : (
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
            <CameraOff className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.name}</span>
            {product.is_highlight && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          {formatAvailabilityLabel(product) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatAvailabilityLabel(product)}
            </span>
          )}
        </div>
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
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={!!product.is_active}
            onCheckedChange={(checked) => onToggleActive?.(product, checked)}
            aria-label="Ativar produto"
          />
          <Badge variant={product.is_active ? 'default' : 'secondary'}>
            {product.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
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
  onToggleActive,
  fallbackImageUrl,
}: ProductsTableProps) {
  const [deleteProduct, setDeleteProduct] = useState<MenuProduct | null>(null);
  const [zoomProduct, setZoomProduct] = useState<MenuProduct | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


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
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center w-40">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={products.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {products.map((product, index) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    position={index + 1}
                    onEdit={onEdit}
                    onDeleteClick={setDeleteProduct}
                    isDragDisabled={isDragDisabled}
                    onToggleActive={onToggleActive}
                    onZoom={setZoomProduct}
                    fallbackImageUrl={fallbackImageUrl}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </div>
      </DndContext>

      <ImageZoomDialog
        src={zoomProduct?.image_url || fallbackImageUrl || ''}
        alt={zoomProduct?.name || ''}
        open={!!zoomProduct}
        onOpenChange={(open) => !open && setZoomProduct(null)}
      />

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto "{deleteProduct?.name}" será excluído permanentemente do banco de dados.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
