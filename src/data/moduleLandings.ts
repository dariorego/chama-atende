import cardapioHero from "@/assets/modulo-cardapio-digital.jpg";

export interface ModuleFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface ModuleLanding {
  slug: string;
  moduleName: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  tryPath: string;
  about: { heading: string; body: string }[];
  features: ModuleFeature[];
  flow: { title: string; desc: string }[];
  benefits: { icon: string; title: string; desc: string }[];
  useCases: string[];
  integrations: string[];
  faq: { q: string; a: string }[];
  cta: { title: string; desc: string };
}

export const MODULE_LANDINGS: Record<string, ModuleLanding> = {
  "cardapio-digital": {
    slug: "cardapio-digital",
    moduleName: "Cardápio Digital",
    title: "Cardápio Digital",
    subtitle: "Seu menu completo em um QR Code, sempre atualizado.",
    description:
      "Substitua o cardápio impresso por uma experiência digital com fotos, categorias, destaques, promoções e preços que você altera em segundos — sem reimprimir nada.",
    heroImage: cardapioHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o Cardápio Digital",
        body: "É a vitrine online do seu estabelecimento. O cliente aponta a câmera para o QR Code da mesa e abre imediatamente o menu com a identidade visual da sua marca: logo, banner, cores, fotos dos pratos, descrições, preços e selos de destaque.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Acaba com cardápios impressos desatualizados, rasurados ou com preços antigos. Elimina o custo de reimpressão a cada mudança, reduz dúvidas do cliente sobre ingredientes e diminui o tempo que o garçom gasta explicando o menu.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes, bares, cafeterias, lanchonetes, pizzarias, hotéis, food halls e qualquer estabelecimento que sirva alimentos e bebidas — de operações com uma unidade até redes com vários endereços.",
      },
      {
        heading: "Como funciona",
        body: "Você cadastra categorias e produtos (manualmente ou por importação em CSV com imagens), define destaques e promoções e gera o QR Code de cada mesa. As alterações aparecem para o cliente na hora, sem precisar publicar nada.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "O mesmo catálogo alimenta os módulos de Pedidos na Cozinha, Comanda Digital, Encomendas e Vitrine Digital. Ative o Chamado de Garçom para o cliente pedir atendimento sem sair do cardápio e acompanhe os itens mais vistos e vendidos nas Métricas.",
      },
    ],
    features: [
      { icon: "QrCode", title: "QR Code por mesa", desc: "Um código para cada mesa, com identificação automática do local." },
      { icon: "Image", title: "Fotos dos produtos", desc: "Imagens com corte padronizado e carregamento otimizado." },
      { icon: "LayoutGrid", title: "Categorias organizadas", desc: "Ordene seções e produtos do jeito que sua operação vende." },
      { icon: "Search", title: "Busca instantânea", desc: "O cliente encontra o prato pelo nome em segundos." },
      { icon: "Star", title: "Destaques e selos", desc: "Marque os mais pedidos, novidades e recomendações da casa." },
      { icon: "Tag", title: "Preço promocional", desc: "Mostre o valor antigo riscado e o preço da promoção." },
      { icon: "Palette", title: "Identidade da sua marca", desc: "Logo, banner e cores do estabelecimento aplicados no menu." },
      { icon: "Upload", title: "Importação em CSV", desc: "Suba centenas de produtos e imagens de uma vez." },
      { icon: "Smartphone", title: "Feito para o celular", desc: "Interface rápida, responsiva e sem necessidade de instalar app." },
      { icon: "RefreshCw", title: "Atualização em tempo real", desc: "Alterou o preço no painel? O cliente já vê o novo valor." },
      { icon: "EyeOff", title: "Itens esgotados", desc: "Desative um produto com um clique quando faltar no estoque." },
      { icon: "Globe", title: "Link compartilhável", desc: "Use o mesmo cardápio no Instagram, WhatsApp e Google." },
    ],
    flow: [
      { title: "Cliente escaneia o QR Code", desc: "Na mesa, balcão ou no link das redes sociais." },
      { title: "Cardápio abre com sua marca", desc: "Logo, banner, cores e categorias do estabelecimento." },
      { title: "Cliente navega e busca", desc: "Fotos, descrições, preços e destaques em poucos toques." },
      { title: "Ação direta", desc: "Chamar o garçom, fazer o pedido ou abrir uma comanda." },
      { title: "Equipe recebe em tempo real", desc: "O painel admin registra chamados e pedidos na hora." },
      { title: "Dados alimentam relatórios", desc: "Itens mais vistos, mais vendidos e horários de pico." },
    ],
    benefits: [
      { icon: "Wallet", title: "Zero custo de impressão", desc: "Sem gráfica, sem reimpressão a cada troca de preço." },
      { icon: "Zap", title: "Atendimento mais rápido", desc: "O cliente decide antes do garçom chegar à mesa." },
      { icon: "TrendingUp", title: "Ticket médio maior", desc: "Fotos e destaques aumentam a venda de itens complementares." },
      { icon: "ShieldCheck", title: "Informação sempre correta", desc: "Um único lugar controla preços e disponibilidade." },
      { icon: "Sparkles", title: "Experiência premium", desc: "Menu bonito, com a identidade visual da sua casa." },
      { icon: "Clock", title: "Economia de tempo", desc: "Atualize o menu inteiro em minutos, de qualquer lugar." },
    ],
    useCases: [
      "Restaurantes",
      "Bares e pubs",
      "Cafeterias",
      "Pizzarias e hamburguerias",
      "Hotéis e pousadas",
      "Food halls e praças de alimentação",
      "Confeitarias e docerias",
      "Clubes e eventos",
    ],
    integrations: [
      "Cardápio Digital",
      "Chamado de Garçom",
      "Pedidos na Cozinha",
      "Comanda Digital",
      "Encomendas",
      "Vitrine Digital",
      "Métricas em Tempo Real",
    ],
    faq: [
      {
        q: "O cliente precisa instalar algum aplicativo?",
        a: "Não. O cardápio abre direto no navegador do celular ao escanear o QR Code ou acessar o link.",
      },
      {
        q: "Consigo alterar preços a qualquer momento?",
        a: "Sim. Qualquer alteração feita no painel aparece imediatamente para os clientes, sem republicar nada.",
      },
      {
        q: "Posso ter um QR Code diferente para cada mesa?",
        a: "Sim. A plataforma gera um QR Code por mesa, o que permite identificar automaticamente de onde vem o chamado ou o pedido.",
      },
      {
        q: "Como cadastro muitos produtos de uma vez?",
        a: "Use a importação em CSV: baixe o modelo, preencha categorias, produtos e links das imagens e suba o arquivo. As imagens são enviadas para o armazenamento do seu estabelecimento.",
      },
      {
        q: "O cardápio fica com a identidade da minha marca?",
        a: "Sim. Você define logo, banner e as cores primária e secundária, aplicadas em todas as telas do seu estabelecimento.",
      },
      {
        q: "Como marco um item que acabou?",
        a: "Basta desativar o produto no painel. Ele deixa de aparecer no cardápio até você reativar.",
      },
      {
        q: "Funciona sem os outros módulos?",
        a: "Sim, o Cardápio Digital funciona sozinho no plano inicial. Você pode ativar Pedidos, Comanda e demais módulos quando quiser.",
      },
      {
        q: "Posso usar o mesmo cardápio nas redes sociais?",
        a: "Sim. Existe um link público que pode ser usado na bio do Instagram, no WhatsApp e no perfil do Google.",
      },
      {
        q: "As imagens ficam pesadas para o cliente?",
        a: "Não. As fotos são recortadas em formato padronizado e carregadas de forma otimizada, com carregamento sob demanda.",
      },
      {
        q: "Preciso de internet na mesa do cliente?",
        a: "O cliente usa os dados do próprio celular ou o Wi-Fi da casa — cujos dados também podem ser exibidos na tela inicial do estabelecimento.",
      },
    ],
    cta: {
      title: "Coloque seu cardápio no ar hoje",
      desc: "Crie sua conta, cadastre seus produtos e gere o QR Code das mesas em poucos minutos.",
    },
  },
};

export function getModuleLanding(slug?: string): ModuleLanding | undefined {
  if (!slug) return undefined;
  return MODULE_LANDINGS[slug];
}