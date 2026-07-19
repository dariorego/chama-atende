import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tv, ExternalLink, Loader2, Film, LayoutGrid, Columns2, ImageOff } from 'lucide-react';
import {
  useVitrineSettings,
  useVitrineDisplayProducts,
  type VitrineModel,
} from '@/hooks/useVitrineSettings';
import { useTenant } from '@/hooks/useTenant';
import { cn } from '@/lib/utils';
import { VitrineStage } from '@/components/vitrine/VitrineSlides';

const MODELS: { value: VitrineModel; label: string; description: string; Icon: typeof Film }[] = [
  { value: 'cinema', label: 'Cinema', description: 'Foto imersiva em tela cheia com título e preço', Icon: Film },
  { value: 'split', label: 'Split 60/40', description: 'Foto grande à esquerda, detalhes à direita', Icon: Columns2 },
  { value: 'mosaico', label: 'Mosaico 2x2', description: 'Quatro produtos por vez em grade', Icon: LayoutGrid },
];

export default function AdminVitrine() {
  const { slug, tenantId, tenant } = useTenant();
  const { settings, isActive, isLoading, updateSettings, isUpdating } = useVitrineSettings();
  const { data: products } = useVitrineDisplayProducts(tenantId);

  const [interval, setInterval] = useState(settings.interval_seconds);
  useEffect(() => setInterval(settings.interval_seconds), [settings.interval_seconds]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const vitrineUrl = slug ? `${window.location.origin}/${slug}/vitrine` : '';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Tv className="h-6 w-6" /> Vitrine Digital</h2>
          <p className="text-muted-foreground">Configure a exibição dos produtos em uma TV</p>
        </div>
        {slug && (
          <Button asChild variant="outline">
            <a href={`/${slug}/vitrine`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Abrir Vitrine
            </a>
          </Button>
        )}
      </div>

      {!isActive && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="py-4 text-sm">
            Módulo <strong>Vitrine Digital</strong> desativado. Ative em <strong>Módulos</strong> para liberar a URL da TV.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Modelo de Exibição</CardTitle>
          <CardDescription>Escolha o layout mostrado na TV — a prévia abaixo atualiza em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {MODELS.map(({ value, label, description, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateSettings({ display_model: value })}
              disabled={isUpdating}
              className={cn(
                'text-left rounded-lg border p-4 transition-all hover:border-primary/60',
                settings.display_model === value ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border',
              )}
            >
              <Icon className="h-6 w-6 text-primary mb-2" />
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{description}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prévia da TV</CardTitle>
          <CardDescription>Simulação em 16:9 do que aparecerá no telão</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner"
            style={{ containerType: 'inline-size' }}
          >
            <VitrineStage
              model={settings.display_model}
              products={products ?? []}
              tenantName={tenant?.name}
              logoUrl={tenant?.logo_url}
              showPrice={settings.show_price}
              intervalSeconds={settings.interval_seconds}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos na Vitrine ({products?.length ?? 0})</CardTitle>
          <CardDescription>Itens marcados como "Exibir na Vitrine" no catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    {p.price != null && (
                      <div className="text-sm text-primary font-semibold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.price))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Nenhum produto marcado. Vá em <strong>Cardápio → Produtos</strong> e ative o switch <strong>Vitrine</strong>.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Exibir preço</Label>
              <p className="text-sm text-muted-foreground">Mostra o valor de cada produto na TV</p>
            </div>
            <Switch checked={settings.show_price} onCheckedChange={(v) => updateSettings({ show_price: v })} disabled={isUpdating} />
          </div>
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="interval">Intervalo entre slides (segundos)</Label>
            <div className="flex gap-2">
              <Input
                id="interval"
                type="number"
                min={3}
                max={60}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="bg-surface"
              />
              <Button
                onClick={() => updateSettings({ interval_seconds: Math.max(3, Math.min(60, interval || 8)) })}
                disabled={isUpdating || interval === settings.interval_seconds}
              >
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL para a TV</CardTitle>
          <CardDescription>Abra este endereço no navegador do dispositivo conectado à TV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={vitrineUrl} className="bg-surface font-mono text-sm" />
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(vitrineUrl); }}>Copiar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}