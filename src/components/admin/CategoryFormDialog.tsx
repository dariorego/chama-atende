import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { MenuCategory } from '@/hooks/useAdminCategories';
import { AvailabilityFields } from '@/components/admin/AvailabilityFields';
import { ALL_DAYS, normalizeTime } from '@/lib/availability';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Máximo 100 caracteres'),
  slug: z.string().min(1, 'Slug é obrigatório').max(100, 'Máximo 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
  display_order: z.coerce.number().int().min(1, 'Ordem mínima é 1'),
  is_active: z.boolean(),
  availability_enabled: z.boolean().default(false),
  available_days: z.array(z.number().int().min(0).max(6)).default(ALL_DAYS),
  available_from: z.string().nullable().default(null),
  available_to: z.string().nullable().default(null),
}).refine((data) => !data.availability_enabled || data.available_days.length > 0, {
  message: 'Selecione ao menos um dia da semana',
  path: ['available_days'],
});


export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: MenuCategory | null;
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
  suggestedOrder?: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading = false,
  suggestedOrder = 1,
}: CategoryFormDialogProps) {
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      display_order: 1,
      is_active: true,
      availability_enabled: false,
      available_days: ALL_DAYS,
      available_from: null,
      available_to: null,
    },
  });

  useEffect(() => {
    if (open) {
      const cat = category as (MenuCategory & {
        availability_enabled?: boolean | null;
        available_days?: number[] | null;
        available_from?: string | null;
        available_to?: string | null;
      }) | null | undefined;

      if (cat) {
        form.reset({
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? '',
          display_order: cat.display_order ?? 1,
          is_active: cat.is_active ?? true,
          availability_enabled: cat.availability_enabled ?? false,
          available_days: cat.available_days?.length ? cat.available_days : ALL_DAYS,
          available_from: normalizeTime(cat.available_from) || null,
          available_to: normalizeTime(cat.available_to) || null,
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          description: '',
          display_order: suggestedOrder,
          is_active: true,
          availability_enabled: false,
          available_days: ALL_DAYS,
          available_from: null,
          available_to: null,
        });
      }
    }
  }, [open, category, form, suggestedOrder]);

  const watchName = form.watch('name');

  useEffect(() => {
    if (!isEditing && watchName) {
      const slug = generateSlug(watchName);
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [watchName, isEditing, form]);

  const availabilityEnabled = form.watch('availability_enabled');
  const availableDays = form.watch('available_days');
  const availableFrom = form.watch('available_from');
  const availableTo = form.watch('available_to');

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({
      ...data,
      available_from: data.availability_enabled ? data.available_from || null : null,
      available_to: data.availability_enabled ? data.available_to || null : null,
      available_days: data.availability_enabled && data.available_days.length ? data.available_days : ALL_DAYS,
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
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
                    <Input placeholder="Ex: Pizzas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: pizzas" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único usado na URL
                  </FormDescription>
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
                      placeholder="Descrição opcional da categoria"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibição</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Status</FormLabel>
                    <div className="flex items-center gap-2 h-10">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AvailabilityFields
              enabled={availabilityEnabled}
              days={availableDays ?? ALL_DAYS}
              from={availableFrom ?? ''}
              to={availableTo ?? ''}
              scopeLabel="a categoria e seus itens"
              onEnabledChange={(v) => form.setValue('availability_enabled', v, { shouldValidate: true })}
              onDaysChange={(v) => form.setValue('available_days', v, { shouldValidate: true })}
              onFromChange={(v) => form.setValue('available_from', v || null)}
              onToChange={(v) => form.setValue('available_to', v || null)}
            />



            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
