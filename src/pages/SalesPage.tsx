import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  Bell,
  CalendarCheck,
  Users,
  ChefHat,
  Star,
  ShoppingBag,
  QrCode,
  Zap,
  Shield,
  LayoutDashboard,
  Globe,
  Check,
  ArrowRight,
  Menu,
  X,
  Smartphone,
  Clock,
  TrendingUp,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Módulos", href: "#modulos" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Planos", href: "#planos" },
];

const MODULES = [
  {
    icon: UtensilsCrossed,
    title: "Cardápio Digital",
    description: "Cardápio interativo com categorias, fotos, preços e destaques. Atualização em tempo real.",
    features: ["Categorias organizadas", "Fotos e descrições", "Preços e promoções", "Destaques automáticos"],
    plan: "Grátis",
  },
  {
    icon: Bell,
    title: "Chamar Atendente",
    description: "O cliente solicita atendimento direto pelo celular. O garçom recebe a notificação instantaneamente.",
    features: ["Chamada por mesa via QR Code", "Tipos: Atendente / Conta / Água", "Painel de chamados em tempo real", "Histórico completo"],
    plan: "Grátis",
  },
  {
    icon: CalendarCheck,
    title: "Sistema de Reservas",
    description: "Reservas online com confirmação automática, controle de lotação e gestão completa.",
    features: ["Formulário público de reserva", "Confirmação e cancelamento", "Código de acompanhamento", "Controle de capacidade"],
    plan: "Pro",
  },
  {
    icon: Users,
    title: "Fila de Espera",
    description: "Gerencie a fila de espera digitalmente. Clientes acompanham posição em tempo real.",
    features: ["Entrada na fila via celular", "Posição em tempo real", "Notificação de chamada", "Estimativa de espera"],
    plan: "Pro",
  },
  {
    icon: ChefHat,
    title: "Pedido para Cozinha",
    description: "Sistema completo de pedidos com personalização, combinações e acompanhamento de status.",
    features: ["Montagem de pedido personalizado", "Grupos de combinações", "Status: Pendente → Preparando → Pronto", "Observações por item"],
    plan: "Pro",
  },
  {
    icon: Star,
    title: "Avaliações de Clientes",
    description: "Colete feedback detalhado sobre comida, atendimento e ambiente com notas e comentários.",
    features: ["Avaliação por categoria", "Notas de 1 a 5 estrelas", "Respostas do admin", "Destaques no hub"],
    plan: "Pro",
  },
  {
    icon: ShoppingBag,
    title: "Sistema de Encomendas",
    description: "Receba encomendas antecipadas com data/hora de retirada, carrinho e acompanhamento.",
    features: ["Catálogo dedicado", "Carrinho de compras", "Escolha de data e horário", "Status da encomenda"],
    plan: "Enterprise",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastro rápido e gratuito. Em menos de 2 minutos você já tem acesso ao painel.",
    icon: Globe,
  },
  {
    number: "02",
    title: "Configure seu restaurante",
    description: "Personalize nome, logo, horários, cardápio e ative os módulos que desejar.",
    icon: LayoutDashboard,
  },
  {
    number: "03",
    title: "Gere QR Codes",
    description: "Crie QR Codes para cada mesa. Seus clientes acessam tudo pelo celular.",
    icon: QrCode,
  },
  {
    number: "04",
    title: "Comece a atender",
    description: "Pronto! Seus clientes já podem fazer pedidos, chamar atendentes e muito mais.",
    icon: Zap,
  },
];

const DIFFERENTIALS = [
  { icon: LayoutDashboard, title: "Hub Centralizado", description: "Todos os módulos em um único lugar, acessível por QR Code na mesa." },
  { icon: QrCode, title: "QR Code Inteligente", description: "Um QR Code por mesa que dá acesso a todos os serviços do restaurante." },
  { icon: Zap, title: "Tempo Real", description: "Todas as atualizações são instantâneas: pedidos, chamados, fila." },
  { icon: Shield, title: "Multi-Tenant Seguro", description: "Cada restaurante tem seus dados 100% isolados e protegidos." },
  { icon: TrendingUp, title: "Painel Admin Completo", description: "Dashboard com métricas, gestão de equipe, produtos e configurações." },
  { icon: Smartphone, title: "100% Web e Responsivo", description: "Funciona em qualquer dispositivo. Sem necessidade de instalar aplicativos." },
];

const PLANS = [
  {
    name: "Starter",
    price: "Grátis",
    period: "",
    description: "Ideal para começar a digitalizar seu restaurante.",
    features: [
      "Até 3 usuários",
      "Cardápio Digital",
      "Chamar Atendente",
      "QR Code por mesa",
      "Painel admin básico",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "R$ 99",
    period: "/mês",
    description: "Para restaurantes que querem a experiência completa.",
    features: [
      "Até 10 usuários",
      "Todos os módulos básicos",
      "Reservas online",
      "Fila de espera digital",
      "Pedido para cozinha",
      "Avaliações de clientes",
      "Relatórios e métricas",
      "Suporte por email",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 299",
    period: "/mês",
    description: "Para operações de grande porte com necessidades avançadas.",
    features: [
      "Usuários ilimitados",
      "Todos os módulos Pro",
      "Sistema de Encomendas",
      "API de integração",
      "Domínio personalizado",
      "Suporte prioritário",
      "Onboarding dedicado",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
  },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function SalesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/vendas" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Chama Atende</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            {NAV_LINKS.map((l) => (
              <button key={l.href} onClick={() => scrollTo(l.href.slice(1))} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/onboarding">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden glass border-t border-border px-4 pb-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <button key={l.href} onClick={() => { scrollTo(l.href.slice(1)); setMobileMenuOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground text-left py-2">
                {l.label}
              </button>
            ))}
            <Link to="/login"><Button variant="ghost" size="sm" className="w-full">Login</Button></Link>
            <Link to="/onboarding"><Button size="sm" className="w-full">Começar Grátis</Button></Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-4" aria-label="Apresentação">
          <div className="container mx-auto text-center max-w-3xl animate-slide-up">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1" /> Plataforma 100% Web
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Transforme seu Restaurante com{" "}
              <span className="text-gradient">Tecnologia Inteligente</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cardápio digital, pedidos, reservas, fila de espera e muito mais. Tudo em uma única plataforma acessível por QR Code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="gap-2 shadow-glow text-base px-8">
                  Criar Restaurante Grátis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/bistro-verde">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Ver Demonstração
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-10">
              {[
                { icon: Globe, label: "100% Web" },
                { icon: Zap, label: "Tempo Real" },
                { icon: Shield, label: "Multi-Tenant" },
                { icon: Clock, label: "Setup em 5 min" },
              ].map((b) => (
                <Badge key={b.label} variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                  <b.icon className="w-3 h-3" /> {b.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Problema & Solução */}
        <section className="py-20 px-4 bg-surface/50">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Seu restaurante ainda usa <span className="text-destructive">papel e caneta</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Clientes esperando para serem atendidos, comandas perdidas, reservas por telefone que ninguém anota, filas sem organização...
            </p>
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
              <p className="text-foreground text-lg font-medium">
                O <span className="text-gradient font-bold">Chama Atende</span> resolve tudo isso com uma plataforma digital completa. Seus clientes escaneiam um QR Code na mesa e têm acesso a cardápio, pedidos, chamada de atendente, avaliação e muito mais.
              </p>
            </div>
          </div>
        </section>

        {/* Módulos */}
        <section id="modulos" className="py-20 px-4" aria-label="Módulos">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-4">Funcionalidades</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que seu restaurante precisa</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">7 módulos integrados que cobrem toda a operação do seu restaurante, do cardápio à avaliação.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MODULES.map((m) => (
                <Card key={m.title} className="group hover:shadow-glow hover:border-primary/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <m.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                      <Badge variant={m.plan === "Grátis" ? "default" : "secondary"} className="text-[10px]">{m.plan}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{m.description}</p>
                    <ul className="space-y-2">
                      {m.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="py-20 px-4 bg-surface/50" aria-label="Como funciona">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-4">Passo a Passo</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece em minutos</h2>
              <p className="text-muted-foreground">4 passos simples para digitalizar seu restaurante.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {STEPS.map((s, i) => (
                <div key={s.number} className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-extrabold text-xl">{s.number}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                    <p className="text-muted-foreground text-sm">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section id="diferenciais" className="py-20 px-4" aria-label="Diferenciais">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-4">Por que escolher</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Diferenciais da Plataforma</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {DIFFERENTIALS.map((d) => (
                <div key={d.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <d.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{d.title}</h3>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-20 px-4 bg-surface/50" aria-label="Planos e preços">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <Badge variant="secondary" className="mb-4">Preços</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada momento</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Comece grátis e evolua conforme seu restaurante cresce.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PLANS.map((p) => (
                <Card
                  key={p.name}
                  className={`relative flex flex-col ${
                    p.highlighted
                      ? "border-primary shadow-glow scale-[1.02]"
                      : "border-border"
                  }`}
                >
                  {p.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="shadow-glow">Mais Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <p className="text-sm text-muted-foreground font-medium">{p.name}</p>
                    <div className="mt-2">
                      <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                      <span className="text-muted-foreground text-sm">{p.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/onboarding" className="w-full">
                      <Button
                        className="w-full"
                        variant={p.highlighted ? "default" : "outline"}
                        size="lg"
                      >
                        {p.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 px-4" aria-label="Chamada final">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para <span className="text-gradient">revolucionar</span> seu atendimento?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a restaurantes que já estão usando o Chama Atende para oferecer uma experiência digital completa aos seus clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="gap-2 shadow-glow text-base px-8">
                  Criar Restaurante Grátis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/bistro-verde">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4" aria-label="Rodapé">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Chama Atende</span>
              </div>
              <p className="text-sm text-muted-foreground">Plataforma completa para digitalizar a operação do seu restaurante.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollTo("modulos")} className="hover:text-foreground transition-colors">Módulos</button></li>
                <li><button onClick={() => scrollTo("planos")} className="hover:text-foreground transition-colors">Planos</button></li>
                <li><Link to="/bistro-verde" className="hover:text-foreground transition-colors">Demonstração</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Acesso</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/onboarding" className="hover:text-foreground transition-colors">Criar Restaurante</Link></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Fazer Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Chama Atende. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
