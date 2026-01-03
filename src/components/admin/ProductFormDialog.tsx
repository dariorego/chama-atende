import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ImageUploadWithCrop } from '@/components/ui/image-upload-with-crop';
import { Loader2 } from 'lucide-react';
import type { MenuProduct } from '@/hooks/useAdminProducts';
import type { MenuCategory } from '@/hooks/useAdminCategories';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Máximo de 100 caracteres'),
  description: z.string().max(500, 'Máximo de 500 caracteres').optional().nullable(),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  promotional_price: z.coerce.number().positive().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_highlight: z.boolean().default(false),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
}).refine((data) => {
  if (data.promotional_price && data.promotional_price >= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Preço promocional deve ser menor que o preço normal',
  path: ['promotional_price'],
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: MenuProduct | null;
  categories: MenuCategory[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
  isLoading,
}: ProductFormDialogProps) {
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      price: 0,
      promotional_price: null,
      image_url: '',
      is_highlight: false,
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          description: product.description || '',
          category_id: product.category_id,
          price: Number(product.price),
          promotional_price: product.promotional_price ? Number(product.promotional_price) : null,
          image_url: product.image_url || '',
          is_highlight: product.is_highlight ?? false,
          is_active: product.is_active ?? true,
          display_order: product.display_order ?? 0,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          category_id: '',
          price: 0,
          promotional_price: null,
          image_url: '',
          is_highlight: false,
          is_active: true,
          display_order: 0,
        });
      }
    }
  }, [open, product, form]);

  const handleSubmit = async (data: ProductFormData) => {
    // Clean up empty strings to null
    const cleanData = {
      ...data,
      description: data.description || null,
      image_url: data.image_url || null,
      promotional_price: data.promotional_price || null,
    };
    await onSubmit(cleanData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do produto'
              : 'Preencha as informações para criar um novo produto'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pizza Margherita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do produto..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promotional_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? null : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Produto</FormLabel>
                  <FormControl>
                    <ImageUploadWithCrop
                      value={field.value}
                      onChange={field.onChange}
                      folder="produtos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Exibição</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Produtos com menor número aparecem primeiro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_highlight"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Destaque
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Ativo
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
