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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Loader2, Building2, Clock, Phone, Wifi, Palette, ImageIcon, RotateCcw, ClipboardList, Bed, Smartphone, Volume2, VolumeX, TableProperties, Sun, Moon, Globe, MapPin, Check, X, Music } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { formatTime, IdentificationType, BusinessHours, DayHours, BRAZIL_TIMEZONES, WEEKDAYS, DEFAULT_BUSINESS_HOURS, LocationCoordinates } from '@/types/restaurant';
import { ImageUploadWithCrop } from '@/components/ui/image-upload-with-crop';
import { hexToHsl, hslToHex, DEFAULT_COLORS } from '@/lib/color-utils';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useRestaurantStatus } from '@/hooks/useRestaurantStatus';
import { parseGoogleMapsUrl, isGoogleMapsUrl, formatCoordinates } from '@/lib/google-maps-utils';

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  subtitle: z.string().max(200).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  identification_type: z.enum(['table', 'room', 'phone']),
  wifi_network: z.string().max(100).optional(),
  wifi_password: z.string().max(100).optional(),
  instagram: z.string().max(200).optional(),
  facebook: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
  spotify_playlist: z.string().max(500).optional(),
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
  
  // Notification states
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Theme settings states
  const [clientDefaultTheme, setClientDefaultTheme] = useState<'light' | 'dark'>('dark');
  const [adminDefaultTheme, setAdminDefaultTheme] = useState<'light' | 'dark'>('dark');
  
  // Business hours states
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  
  // Location states
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState<LocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState('');
  
  // Calculate current status
  const calculatedStatus = useRestaurantStatus(businessHours, timezone);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      subtitle: '',
      address: '',
      phone: '',
      email: '',
      identification_type: 'table',
      wifi_network: '',
      wifi_password: '',
      instagram: '',
      facebook: '',
      website: '',
      spotify_playlist: '',
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
        identification_type: restaurant.identification_type || 'table',
        wifi_network: restaurant.wifi_info?.network || '',
        wifi_password: restaurant.wifi_info?.password || '',
        instagram: restaurant.social_links?.instagram || '',
        facebook: restaurant.social_links?.facebook || '',
        website: restaurant.social_links?.website || '',
        spotify_playlist: restaurant.social_links?.spotify_playlist || '',
      });
      
      // Load images
      setLogoUrl(restaurant.logo_url);
      setCoverUrl(restaurant.cover_image_url);
      
      // Load colors
      if (restaurant.theme_colors) {
        setPrimaryColor(restaurant.theme_colors.primary || DEFAULT_COLORS.primary!);
      }
      
      // Load notification settings
      if (restaurant.notification_settings) {
        setSoundEnabled(restaurant.notification_settings.sound_enabled ?? true);
      }
      
      // Load theme settings
      if (restaurant.theme_settings) {
        setClientDefaultTheme(restaurant.theme_settings.client_default_theme || 'dark');
        setAdminDefaultTheme(restaurant.theme_settings.admin_default_theme || 'dark');
      }
      
      // Load business hours and timezone
      if (restaurant.business_hours) {
        setBusinessHours(restaurant.business_hours);
      }
      if (restaurant.timezone) {
        setTimezone(restaurant.timezone);
      }
      
      // Load location data
      if (restaurant.google_maps_url) {
        setGoogleMapsUrl(restaurant.google_maps_url);
      }
      if (restaurant.location_coordinates) {
        setLocationCoordinates(restaurant.location_coordinates);
      }
    }
  }, [restaurant, form]);
  
  // Update day hours helper
  const updateDayHours = (dayKey: string, field: keyof DayHours, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey as keyof BusinessHours],
        [field]: value,
      },
    }));
  };

  const resetToDefaultColors = () => {
    setPrimaryColor(DEFAULT_COLORS.primary!);
  };
  
  // Handle Google Maps URL change
  const handleGoogleMapsUrlChange = (url: string) => {
    setGoogleMapsUrl(url);
    setLocationError('');
    
    if (!url) {
      setLocationCoordinates(null);
      return;
    }
    
    if (!isGoogleMapsUrl(url)) {
      setLocationError('Cole um link válido do Google Maps');
      setLocationCoordinates(null);
      return;
    }
    
    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      setLocationCoordinates(coords);
      setLocationError('');
    } else {
      setLocationError('Não foi possível extrair as coordenadas deste link');
      setLocationCoordinates(null);
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    updateRestaurant({
      name: data.name,
      subtitle: data.subtitle || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
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
        spotify_playlist: data.spotify_playlist || undefined,
      },
      theme_colors: {
        primary: primaryColor,
        accent: primaryColor,
      },
      notification_settings: {
        sound_enabled: soundEnabled,
      },
      theme_settings: {
        client_default_theme: clientDefaultTheme,
        admin_default_theme: adminDefaultTheme,
      },
      business_hours: businessHours,
      timezone: timezone,
      google_maps_url: googleMapsUrl || null,
      location_coordinates: locationCoordinates,
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
                Configure os horários para cada dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fuso Horário */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Fuso Horário
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZIL_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabela de Horários */}
              <div className="space-y-3">
                <Label>Horários por Dia</Label>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dia</TableHead>
                        <TableHead>Abertura</TableHead>
                        <TableHead>Fechamento</TableHead>
                        <TableHead className="text-center">Fechado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {WEEKDAYS.map((day) => {
                        const dayHours = businessHours[day.key as keyof BusinessHours];
                        return (
                          <TableRow key={day.key}>
                            <TableCell className="font-medium">{day.label}</TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={dayHours?.open || ''}
                                onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                                disabled={dayHours?.is_closed}
                                className="w-28 bg-surface disabled:opacity-50"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="time"
                                value={dayHours?.close || ''}
                                onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                                disabled={dayHours?.is_closed}
                                className="w-28 bg-surface disabled:opacity-50"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={dayHours?.is_closed || false}
                                onCheckedChange={(checked) => updateDayHours(day.key, 'is_closed', checked)}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Status Atual Calculado */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-border">
                <div className={`flex items-center gap-2 ${
                  calculatedStatus.isOpen ? 'text-green-500' : 'text-red-500'
                }`}>
                  <span className="relative flex h-3 w-3">
                    {calculatedStatus.isOpen && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      calculatedStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </span>
                  <span className="font-semibold">
                    {calculatedStatus.isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {calculatedStatus.statusText}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                O status é calculado automaticamente com base no dia e horário atual.
              </p>
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

          {/* Localização Google Maps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Localização no Mapa
              </CardTitle>
              <CardDescription>
                Cole o link do Google Maps para exibir sua localização exata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link do Google Maps</Label>
                <Input
                  value={googleMapsUrl}
                  onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                  placeholder="https://www.google.com/maps/place/..."
                  className="bg-surface"
                />
                <p className="text-xs text-muted-foreground">
                  Abra o Google Maps, encontre seu estabelecimento e copie o link da barra de endereços
                </p>
              </div>
              
              {/* Feedback de coordenadas */}
              {googleMapsUrl && (
                <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                  locationCoordinates 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  {locationCoordinates ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-500">
                          Coordenadas detectadas
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Lat: {locationCoordinates.latitude.toFixed(7)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Lng: {locationCoordinates.longitude.toFixed(7)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive">
                        {locationError || 'Link inválido'}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Preview do mapa */}
              {locationCoordinates && (
                <div className="space-y-2">
                  <Label>Preview da Localização</Label>
                  <a
                    href={`https://www.google.com/maps?q=${locationCoordinates.latitude},${locationCoordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-border group"
                  >
                    <div className="relative h-40 bg-secondary">
                      <iframe
                        src={`https://www.google.com/maps?q=${locationCoordinates.latitude},${locationCoordinates.longitude}&output=embed`}
                        width="100%"
                        height="160"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="pointer-events-none"
                      />
                    </div>
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Clique para abrir no Google Maps
                  </p>
                </div>
              )}
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
              <FormField
                control={form.control}
                name="spotify_playlist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-green-500" />
                      Spotify - Música Ambiente
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cole a URL da playlist, álbum ou música" className="bg-surface" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      O player aparecerá na sidebar do painel admin
                    </p>
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

          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                Tema
              </CardTitle>
              <CardDescription>
                Configure a aparência padrão do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tema padrão do Cliente */}
              <div className="space-y-3">
                <Label className="text-base">Tema padrão para Clientes</Label>
                <RadioGroup
                  value={clientDefaultTheme}
                  onValueChange={(value) => setClientDefaultTheme(value as 'light' | 'dark')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="client-dark" />
                    <Label htmlFor="client-dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="client-light" />
                    <Label htmlFor="client-light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" />
                      Claro
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  O cliente pode alterar o tema a qualquer momento
                </p>
              </div>

              {/* Tema padrão do Admin */}
              <div className="space-y-3">
                <Label className="text-base">Tema padrão para Admin</Label>
                <RadioGroup
                  value={adminDefaultTheme}
                  onValueChange={(value) => setAdminDefaultTheme(value as 'light' | 'dark')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="admin-dark" />
                    <Label htmlFor="admin-dark" className="flex items-center gap-2 cursor-pointer">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="admin-light" />
                    <Label htmlFor="admin-light" className="flex items-center gap-2 cursor-pointer">
                      <Sun className="h-4 w-4" />
                      Claro
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Cada administrador pode alterar seu tema pessoal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                Cor Principal
              </CardTitle>
              <CardDescription>
                Personalize a cor de destaque do seu site
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

              {/* Botão para resetar cores padrão */}
              <Button type="button" variant="outline" onClick={resetToDefaultColors}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar cor padrão
              </Button>

              {/* Preview em tempo real */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-sm mb-3 text-foreground">Preview:</p>
                <Button 
                  type="button"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                  className="text-primary-foreground hover:opacity-90"
                >
                  Botão de Exemplo
                </Button>
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
