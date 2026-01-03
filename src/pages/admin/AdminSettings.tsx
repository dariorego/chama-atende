import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, Loader2, Building2, Clock, Phone, Wifi, Palette, ImageIcon, RotateCcw, ClipboardList, Bed, Smartphone, Volume2, VolumeX, TableProperties } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { formatTime, IdentificationType } from '@/types/restaurant';
import { ImageUploadWithCrop } from '@/components/ui/image-upload-with-crop';
import { hexToHsl, hslToHex, DEFAULT_COLORS } from '@/lib/color-utils';
import { useNotificationSound } from '@/hooks/useNotificationSound';

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  subtitle: z.string().max(200).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  status: z.enum(['open', 'closed']),
  opening_time: z.string().optional().nullable(),
  closing_time: z.string().optional().nullable(),
  identification_type: z.enum(['table', 'room', 'phone']),
  wifi_network: z.string().max(100).optional(),
  wifi_password: z.string().max(100).optional(),
  instagram: z.string().max(200).optional(),
  facebook: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { restaurant, isLoading, updateRestaurant, isUpdating } = useAdminSettings();
  const { playTestSound } = useNotificationSound();
  
  // Image states
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  
  // Color states
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLORS.primary!);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_COLORS.background!);
  const [cardColor, setCardColor] = useState(DEFAULT_COLORS.card!);
  
  // Notification states
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      identification_type: 'table',
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
        identification_type: restaurant.identification_type || 'table',
        wifi_network: restaurant.wifi_info?.network || '',
        wifi_password: restaurant.wifi_info?.password || '',
        instagram: restaurant.social_links?.instagram || '',
        facebook: restaurant.social_links?.facebook || '',
        website: restaurant.social_links?.website || '',
      });
      
      // Load images
      setLogoUrl(restaurant.logo_url);
      setCoverUrl(restaurant.cover_image_url);
      
      // Load colors
      if (restaurant.theme_colors) {
        setPrimaryColor(restaurant.theme_colors.primary || DEFAULT_COLORS.primary!);
        setBackgroundColor(restaurant.theme_colors.background || DEFAULT_COLORS.background!);
        setCardColor(restaurant.theme_colors.card || DEFAULT_COLORS.card!);
      }
      
      // Load notification settings
      if (restaurant.notification_settings) {
        setSoundEnabled(restaurant.notification_settings.sound_enabled ?? true);
      }
    }
  }, [restaurant, form]);

  const resetToDefaultColors = () => {
    setPrimaryColor(DEFAULT_COLORS.primary!);
    setBackgroundColor(DEFAULT_COLORS.background!);
    setCardColor(DEFAULT_COLORS.card!);
  };

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
      identification_type: data.identification_type as IdentificationType,
      logo_url: logoUrl,
      cover_image_url: coverUrl,
      wifi_info: {
        network: data.wifi_network || undefined,
        password: data.wifi_password || undefined,
      },
      social_links: {
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        website: data.website || undefined,
      },
      theme_colors: {
        primary: primaryColor,
        background: backgroundColor,
        card: cardColor,
        accent: primaryColor,
      },
      notification_settings: {
        sound_enabled: soundEnabled,
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

          {/* Identidade Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Logo e imagem de capa do restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo do Restaurante</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Formato quadrado recomendado
                  </p>
                  <ImageUploadWithCrop
                    value={logoUrl}
                    onChange={setLogoUrl}
                    folder="logos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Exibida no topo do site
                  </p>
                  <ImageUploadWithCrop
                    value={coverUrl}
                    onChange={setCoverUrl}
                    folder="covers"
                  />
                </div>
              </div>
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

          {/* Configurações de Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                Configurações de Pedido
              </CardTitle>
              <CardDescription>
                Configure como os clientes se identificam ao fazer pedidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="identification_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Identificação</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="table" id="id-table" />
                          <Label htmlFor="id-table" className="flex items-center gap-2 cursor-pointer">
                            <TableProperties className="h-4 w-4" />
                            Mesa
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="room" id="id-room" />
                          <Label htmlFor="id-room" className="flex items-center gap-2 cursor-pointer">
                            <Bed className="h-4 w-4" />
                            Quarto
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="id-phone" />
                          <Label htmlFor="id-phone" className="flex items-center gap-2 cursor-pointer">
                            <Smartphone className="h-4 w-4" />
                            Telefone Celular
                          </Label>
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

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure alertas sonoros para novas solicitações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sinal Sonoro</Label>
                  <p className="text-sm text-muted-foreground">
                    Tocar som ao receber solicitações de atendimento ou conta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-primary" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playTestSound}
                disabled={!soundEnabled}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Testar Som
              </Button>
            </CardContent>
          </Card>

          {/* Configurações de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                Configurações de Cores
              </CardTitle>
              <CardDescription>
                Personalize as cores do seu site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cor Principal */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                />
                <div className="flex-1 min-w-0">
                  <Label>Cor Principal</Label>
                  <p className="text-sm text-muted-foreground">
                    Botões, links e destaques
                  </p>
                </div>
                <Input 
                  type="color" 
                  value={hslToHex(primaryColor)}
                  onChange={(e) => setPrimaryColor(hexToHsl(e.target.value))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
              </div>

              {/* Cor de Fundo */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: `hsl(${backgroundColor})` }}
                />
                <div className="flex-1 min-w-0">
                  <Label>Cor de Fundo</Label>
                  <p className="text-sm text-muted-foreground">
                    Fundo geral do site
                  </p>
                </div>
                <Input 
                  type="color" 
                  value={hslToHex(backgroundColor)}
                  onChange={(e) => setBackgroundColor(hexToHsl(e.target.value))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
              </div>

              {/* Cor dos Cards */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: `hsl(${cardColor})` }}
                />
                <div className="flex-1 min-w-0">
                  <Label>Cor dos Cards</Label>
                  <p className="text-sm text-muted-foreground">
                    Caixas e painéis
                  </p>
                </div>
                <Input 
                  type="color" 
                  value={hslToHex(cardColor)}
                  onChange={(e) => setCardColor(hexToHsl(e.target.value))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
              </div>

              {/* Botão para resetar cores padrão */}
              <Button type="button" variant="outline" onClick={resetToDefaultColors}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar cores padrão
              </Button>

              {/* Preview em tempo real */}
              <div 
                className="p-4 rounded-lg border border-border"
                style={{ backgroundColor: `hsl(${backgroundColor})` }}
              >
                <p className="text-sm mb-3 text-foreground">Preview:</p>
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `hsl(${cardColor})` }}
                >
                  <Button 
                    type="button"
                    style={{ backgroundColor: `hsl(${primaryColor})` }}
                    className="text-primary-foreground hover:opacity-90"
                  >
                    Botão de Exemplo
                  </Button>
                </div>
              </div>
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
