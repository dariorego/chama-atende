import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Sparkles,
  QrCode,
  Utensils,
  Users,
  CalendarCheck,
  ClipboardList,
  Bell,
  Star,
  BarChart3,
  ShoppingBag,
  Tv,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  ChevronDown,
  CalendarClock,
} from "lucide-react";
import { Receipt, LayoutGrid, PartyPopper } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const modules = [
  {
    icon: Utensils,
    title: "Cardápio Digital",
    desc: "QR Code na mesa, fotos, categorias, combinações e preços sempre atualizados.",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    icon: Bell,
    title: "Chamado de Garçom",
    desc: "Cliente chama pela mesa, atendente recebe em tempo real.",
    span: "",
  },
  {
    icon: ClipboardList,
    title: "Pedidos na Cozinha",
    desc: "Fluxo direto do cliente à cozinha, sem retrabalho.",
    span: "",
  },
  {
    icon: CalendarCheck,
    title: "Reservas",
    desc: "Agenda inteligente com confirmação e compartilhamento por WhatsApp.",
    span: "md:col-span-2",
  },
  {
    icon: Users,
    title: "Fila de Espera",
    desc: "Chamadas por SMS/Push e painel público sem filas físicas.",
    span: "",
  },
  {
    icon: ShoppingBag,
    title: "Encomendas",
    desc: "Aceite pedidos para retirada com pagamento Pix ou cartão.",
    span: "",
  },
  {
    icon: Star,
    title: "Avaliações",
    desc: "Colete feedback e responda diretamente pela plataforma.",
    span: "",
  },
  {
    icon: BarChart3,
    title: "Métricas em Tempo Real",
    desc: "Faturamento, ticket médio, pratos que mais vendem e horários de pico.",
    span: "",
  },
  {
    icon: Tv,
    title: "Vitrine Digital",
    desc: "Exiba seus produtos em uma TV com 3 modelos: Cinema, Split e Mosaico.",
    span: "md:col-span-2",
    badge: "Novo",
  },
  {
    icon: Receipt,
    title: "Comanda Digital",
    desc: "Várias comandas por mesa (ex.: 10.01, 10.02) com fechamento individual e impressão térmica.",
    span: "md:col-span-2",
    badge: "Novo",
  },
  {
    icon: LayoutGrid,
    title: "Controle de Mesas",
    desc: "Mapa do salão com arrastar e soltar, áreas customizáveis e status em tempo real.",
    span: "",
    badge: "Novo",
  },
  {
    icon: PartyPopper,
    title: "Reserva de Eventos",
    desc: "Orçamentos para aniversários, corporativos, casamentos e grupos.",
    span: "",
    badge: "Novo",
  },
  {
    icon: CalendarClock,
    title: "Agenda de Funcionários",
    desc: "Escala semanal, folgas, férias e controle de ponto da equipe.",
    span: "",
    badge: "Novo",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Setup em minutos",
    desc: "Onboarding guiado. Ative módulos conforme sua operação cresce.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-tenant seguro",
    desc: "Isolamento total por estabelecimento com autenticação e RLS.",
  },
  {
    icon: Smartphone,
    title: "100% responsivo",
    desc: "Experiência impecável no celular, tablet e desktop.",
  },
  {
    icon: Globe,
    title: "Domínio próprio",
    desc: "Subdomínio dedicado e possibilidade de domínio customizado.",
  },
];

const steps = [
  {
    n: "01",
    title: "Cadastre seu estabelecimento",
    desc: "Preencha o onboarding com nome, endereço e identidade visual.",
  },
  {
    n: "02",
    title: "Configure módulos e mesas",
    desc: "Ative apenas o que você precisa. Gere QR Codes para as mesas.",
  },
  {
    n: "03",
    title: "Encante seus clientes",
    desc: "Cardápio, pedidos, reservas e fila funcionando no mesmo dia.",
  },
];

const faqs = [
  {
    q: "O que é a ChamaAtende?",
    a: "É uma plataforma SaaS multi-tenant para restaurantes. Reúne cardápio digital, pedidos, reservas, fila de espera, chamado de garçom e métricas em um só lugar.",
  },
  {
    q: "Meus clientes precisam baixar algum aplicativo?",
    a: "Não. O cardápio e os serviços são acessados diretamente pelo navegador do celular, escaneando o QR Code da mesa.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "O sistema aceita Pix e cartão de crédito/débito para encomendas e pedidos, de forma integrada e segura.",
  },
  {
    q: "Posso usar a plataforma em mais de um estabelecimento?",
    a: "Sim. Cada restaurante é isolado em um tenant próprio com autenticação, RLS e controle de acesso independente.",
  },
  {
    q: "Existe contrato de fidelidade ou taxa por pedido?",
    a: "Não há fidelidade. O plano gratuito já inclui as funcionalidades essenciais e módulos avançados podem ser ativados conforme a necessidade.",
  },
  {
    q: "Como faço para começar?",
    a: "Basta clicar em 'Começar grátis', preencher o onboarding e configurar mesas e módulos. Em poucos minutos seu restaurante já pode atender pelo QR Code.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-body min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              ChamaAtende
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#modulos" className="hover:text-foreground transition">Módulos</a>
            <a href="#beneficios" className="hover:text-foreground transition">Benefícios</a>
            <a href="#como-funciona" className="hover:text-foreground transition">Como funciona</a>
            <Link to="/estabelecimentos" className="hover:text-foreground transition">Estabelecimentos</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/onboarding">
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Começar grátis <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <div className="px-6 py-4 flex flex-col gap-3 text-sm">
              <a href="#modulos" onClick={() => setMobileOpen(false)}>Módulos</a>
              <a href="#beneficios" onClick={() => setMobileOpen(false)}>Benefícios</a>
              <a href="#como-funciona" onClick={() => setMobileOpen(false)}>Como funciona</a>
              <Link to="/estabelecimentos" onClick={() => setMobileOpen(false)}>Estabelecimentos</Link>
              <div className="pt-2">
                <Link to="/onboarding" className="block"><Button className="w-full">Começar</Button></Link>
              </div>
            <div className="pt-2 flex justify-center"><ThemeToggle /></div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="absolute inset-0 landing-glow pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm text-xs font-medium text-accent mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Nova versão 2026 — reservas, encomendas e métricas em tempo real
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6 animate-slide-up">
            A plataforma completa
            <br />
            para restaurantes
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Cardápio digital, pedidos, reservas, fila e encomendas em um só lugar.
            Sem apps para o cliente baixar. Sem complicação para você operar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-slide-up">
            <Link to="/onboarding">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 shadow-glow-lg text-base h-12 px-6">
                Começar gratuitamente <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#modulos">
              <Button size="lg" variant="outline" className="text-base h-12 px-6 border-border">
                Ver módulos
              </Button>
            </a>
          </div>

          {/* Hero mockup / floating cards */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-card p-6 md:p-10 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: QrCode, label: "QR na mesa" },
                  { icon: Utensils, label: "Cardápio" },
                  { icon: ClipboardList, label: "Pedidos" },
                  { icon: BarChart3, label: "Métricas" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl bg-background/80 border border-border/60 flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform"
                    style={{ animation: `float ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 grid grid-cols-3 gap-4 text-left">
                <div className="col-span-2 p-5 rounded-2xl bg-primary text-primary-foreground">
                  <div className="text-xs opacity-70 mb-1">Faturamento hoje</div>
                  <div className="font-display text-3xl font-bold">R$ 12.847</div>
                  <div className="text-xs mt-1 text-accent">↑ 18% vs ontem</div>
                </div>
                <div className="p-5 rounded-2xl bg-accent/15 border border-accent/30">
                  <div className="text-xs text-muted-foreground mb-1">Mesas ativas</div>
                  <div className="font-display text-3xl font-bold text-accent">24</div>
                  <div className="text-xs mt-1 text-muted-foreground">de 32</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-10 border-y border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-[0.28em] text-muted-foreground mb-6">
            Restaurantes que confiam na plataforma
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-70">
            {["Bistro Verde", "Café com Dengo", "Trattoria Rossa", "Casa Nostra", "Sabor & Arte", "Verde Cozinha"].map((n) => (
              <span key={n} className="font-display text-lg font-semibold text-muted-foreground hover:text-foreground transition">
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES BENTO */}
      <section id="modulos" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <div className="inline-block editorial-label text-accent mb-4">Módulos</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Tudo que seu restaurante
              <br />
              precisa. <span className="text-muted-foreground">Nada que não precisa.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Ative módulos conforme a operação. Pague só pelo que usa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[220px] gap-4">
            {modules.map((m) => (
              <div
                key={m.title}
                className={`group relative overflow-hidden rounded-3xl border border-border/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-card ${
                  m.featured
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:border-accent/40"
                } ${m.span}`}
              >
                {m.featured && (
                  <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-accent/40 blur-3xl" />
                  </div>
                )}
                <div className="relative flex flex-col h-full justify-between">
                  {m.badge && (
                    <span className="absolute top-0 right-0 text-[10px] tracking-widest uppercase font-semibold bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      {m.badge}
                    </span>
                  )}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      m.featured ? "bg-accent/25 text-accent" : "bg-accent/15 text-accent"
                    } group-hover:scale-110 transition-transform`}
                  >
                    <m.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`font-display font-semibold ${m.featured ? "text-2xl md:text-3xl" : "text-lg"} mb-2`}>
                      {m.title}
                    </h3>
                    <p className={`text-sm ${m.featured ? "text-primary-foreground/80 max-w-md" : "text-muted-foreground"}`}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="beneficios" className="py-24 md:py-32 bg-card/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="editorial-label text-accent mb-4">Por que escolher</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Feito por quem entende
              <br />
              de restaurante.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group p-6 rounded-2xl bg-background border border-border/60 hover:border-accent/50 hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition">
                  <b.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="editorial-label text-accent mb-4">Como funciona</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Do zero ao ar em <span className="text-accent">um dia</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative p-8 rounded-3xl border border-border/60 bg-card hover:border-accent/40 transition-all">
                <div className="font-display text-6xl font-bold text-accent/30 mb-4">{s.n}</div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 md:py-32 bg-card/40 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-accent" />
            ))}
          </div>
          <blockquote className="font-serif-editorial text-3xl md:text-4xl leading-tight mb-8">
            "Reduzimos o tempo de atendimento em 40% e aumentamos o ticket médio.
            A plataforma virou peça central da nossa operação."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-primary" />
            <div className="text-left">
              <div className="font-semibold">Ana Ribeiro</div>
              <div className="text-sm text-muted-foreground">Proprietária, Bistro Verde</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="editorial-label text-accent mb-4">Investimento</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Comece grátis. Pague quando crescer.
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Sem cartão de crédito, sem taxas ocultas. Ative módulos avançados apenas quando precisar.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-10">
            {[
              "Cardápio digital ilimitado",
              "Até 5 mesas com QR Code",
              "Chamado de garçom",
              "Suporte por email",
              "Fila de espera básica",
              "Sem taxa por pedido",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link to="/onboarding">
            <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 shadow-glow-lg text-base h-12 px-8">
              Criar meu estabelecimento <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 bg-card/40 border-y border-border/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="editorial-label text-accent mb-4">Dúvidas</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Respostas claras para você decidir com segurança.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${
                    isOpen
                      ? "bg-background border-accent/40 shadow-card"
                      : "bg-background/60 border-border/60 hover:border-accent/30"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display font-semibold text-lg">{faq.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen ? "bg-accent text-accent-foreground" : "bg-accent/15 text-accent"
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-5 pb-5 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas? Fale com nosso time de vendas.
            </p>
            <Link to="/vendas">
              <Button variant="outline" className="border-border hover:border-accent/50">
                Falar com vendas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Pronto para transformar
                <br />
                seu restaurante?
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Fale com nosso time ou comece agora. Sem compromisso.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:justify-end gap-3">
              <Link to="/onboarding">
                <Button size="lg" className="bg-accent text-accent-foreground hover:opacity-90 w-full sm:w-auto h-12 px-6">
                  Começar grátis <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/vendas">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto h-12 px-6">
                  Falar com vendas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">ChamaAtende</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              A plataforma completa para operação de restaurantes modernos.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm">Produto</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#modulos" className="hover:text-foreground">Módulos</a></li>
              <li><a href="#beneficios" className="hover:text-foreground">Benefícios</a></li>
              <li><Link to="/onboarding" className="hover:text-foreground">Começar</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-sm">Empresa</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/vendas" className="hover:text-foreground">Vendas</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Entrar</Link></li>
              <li><Link to="/estabelecimentos" className="hover:text-foreground">Estabelecimentos</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ChamaAtende. Todos os direitos reservados.</span>
          <span>Feito com cuidado no Brasil.</span>
        </div>
      </footer>
    </div>
  );
}