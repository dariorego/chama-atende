import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { MenuCategory } from '@/hooks/useAdminCategories';

interface CategoriesTableProps {
  categories: MenuCategory[] | undefined;
  isLoading: boolean;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-center">Ordem</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow
            key={category.id}
            className={!category.is_active ? 'opacity-60' : ''}
          >
            <TableCell>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </TableCell>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="text-muted-foreground font-mono text-sm">
              {category.slug}
            </TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {category.description || '-'}
            </TableCell>
            <TableCell className="text-center">
              {category.display_order ?? 0}
            </TableCell>
            <TableCell className="text-center">
              {category.is_active ? (
                <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  Ativa
                </Badge>
              ) : (
                <Badge variant="secondary">Inativa</Badge>
              )}
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
                {category.is_active && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
