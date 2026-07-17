import { useEffect, useState, useMemo } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { useVitrineSettings, useVitrineDisplayProducts } from '@/hooks/useVitrineSettings';
import { Tv, Loader2 } from 'lucide-react';

function formatPrice(v: number | null) {
  if (v == null) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

export default function VitrineDisplayPage() {
  const { tenant, tenantId, isLoading: tenantLoading } = useTenant();
  const { settings, isActive, isLoading: settingsLoading } = useVitrineSettings();
  const { data: products, isLoading: productsLoading } = useVitrineDisplayProducts(tenantId);
  const [index, setIndex] = useState(0);

  const items = useMemo(() => products ?? [], [products]);
  const perSlide = settings.display_model === 'mosaico' ? 4 : 1;
  const totalSlides = Math.max(1, Math.ceil(items.length / perSlide));

  useEffect(() => {
    if (items.length === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % totalSlides);
    }, Math.max(3, settings.interval_seconds) * 1000);
    return () => window.clearInterval(id);
  }, [items.length, settings.interval_seconds, totalSlides]);

  useEffect(() => { setIndex(0); }, [settings.display_model, items.length]);

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-10">
        <div className="text-center">
          <Tv className="h-16 w-16 mx-auto mb-4 opacity-60" />
          <h1 className="text-3xl font-bold">Nenhum produto na vitrine</h1>
          <p className="text-white/60 mt-2">Marque produtos como "Exibir na Vitrine" no admin.</p>
        </div>
      </div>
    );
  }

  const slice = items.slice(index * perSlide, index * perSlide + perSlide);
  const showPrice = settings.show_price;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {settings.display_model === 'cinema' && slice[0] && (
        <CinemaSlide product={slice[0]} tenantName={tenant?.name} showPrice={showPrice} logoUrl={tenant?.logo_url} />
      )}
      {settings.display_model === 'split' && slice[0] && (
        <SplitSlide product={slice[0]} tenantName={tenant?.name} showPrice={showPrice} logoUrl={tenant?.logo_url} />
      )}
      {settings.display_model === 'mosaico' && (
        <MosaicoSlide products={slice} tenantName={tenant?.name} showPrice={showPrice} logoUrl={tenant?.logo_url} />
      )}
      <ProgressDots total={totalSlides} current={index} />
    </div>
  );
}

type Product = { id: string; name: string; description: string | null; price: number | null; image_url: string | null };

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-3 bg-white/30'}`} />
      ))}
    </div>
  );
}

function TenantBadge({ name, logoUrl }: { name?: string; logoUrl?: string | null }) {
  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
      {logoUrl && <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}
      <span className="text-sm tracking-wide font-medium">{name}</span>
    </div>
  );
}

function CinemaSlide({ product, tenantName, logoUrl, showPrice }: { product: Product; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div key={product.id} className="absolute inset-0 animate-fade-in">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute top-8 left-8 z-10"><TenantBadge name={tenantName} logoUrl={logoUrl} /></div>
      <div className="absolute bottom-16 left-8 right-8 z-10 max-w-4xl">
        <h1 className="text-7xl font-bold tracking-tight leading-tight drop-shadow-2xl">{product.name}</h1>
        {product.description && (
          <p className="mt-4 text-2xl text-white/85 max-w-3xl line-clamp-3">{product.description}</p>
        )}
        {showPrice && product.price != null && (
          <div className="mt-6 inline-block bg-primary text-primary-foreground text-5xl font-bold px-6 py-3 rounded-xl">
            {formatPrice(product.price)}
          </div>
        )}
      </div>
    </div>
  );
}

function SplitSlide({ product, tenantName, logoUrl, showPrice }: { product: Product; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div key={product.id} className="absolute inset-0 grid grid-cols-[60%_40%] animate-fade-in">
      <div className="relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
        )}
        <div className="absolute top-8 left-8"><TenantBadge name={tenantName} logoUrl={logoUrl} /></div>
      </div>
      <div className="bg-neutral-950 p-12 flex flex-col justify-center">
        <div className="text-primary text-lg tracking-widest uppercase mb-4">Destaque</div>
        <h1 className="text-6xl font-bold leading-tight">{product.name}</h1>
        {product.description && <p className="mt-6 text-xl text-white/70">{product.description}</p>}
        {showPrice && product.price != null && (
          <div className="mt-8 text-6xl font-bold text-primary">{formatPrice(product.price)}</div>
        )}
      </div>
    </div>
  );
}

function MosaicoSlide({ products, tenantName, logoUrl, showPrice }: { products: Product[]; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col animate-fade-in">
      <div className="p-6 flex items-center justify-between">
        <TenantBadge name={tenantName} logoUrl={logoUrl} />
        <div className="text-white/60 text-sm tracking-widest uppercase">Cardápio em destaque</div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 p-3">
        {products.map((p) => (
          <div key={p.id} className="relative rounded-2xl overflow-hidden bg-neutral-900">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-3xl font-bold leading-tight">{p.name}</h2>
              {showPrice && p.price != null && (
                <div className="mt-2 inline-block bg-primary text-primary-foreground text-xl font-bold px-3 py-1 rounded-lg">
                  {formatPrice(p.price)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}