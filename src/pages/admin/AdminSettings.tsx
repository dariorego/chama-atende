import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, Loader2, Building2, Clock, Phone, Wifi } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { formatTime } from '@/types/restaurant';

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  subtitle: z.string().max(200).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  status: z.enum(['open', 'closed']),
  opening_time: z.string().optional().nullable(),
  closing_time: z.string().optional().nullable(),
  wifi_network: z.string().max(100).optional(),
  wifi_password: z.string().max(100).optional(),
  instagram: z.string().max(200).optional(),
  facebook: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { restaurant, isLoading, updateRestaurant, isUpdating } = useAdminSettings();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      subtitle: '',
      address: '',
      phone: '',
      email: '',
      status: 'closed',
      opening_time: '',
      closing_time: '',
      wifi_network: '',
      wifi_password: '',
      instagram: '',
      facebook: '',
      website: '',
    },
  });

  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name || '',
        subtitle: restaurant.subtitle || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        status: (restaurant.status as 'open' | 'closed') || 'closed',
        opening_time: formatTime(restaurant.opening_time) || '',
        closing_time: formatTime(restaurant.closing_time) || '',
        wifi_network: restaurant.wifi_info?.network || '',
        wifi_password: restaurant.wifi_info?.password || '',
        instagram: restaurant.social_links?.instagram || '',
        facebook: restaurant.social_links?.facebook || '',
        website: restaurant.social_links?.website || '',
      });
    }
  }, [restaurant, form]);

  const onSubmit = (data: SettingsFormData) => {
    updateRestaurant({
      name: data.name,
      subtitle: data.subtitle || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      status: data.status,
      opening_time: data.opening_time || null,
      closing_time: data.closing_time || null,
      wifi_info: {
        network: data.wifi_network || undefined,
        password: data.wifi_password || undefined,
      },
      social_links: {
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        website: data.website || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure as preferências do restaurante
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Nome e descrição do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Restaurante</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do restaurante" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Ex: Cozinha Natural & Bar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Horário de Funcionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>
                Defina o horário e status de operação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="opening_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abertura</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closing_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fechamento</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Atual</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="open" id="open" />
                          <Label htmlFor="open" className="text-green-600 font-medium">Aberto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="closed" id="closed" />
                          <Label htmlFor="closed" className="text-red-600 font-medium">Fechado</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5" />
                Contato
              </CardTitle>
              <CardDescription>
                Informações de contato e localização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="(11) 99999-9999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" value={field.value || ''} placeholder="contato@restaurante.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Rua das Flores, 123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* WiFi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="h-5 w-5" />
                WiFi
              </CardTitle>
              <CardDescription>
                Informações da rede WiFi para clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="wifi_network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Rede</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do WiFi" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wifi_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Senha do WiFi" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Redes Sociais
              </CardTitle>
              <CardDescription>
                Links para suas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://instagram.com/seurestaurante" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://facebook.com/seurestaurante" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://seurestaurante.com.br" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating} className="gap-2">
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
