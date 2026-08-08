import { useMemo } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { MenuCategory } from '@/hooks/useAdminCategories';

interface CategoriesTableProps {
  categories: MenuCategory[] | undefined;
  isLoading: boolean;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  onReorder?: (reorderedCategories: MenuCategory[]) => void;
  isDragDisabled?: boolean;
  onToggleActive?: (category: MenuCategory, isActive: boolean) => void;
}

interface SortableRowProps {
  category: MenuCategory;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  isDragDisabled: boolean;
  onToggleActive?: (category: MenuCategory, isActive: boolean) => void;
}

function SortableRow({ category, onEdit, onDelete, isDragDisabled, onToggleActive }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${!category.is_active ? 'opacity-60' : ''} ${isDragging ? 'bg-muted shadow-lg' : ''}`}
    >
      <TableCell>
        <button
          {...attributes}
          {...listeners}
          className={`touch-none ${isDragDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
          disabled={isDragDisabled}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="max-w-[200px] truncate text-muted-foreground">
        {category.description || '-'}
      </TableCell>
      <TableCell className="text-center">
        {category.display_order ?? 0}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Switch
            checked={!!category.is_active}
            onCheckedChange={(checked) => onToggleActive?.(category, checked)}
            aria-label={category.is_active ? 'Desativar categoria' : 'Ativar categoria'}
          />
          <span className="text-xs text-muted-foreground w-[46px] text-left">
            {category.is_active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onReorder,
  isDragDisabled = false,
  onToggleActive,
}: CategoriesTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categoryIds = useMemo(
    () => categories?.map((c) => c.id) ?? [],
    [categories]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !categories || !onReorder) return;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const reordered = arrayMove(categories, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma categoria encontrada
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-center">Ordem</TableHead>
            <TableHead className="text-center">Ativa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
          <TableBody>
            {categories.map((category) => (
              <SortableRow
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                isDragDisabled={isDragDisabled}
                onToggleActive={onToggleActive}
              />
            ))}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}
