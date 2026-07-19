import { useTenant } from '@/hooks/useTenant';
import { useVitrineSettings, useVitrineDisplayProducts } from '@/hooks/useVitrineSettings';
import { Tv, Loader2 } from 'lucide-react';
import { VitrineStage } from '@/components/vitrine/VitrineSlides';

export default function VitrineDisplayPage() {
  const { tenant, tenantId, isLoading: tenantLoading } = useTenant();
  const { settings, isActive, isLoading: settingsLoading } = useVitrineSettings();
  const { data: products, isLoading: productsLoading } = useVitrineDisplayProducts(tenantId);

  if (tenantLoading || settingsLoading || productsLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-10">
        <div className="text-center">
          <Tv className="h-16 w-16 mx-auto mb-4 opacity-60" />
          <h1 className="text-3xl font-bold">Vitrine Digital desativada</h1>
          <p className="text-white/60 mt-2">Ative o módulo no painel administrativo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden" style={{ containerType: 'inline-size' }}>
      <VitrineStage
        model={settings.display_model}
        products={products ?? []}
        tenantName={tenant?.name}
        logoUrl={tenant?.logo_url}
        showPrice={settings.show_price}
        intervalSeconds={settings.interval_seconds}
      />
    </div>
  );
}