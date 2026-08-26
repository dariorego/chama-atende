import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getModuleLanding } from "@/data/moduleLandings";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Check,
  Sparkles,
  QrCode,
  Image as ImageIcon,
  LayoutGrid,
  Search,
  Star,
  Tag,
  Palette,
  Upload,
  Smartphone,
  RefreshCw,
  EyeOff,
  Globe,
  Wallet,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Puzzle,
} from "lucide-react";
import {
  Bell,
  BellRing,
  Volume2,
  Layers,
  ListChecks,
  ClipboardList,
  FileText,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  Users,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Receipt,
  Printer,
  Tv,
  Play,
  Move,
  PartyPopper,
  Thermometer,
  AlertTriangle,
  UserCheck,
  Percent,
  CalendarX,
  Trash2,
  History,
  Download,
  Lock,
  FileCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  QrCode,
  Image: ImageIcon,
  LayoutGrid,
  Search,
  Star,
  Tag,
  Palette,
  Upload,
  Smartphone,
  RefreshCw,
  EyeOff,
  Globe,
  Wallet,
  Zap,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  Bell,
  BellRing,
  Volume2,
  Layers,
  ListChecks,
  ClipboardList,
  FileText,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  Users,
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Receipt,
  Printer,
  Tv,
  Play,
  Move,
  PartyPopper,
  Thermometer,
  AlertTriangle,
  UserCheck,
  Percent,
  CalendarX,
  Trash2,
  History,
  Download,
  Lock,
  FileCheck,
};

export default function ModuleDetailPage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const data = getModuleLanding(moduleSlug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!data) return;
    document.title = `${data.moduleName} | Chama Atende`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", data.subtitle);
  }, [data]);

  if (!data) return <Navigate to="/#modulos" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <Link
              to="/#modulos"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para os módulos
            </Link>
            <div className="editorial-label text-accent mb-3">Módulo</div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">{data.title}</h1>
            <p className="text-xl md:text-2xl text-foreground/80 font-display mb-4">{data.subtitle}</p>
            <p className="text-muted-foreground text-lg max-w-xl mb-8">{data.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to={data.tryPath}>
                  Experimentar agora <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/#modulos">Voltar para os módulos</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
            <img
              src={data.heroImage}
              alt={`Ilustração do módulo ${data.moduleName}`}
              width={1600}
              height={1008}
              className="relative w-full rounded-3xl border border-border/60 shadow-card object-cover"
            />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="editorial-label text-accent mb-3">Sobre o módulo</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-10">
            Entenda como o {data.moduleName} funciona
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {data.about.map((a) => (
              <div key={a.heading} className="rounded-3xl border border-border/60 bg-card p-6">
                <h3 className="font-display text-xl font-semibold mb-2">{a.heading}</h3>
                <p className="text-muted-foreground leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="py-20 md:py-28 bg-card/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="editorial-label text-accent mb-3">Recursos</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-12">
            Principais funcionalidades
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.features.map((f) => {
              const Icon = ICONS[f.icon] ?? Puzzle;
              return (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-border/60 bg-background p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FLUXO */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="editorial-label text-accent mb-3">Passo a passo</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-12">Fluxo de funcionamento</h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {data.flow.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-border/60 bg-card p-6">
                <span className="font-display text-4xl font-bold text-accent/40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg font-semibold mt-2 mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 md:py-28 bg-card/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="editorial-label text-accent mb-3">Resultados</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-12">Benefícios</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.benefits.map((b) => {
              const Icon = ICONS[b.icon] ?? Check;
              return (
                <div key={b.title} className="rounded-3xl border border-border/60 bg-background p-6">
                  <Icon className="w-6 h-6 text-accent mb-4" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CASOS DE USO + INTEGRAÇÕES */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid gap-14 lg:grid-cols-2">
          <div>
            <div className="editorial-label text-accent mb-3">Onde usar</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8">Casos de uso</h2>
            <ul className="flex flex-wrap gap-3">
              {data.useCases.map((u) => (
                <li
                  key={u}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm"
                >
                  <Check className="w-4 h-4 text-accent" /> {u}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="editorial-label text-accent mb-3">Conexões</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8">Integrações</h2>
            <div className="flex flex-col items-start gap-2">
              {data.integrations.map((mod, i) => (
                <div key={mod} className="w-full">
                  <div className="rounded-2xl border border-border/60 bg-card px-5 py-3 font-display font-semibold">
                    {mod}
                  </div>
                  {i < data.integrations.length - 1 && (
                    <div className="pl-6 py-1">
                      <ArrowDown className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-card/40 border-y border-border/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="editorial-label text-accent mb-3">Dúvidas</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-10">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {data.faq.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-8 h-8 text-accent mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">{data.cta.title}</h2>
          <p className="text-lg text-muted-foreground mb-8">{data.cta.desc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to={data.tryPath}>
                Experimentar módulo <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/#contato">Solicitar demonstração</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full">
              <Link to="/#modulos">Voltar para módulos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}