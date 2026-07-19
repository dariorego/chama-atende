import { useEffect, useMemo, useState } from 'react';
import type { VitrineModel } from '@/hooks/useVitrineSettings';

export type VitrineProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

function formatPrice(v: number | null) {
  if (v == null) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));
}

export function TenantBadge({ name, logoUrl }: { name?: string; logoUrl?: string | null }) {
  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
      {logoUrl && <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}
      {name && <span className="text-sm tracking-wide font-medium text-white">{name}</span>}
    </div>
  );
}

export function CinemaSlide({ product, tenantName, logoUrl, showPrice }: { product: VitrineProduct; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div key={product.id} className="absolute inset-0 animate-fade-in text-white">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute top-[4%] left-[3%] z-10"><TenantBadge name={tenantName} logoUrl={logoUrl} /></div>
      <div className="absolute bottom-[8%] left-[3%] right-[3%] z-10 max-w-[80%]">
        <h1 className="text-[7cqw] font-bold tracking-tight leading-[1.02] drop-shadow-2xl">{product.name}</h1>
        {product.description && (
          <p className="mt-[1.5cqw] text-[2.4cqw] text-white/85 line-clamp-3">{product.description}</p>
        )}
        {showPrice && product.price != null && (
          <div className="mt-[2cqw] inline-block bg-primary text-primary-foreground text-[5cqw] font-bold px-[2cqw] py-[1cqw] rounded-xl">
            {formatPrice(product.price)}
          </div>
        )}
      </div>
    </div>
  );
}

export function SplitSlide({ product, tenantName, logoUrl, showPrice }: { product: VitrineProduct; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div key={product.id} className="absolute inset-0 grid grid-cols-[60%_40%] animate-fade-in text-white">
      <div className="relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
        )}
        <div className="absolute top-[5%] left-[5%]"><TenantBadge name={tenantName} logoUrl={logoUrl} /></div>
      </div>
      <div className="bg-neutral-950 p-[3cqw] flex flex-col justify-center">
        <div className="text-primary text-[1.8cqw] tracking-widest uppercase mb-[1cqw]">Destaque</div>
        <h1 className="text-[5cqw] font-bold leading-tight">{product.name}</h1>
        {product.description && <p className="mt-[1.5cqw] text-[2cqw] text-white/70 line-clamp-4">{product.description}</p>}
        {showPrice && product.price != null && (
          <div className="mt-[2cqw] text-[5cqw] font-bold text-primary">{formatPrice(product.price)}</div>
        )}
      </div>
    </div>
  );
}

export function MosaicoSlide({ products, tenantName, logoUrl, showPrice }: { products: VitrineProduct[]; tenantName?: string; logoUrl?: string | null; showPrice: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col animate-fade-in text-white bg-black">
      <div className="p-[1.5cqw] flex items-center justify-between">
        <TenantBadge name={tenantName} logoUrl={logoUrl} />
        <div className="text-white/60 text-[1.4cqw] tracking-widest uppercase">Cardápio em destaque</div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-[0.6cqw] p-[0.6cqw]">
        {products.map((p) => (
          <div key={p.id} className="relative rounded-2xl overflow-hidden bg-neutral-900">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-[1.2cqw]">
              <h2 className="text-[2.6cqw] font-bold leading-tight line-clamp-2">{p.name}</h2>
              {showPrice && p.price != null && (
                <div className="mt-[0.6cqw] inline-block bg-primary text-primary-foreground text-[1.8cqw] font-bold px-[0.8cqw] py-[0.3cqw] rounded-lg">
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

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 flex gap-2 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-3 bg-white/30'}`} />
      ))}
    </div>
  );
}

export function VitrineStage({
  model,
  products,
  tenantName,
  logoUrl,
  showPrice,
  intervalSeconds,
}: {
  model: VitrineModel;
  products: VitrineProduct[];
  tenantName?: string;
  logoUrl?: string | null;
  showPrice: boolean;
  intervalSeconds: number;
}) {
  const perSlide = model === 'mosaico' ? 4 : 1;
  const totalSlides = Math.max(1, Math.ceil(products.length / perSlide));
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [model, products.length]);

  useEffect(() => {
    if (products.length === 0) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % totalSlides), Math.max(3, intervalSeconds) * 1000);
    return () => window.clearInterval(id);
  }, [products.length, intervalSeconds, totalSlides]);

  const slice = useMemo(() => products.slice(index * perSlide, index * perSlide + perSlide), [products, index, perSlide]);

  if (products.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white/70 bg-black text-center p-6">
        <div>
          <div className="text-[2.5cqw] font-semibold">Nenhum produto na vitrine</div>
          <p className="text-[1.6cqw] text-white/50 mt-2">Ative "Exibir na Vitrine" nos produtos.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {model === 'cinema' && slice[0] && <CinemaSlide product={slice[0]} tenantName={tenantName} logoUrl={logoUrl} showPrice={showPrice} />}
      {model === 'split' && slice[0] && <SplitSlide product={slice[0]} tenantName={tenantName} logoUrl={logoUrl} showPrice={showPrice} />}
      {model === 'mosaico' && <MosaicoSlide products={slice} tenantName={tenantName} logoUrl={logoUrl} showPrice={showPrice} />}
      <ProgressDots total={totalSlides} current={index} />
    </>
  );
}