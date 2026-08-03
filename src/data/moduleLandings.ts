import cardapioHero from "@/assets/modulo-cardapio-digital.jpg";
import garcomHero from "@/assets/modulo-chamado-de-garcom.jpg";
import cozinhaHero from "@/assets/modulo-pedidos-na-cozinha.jpg";
import reservasHero from "@/assets/modulo-reservas.jpg";
import filaHero from "@/assets/modulo-fila-de-espera.jpg";
import encomendasHero from "@/assets/modulo-encomendas.jpg";
import avaliacoesHero from "@/assets/modulo-avaliacoes.jpg";
import metricasHero from "@/assets/modulo-metricas.jpg";
import vitrineHero from "@/assets/modulo-vitrine-digital.jpg";
import comandaHero from "@/assets/modulo-comanda-digital.jpg";
import mesasHero from "@/assets/modulo-controle-de-mesas.jpg";
import eventosHero from "@/assets/modulo-reserva-de-eventos.jpg";
import agendaHero from "@/assets/modulo-agenda-de-funcionarios.jpg";

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

  "chamado-de-garcom": {
    slug: "chamado-de-garcom",
    moduleName: "Chamado de Garçom",
    title: "Chamado de Garçom",
    subtitle: "O cliente chama pela mesa e a equipe recebe na hora.",
    description:
      "Acabe com o cliente levantando o braço no salão. Com um toque no celular ele solicita atendimento, a conta ou um pedido — e o chamado aparece em tempo real no painel da equipe, já identificado pela mesa.",
    heroImage: garcomHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o Chamado de Garçom",
        body: "É o botão de atendimento digital do seu salão. A partir do QR Code da mesa, o cliente escolhe o tipo de chamado (atendimento, conta ou dúvida) e a solicitação chega instantaneamente ao painel do estabelecimento com som de alerta.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Elimina a espera para ser notado, a irritação de quem não consegue chamar ninguém e a correria da equipe indo e voltando às mesas para perguntar se está tudo bem. Também reduz reclamações de demora no fechamento da conta.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes com salão amplo, bares e cervejarias, cafeterias, pizzarias, hotéis, clubes e casas de show — qualquer operação em que o cliente permaneça sentado e precise chamar a equipe.",
      },
      {
        heading: "Como funciona",
        body: "Cada mesa possui um QR Code próprio. Ao acessá-lo, o cliente vê a tela do estabelecimento com o botão de chamado. O painel admin agrupa os chamados por mesa, mostra o tempo de espera e permite marcar como atendido.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Funciona junto com o Cardápio Digital, o Controle de Mesas e a Comanda Digital: o chamado já vem vinculado à mesa e à comanda aberta, e o tempo de resposta alimenta o painel de Métricas.",
      },
    ],
    features: [
      { icon: "Bell", title: "Botão de chamado", desc: "Um toque para solicitar atendimento na mesa." },
      { icon: "QrCode", title: "Identificação automática", desc: "O painel já sabe de qual mesa veio o chamado." },
      { icon: "Zap", title: "Tempo real", desc: "A solicitação aparece na hora, sem atualizar a página." },
      { icon: "Volume2", title: "Alerta sonoro", desc: "Som de notificação para a equipe não perder chamados." },
      { icon: "Layers", title: "Agrupamento por mesa", desc: "Vários chamados da mesma mesa viram um card com contador." },
      { icon: "Clock", title: "Tempo de resposta", desc: "Acompanhe quanto tempo cada chamado levou para ser atendido." },
      { icon: "ListChecks", title: "Tipos de chamado", desc: "Atendimento, conta, dúvida ou solicitação personalizada." },
      { icon: "Users", title: "Atendente responsável", desc: "Vincule o chamado ao atendente que assumiu a mesa." },
      { icon: "Smartphone", title: "Sem instalar app", desc: "O cliente usa o navegador do próprio celular." },
      { icon: "Palette", title: "Com a sua marca", desc: "Cores e logo do estabelecimento na tela do cliente." },
    ],
    flow: [
      { title: "Cliente escaneia o QR da mesa", desc: "Abre a tela do estabelecimento com as ações disponíveis." },
      { title: "Escolhe o tipo de chamado", desc: "Atendimento, conta ou outra solicitação." },
      { title: "Painel recebe com alerta", desc: "Card da mesa aparece em destaque com som de notificação." },
      { title: "Equipe assume o chamado", desc: "Um atendente marca como em andamento." },
      { title: "Chamado é concluído", desc: "O tempo de resposta fica registrado para análise." },
    ],
    benefits: [
      { icon: "Zap", title: "Atendimento mais ágil", desc: "Ninguém fica esperando ser notado no salão." },
      { icon: "Sparkles", title: "Cliente mais satisfeito", desc: "Sensação de controle e atenção durante toda a refeição." },
      { icon: "TrendingUp", title: "Mais giro de mesas", desc: "Contas fechadas mais rápido liberam a mesa antes." },
      { icon: "Users", title: "Equipe organizada", desc: "A fila de chamados substitui a correria improvisada." },
      { icon: "Clock", title: "Indicadores reais", desc: "Meça o tempo médio de resposta por turno." },
      { icon: "ShieldCheck", title: "Menos reclamações", desc: "Reduz avaliações negativas por demora no atendimento." },
    ],
    useCases: [
      "Restaurantes com salão amplo",
      "Bares e cervejarias",
      "Cafeterias",
      "Hotéis e pousadas",
      "Clubes e casas de show",
      "Food halls",
    ],
    integrations: ["Cardápio Digital", "Controle de Mesas", "Comanda Digital", "Pedidos na Cozinha", "Métricas em Tempo Real"],
    faq: [
      { q: "O cliente precisa de aplicativo?", a: "Não. Basta escanear o QR Code da mesa e usar o navegador do celular." },
      { q: "E se a mesma mesa chamar várias vezes?", a: "Os chamados são agrupados em um único card com um contador, evitando duplicidade no painel." },
      { q: "A equipe é avisada com som?", a: "Sim. É possível ativar o alerta sonoro nas configurações de notificações do estabelecimento." },
      { q: "Consigo saber quem atendeu?", a: "Sim. O chamado pode ser vinculado ao atendente responsável pela mesa." },
      { q: "Funciona em tablets no salão?", a: "Sim. O painel é responsivo e funciona em computador, tablet ou celular da equipe." },
      { q: "Dá para medir o tempo de atendimento?", a: "Sim. Cada chamado registra o horário de abertura, de atendimento e o tempo total de resposta." },
    ],
    cta: {
      title: "Deixe seu salão mais ágil",
      desc: "Ative o chamado de garçom e receba as solicitações das mesas em tempo real.",
    },
  },

  "pedidos-na-cozinha": {
    slug: "pedidos-na-cozinha",
    moduleName: "Pedidos na Cozinha",
    title: "Pedidos na Cozinha",
    subtitle: "Do cliente direto para a produção, sem retrabalho.",
    description:
      "O pedido sai do celular do cliente ou do atendente e chega imediatamente à cozinha com itens, combinações e observações — sem papel, sem letra ilegível e sem item esquecido.",
    heroImage: cozinhaHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o módulo de Pedidos",
        body: "É o fluxo completo do pedido dentro da plataforma: montagem do item com opções e adicionais, envio, acompanhamento de status (confirmado, em preparo, pronto, entregue) e histórico para consulta.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Acaba com comandas de papel perdidas, pedidos digitados duas vezes e divergências entre o que o cliente pediu e o que chegou à mesa. Reduz erros de produção e retrabalho na cozinha.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes à la carte, hamburguerias, pizzarias, lanchonetes, cozinhas com alto volume e operações que trabalham com montagem de pratos e combinações.",
      },
      {
        heading: "Como funciona",
        body: "Você cadastra os itens de pedido e os grupos de combinação (ponto da carne, acompanhamentos, adicionais, tamanho). O cliente monta o pedido, confirma e a cozinha acompanha tudo em um painel organizado por status.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Consome o mesmo catálogo do Cardápio Digital, alimenta a Comanda Digital com os itens lançados e envia os totais para as Métricas de faturamento e ticket médio.",
      },
    ],
    features: [
      { icon: "ClipboardList", title: "Painel por status", desc: "Confirmado, em preparo, pronto e entregue em colunas claras." },
      { icon: "Layers", title: "Grupos de combinação", desc: "Ponto, tamanho, acompanhamentos e adicionais com regras próprias." },
      { icon: "FileText", title: "Observações do cliente", desc: "Sem cebola, ao ponto, embalar para viagem — tudo registrado." },
      { icon: "Zap", title: "Atualização em tempo real", desc: "A cozinha vê o pedido no instante em que é confirmado." },
      { icon: "Clock", title: "Tempo por etapa", desc: "Saiba quanto tempo cada pedido levou em cada fase." },
      { icon: "Tag", title: "Preço por adicional", desc: "Cada opção pode somar valor automaticamente ao total." },
      { icon: "ShieldCheck", title: "Preço validado no servidor", desc: "O valor é recalculado no backend, sem risco de adulteração." },
      { icon: "Smartphone", title: "Acompanhamento do cliente", desc: "Tela de status do pedido para o próprio cliente consultar." },
      { icon: "ListChecks", title: "Itens obrigatórios", desc: "Defina mínimos e máximos de seleção por grupo." },
      { icon: "BarChart3", title: "Ranking de vendas", desc: "Descubra os itens que mais saem e os que travam a operação." },
    ],
    flow: [
      { title: "Cliente escolhe o item", desc: "Direto do cardápio digital, na mesa ou pelo link." },
      { title: "Monta as combinações", desc: "Ponto, acompanhamentos, adicionais e observações." },
      { title: "Confirma o pedido", desc: "O total é calculado e validado no servidor." },
      { title: "Cozinha recebe na hora", desc: "O card entra no painel com todos os detalhes." },
      { title: "Status avança", desc: "Em preparo, pronto e entregue, visível para todos." },
      { title: "Pedido vai para a comanda", desc: "Os itens somam automaticamente no fechamento da mesa." },
    ],
    benefits: [
      { icon: "ShieldCheck", title: "Menos erros de produção", desc: "O que o cliente escolheu é exatamente o que a cozinha lê." },
      { icon: "Zap", title: "Fluxo mais rápido", desc: "Sem intermediários entre o pedido e a produção." },
      { icon: "TrendingUp", title: "Ticket médio maior", desc: "Adicionais e combinações sugeridos no momento da escolha." },
      { icon: "Wallet", title: "Menos desperdício", desc: "Pratos refeitos por engano deixam de custar caro." },
      { icon: "Clock", title: "Controle de tempo", desc: "Identifique gargalos por etapa e por horário." },
      { icon: "Sparkles", title: "Experiência consistente", desc: "O cliente acompanha o preparo sem precisar perguntar." },
    ],
    useCases: [
      "Restaurantes à la carte",
      "Hamburguerias",
      "Pizzarias",
      "Lanchonetes e food trucks",
      "Praças de alimentação",
      "Cozinhas de hotel",
    ],
    integrations: ["Cardápio Digital", "Comanda Digital", "Controle de Mesas", "Chamado de Garçom", "Métricas em Tempo Real"],
    faq: [
      { q: "A cozinha precisa de um computador dedicado?", a: "Não é obrigatório, mas recomendamos uma tela fixa (TV, tablet ou notebook) exibindo o painel de pedidos." },
      { q: "Consigo criar adicionais pagos?", a: "Sim. Cada opção de um grupo de combinação pode ter um valor adicional que soma automaticamente ao pedido." },
      { q: "O cliente pode acompanhar o pedido?", a: "Sim. Existe uma tela de status onde ele vê quando o pedido foi confirmado, entrou em preparo e ficou pronto." },
      { q: "Dá para bloquear itens indisponíveis?", a: "Sim. Basta desativar o item no painel para que ele deixe de ser oferecido." },
      { q: "O preço pode ser manipulado pelo cliente?", a: "Não. O valor final é sempre recalculado no servidor a partir do cadastro oficial dos produtos." },
      { q: "Funciona para pedidos feitos pelo garçom?", a: "Sim. A equipe pode lançar pedidos pelo painel, vinculando-os à mesa e à comanda correspondente." },
    ],
    cta: {
      title: "Ligue cliente e cozinha em um só fluxo",
      desc: "Ative o módulo de pedidos e elimine o papel da sua operação.",
    },
  },

  reservas: {
    slug: "reservas",
    moduleName: "Reservas",
    title: "Reservas",
    subtitle: "Agenda organizada, confirmação rápida e nenhuma mesa perdida.",
    description:
      "Receba reservas pelo link do seu estabelecimento, confirme com um clique e acompanhe a agenda do dia sem caderno, planilha ou conversa perdida no WhatsApp.",
    heroImage: reservasHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o módulo de Reservas",
        body: "É a agenda digital do seu salão. O cliente escolhe data, horário e número de pessoas em uma página com a sua marca, e a solicitação entra no painel para ser confirmada, ajustada ou recusada.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Acaba com reservas anotadas em papel, dupla marcação no mesmo horário, cliente que aparece sem registro e a dificuldade de saber quantas pessoas são esperadas hoje à noite.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes com alta demanda, casas de jantar, pizzarias, churrascarias, bares com programação, hotéis e qualquer estabelecimento que trabalhe com horários marcados.",
      },
      {
        heading: "Como funciona",
        body: "Você divulga o link ou QR Code de reservas. Cada solicitação gera um código único; o painel mostra o status (pendente, confirmada, concluída ou cancelada) e permite responder o cliente pelo WhatsApp em um clique.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Conversa com o Controle de Mesas para alocar o grupo na chegada, com a Fila de Espera para os clientes sem reserva e com as Métricas para acompanhar ocupação e no-show.",
      },
    ],
    features: [
      { icon: "CalendarCheck", title: "Agenda por data e horário", desc: "Visualize rapidamente o movimento previsto de cada dia." },
      { icon: "Tag", title: "Código da reserva", desc: "Cada reserva recebe um código único para consulta do cliente." },
      { icon: "MessageCircle", title: "Confirmação por WhatsApp", desc: "Envie a confirmação com um clique, sem digitar mensagem." },
      { icon: "Search", title: "Consulta pelo telefone", desc: "O cliente acompanha a reserva informando o próprio número." },
      { icon: "Users", title: "Tamanho do grupo", desc: "Saiba quantas pessoas esperar em cada horário." },
      { icon: "ListChecks", title: "Status controlado", desc: "Pendente, confirmada, concluída e cancelada em um só lugar." },
      { icon: "FileText", title: "Observações internas", desc: "Aniversário, cadeirante, mesa preferida — só a equipe vê." },
      { icon: "Clock", title: "Foco no futuro", desc: "A tela abre nas reservas confirmadas que ainda vão acontecer." },
      { icon: "Palette", title: "Página com a sua marca", desc: "Cores, logo e banner do estabelecimento no formulário." },
      { icon: "Zap", title: "Atualização em tempo real", desc: "Toda a equipe vê a mesma agenda no mesmo instante." },
    ],
    flow: [
      { title: "Cliente abre o link de reservas", desc: "Pelo Instagram, WhatsApp, Google ou QR Code." },
      { title: "Escolhe data, hora e pessoas", desc: "Formulário simples com a identidade do estabelecimento." },
      { title: "Reserva entra como pendente", desc: "O painel avisa a equipe da nova solicitação." },
      { title: "Equipe confirma ou ajusta", desc: "Um clique confirma e dispara a mensagem ao cliente." },
      { title: "Chegada é registrada", desc: "A reserva vira atendimento e a mesa é alocada." },
      { title: "Histórico alimenta relatórios", desc: "Ocupação, horários de pico e cancelamentos." },
    ],
    benefits: [
      { icon: "TrendingUp", title: "Mais mesas ocupadas", desc: "Reserve com previsibilidade e reduza cadeiras vazias." },
      { icon: "ShieldCheck", title: "Zero dupla marcação", desc: "Uma única agenda compartilhada por toda a equipe." },
      { icon: "Clock", title: "Menos tempo no telefone", desc: "O cliente reserva sozinho, a qualquer hora." },
      { icon: "Sparkles", title: "Recepção preparada", desc: "A casa já sabe o nome, o horário e o tamanho do grupo." },
      { icon: "Wallet", title: "Melhor planejamento", desc: "Compras e escala de equipe alinhadas à demanda prevista." },
      { icon: "Users", title: "Relacionamento", desc: "Histórico do cliente para tratar habitués como habitués." },
    ],
    useCases: [
      "Restaurantes de jantar",
      "Churrascarias e rodízios",
      "Bares com programação ao vivo",
      "Pizzarias movimentadas",
      "Hotéis e pousadas",
      "Espaços gastronômicos",
    ],
    integrations: ["Controle de Mesas", "Fila de Espera", "Cardápio Digital", "Reserva de Eventos", "Métricas em Tempo Real"],
    faq: [
      { q: "O cliente precisa criar conta para reservar?", a: "Não. Ele informa nome, telefone, data, horário e número de pessoas — nada além disso." },
      { q: "Como o cliente acompanha a reserva?", a: "Pelo código gerado ou consultando pelo telefone informado no momento da reserva." },
      { q: "Consigo recusar uma reserva?", a: "Sim. É possível cancelar com uma justificativa e avisar o cliente pelo WhatsApp." },
      { q: "Dá para anotar detalhes internos?", a: "Sim. Existem observações visíveis apenas para a equipe, como aniversário ou preferência de mesa." },
      { q: "As reservas antigas somem?", a: "Não. Elas ficam no histórico; a tela apenas prioriza as confirmadas que ainda vão acontecer." },
      { q: "Funciona junto com a fila de espera?", a: "Sim. Reservas garantem horário e a fila organiza quem chega sem reserva." },
    ],
    cta: {
      title: "Organize sua agenda de reservas",
      desc: "Publique seu link de reservas e receba solicitações já no primeiro dia.",
    },
  },

  "fila-de-espera": {
    slug: "fila-de-espera",
    moduleName: "Fila de Espera",
    title: "Fila de Espera",
    subtitle: "Fila digital, sem aglomeração na porta.",
    description:
      "Cadastre quem chega, informe a posição e o tempo estimado e chame o cliente quando a mesa liberar — tudo pelo celular, sem gritar nomes nem entregar senha de papel.",
    heroImage: filaHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é a Fila de Espera",
        body: "É a substituição digital da senha de papel. Cada cliente recebe um código, acompanha a posição pelo celular e é chamado quando a mesa está pronta, sem precisar ficar parado na entrada.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Elimina aglomeração na porta, discussões sobre quem chegou primeiro, clientes que desistem por não saber o tempo de espera e a recepção sobrecarregada anotando nomes em papel.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes concorridos, rodízios, hamburguerias, cafés de brunch, praças de alimentação e qualquer casa que forme fila nos fins de semana.",
      },
      {
        heading: "Como funciona",
        body: "A recepção (ou o próprio cliente pelo QR Code) cadastra nome, telefone e número de pessoas. A plataforma calcula a posição, mostra o tempo estimado e registra os status: aguardando, chamado, sentado ou cancelado.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Trabalha lado a lado com Reservas e Controle de Mesas: quando uma mesa é liberada no mapa do salão, o próximo da fila pode ser chamado imediatamente.",
      },
    ],
    features: [
      { icon: "Users", title: "Posição na fila", desc: "Ordem automática por horário de chegada." },
      { icon: "Clock", title: "Tempo estimado", desc: "Previsão de espera informada ao cliente." },
      { icon: "Tag", title: "Código de acompanhamento", desc: "Cada entrada recebe um código único." },
      { icon: "BellRing", title: "Chamada do cliente", desc: "Marque como chamado e registre o horário." },
      { icon: "Smartphone", title: "Consulta pelo celular", desc: "O cliente vê a posição sem voltar até a recepção." },
      { icon: "ShieldCheck", title: "Dados protegidos", desc: "Telefones exibidos de forma mascarada nas telas públicas." },
      { icon: "ListChecks", title: "Status completo", desc: "Aguardando, chamado, sentado e cancelado." },
      { icon: "Zap", title: "Atualização em tempo real", desc: "Toda a equipe vê a mesma fila simultaneamente." },
      { icon: "FileText", title: "Observações", desc: "Preferência de área, cadeirinha, acessibilidade." },
      { icon: "BarChart3", title: "Histórico de espera", desc: "Tempo médio por dia e por faixa de horário." },
    ],
    flow: [
      { title: "Cliente chega e entra na fila", desc: "Pela recepção ou escaneando o QR Code da entrada." },
      { title: "Recebe código e posição", desc: "Com o tempo estimado de espera." },
      { title: "Acompanha pelo celular", desc: "Pode dar uma volta sem perder o lugar." },
      { title: "Mesa libera no mapa", desc: "O Controle de Mesas indica a próxima disponível." },
      { title: "Cliente é chamado", desc: "A equipe registra a chamada e acompanha a chegada." },
      { title: "Entrada é concluída", desc: "Status vira sentado e a fila avança automaticamente." },
    ],
    benefits: [
      { icon: "TrendingUp", title: "Menos desistências", desc: "Saber o tempo de espera faz o cliente esperar." },
      { icon: "Sparkles", title: "Entrada organizada", desc: "Sem aglomeração e sem discussão sobre a ordem." },
      { icon: "Clock", title: "Giro mais rápido", desc: "A mesa liberada é ocupada em seguida." },
      { icon: "Users", title: "Recepção aliviada", desc: "Menos perguntas repetidas sobre "quanto falta"." },
      { icon: "ShieldCheck", title: "Justiça na ordem", desc: "Registro digital de quem chegou primeiro." },
      { icon: "BarChart3", title: "Dados para decidir", desc: "Descubra os horários que mais formam fila." },
    ],
    useCases: [
      "Restaurantes concorridos",
      "Rodízios e churrascarias",
      "Hamburguerias",
      "Cafés e brunch de fim de semana",
      "Praças de alimentação",
      "Casas noturnas",
    ],
    integrations: ["Controle de Mesas", "Reservas", "Cardápio Digital", "Métricas em Tempo Real"],
    faq: [
      { q: "O cliente precisa ficar na porta?", a: "Não. Ele acompanha a posição pelo celular e retorna quando for chamado." },
      { q: "Como o cliente consulta a posição?", a: "Pelo código gerado ao entrar na fila ou informando o telefone cadastrado." },
      { q: "Os telefones ficam expostos?", a: "Não. Nas telas públicas os dados de contato aparecem mascarados." },
      { q: "Dá para reorganizar a fila?", a: "Sim. A equipe pode cancelar, chamar novamente ou marcar como sentado a qualquer momento." },
      { q: "Funciona junto com reservas?", a: "Sim. As reservas garantem horário e a fila organiza os clientes que chegam sem reserva." },
      { q: "Consigo saber o tempo médio de espera?", a: "Sim. O histórico registra entrada, chamada e acomodação de cada cliente." },
    ],
    cta: {
      title: "Acabe com a fila na calçada",
      desc: "Ative a fila digital e organize a entrada do seu estabelecimento.",
    },
  },

  encomendas: {
    slug: "encomendas",
    moduleName: "Encomendas",
    title: "Encomendas",
    subtitle: "Pedidos antecipados para retirada, com data e hora combinadas.",
    description:
      "Venda bolos, marmitas, kits e produções sob encomenda com um fluxo próprio: o cliente escolhe os itens, define quando vai retirar, informa a forma de pagamento e acompanha o status até a entrega.",
    heroImage: encomendasHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o módulo de Encomendas",
        body: "É a loja de pedidos antecipados do seu estabelecimento. Diferente do pedido de salão, aqui o cliente compra com antecedência e escolhe a data e o horário de retirada.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Substitui a encomenda combinada por WhatsApp, sem registro e sem histórico. Evita esquecimento de pedidos, confusão de datas e falta de clareza sobre o que foi acordado e quanto foi pago.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Confeitarias, docerias, padarias, casas de marmita, buffets, rotisserias, cafeterias com produção sob demanda e restaurantes que vendem kits para datas comemorativas.",
      },
      {
        heading: "Como funciona",
        body: "O cliente navega pelos produtos liberados para encomenda, monta o carrinho, escolhe data e horário de retirada, informa a forma de pagamento (Pix ou cartão) e envia. O painel controla cada etapa até a entrega.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Usa o mesmo catálogo do Cardápio Digital e funciona mesmo fora do horário de funcionamento do salão, permitindo captar pedidos 24 horas por dia.",
      },
    ],
    features: [
      { icon: "ShoppingBag", title: "Carrinho de encomenda", desc: "Vários itens e quantidades em um único pedido." },
      { icon: "CalendarCheck", title: "Data e hora de retirada", desc: "O cliente define quando vai buscar." },
      { icon: "CreditCard", title: "Pix ou cartão", desc: "Forma de pagamento informada no fechamento." },
      { icon: "Tag", title: "Número do pedido", desc: "Cada encomenda recebe uma numeração sequencial." },
      { icon: "ListChecks", title: "Fluxo de status", desc: "Recebido, confirmado, em preparo, pronto e entregue." },
      { icon: "MessageCircle", title: "Resposta ao cliente", desc: "Envie observações e confirmações direto pelo painel." },
      { icon: "Clock", title: "Fora do horário", desc: "Aceita pedidos mesmo com o salão fechado." },
      { icon: "Search", title: "Consulta por telefone", desc: "O cliente acompanha o pedido pelo próprio número." },
      { icon: "FileText", title: "Observações do pedido", desc: "Recheio, escrita no bolo, restrição alimentar." },
      { icon: "BarChart3", title: "Relatório de vendas", desc: "Volume de encomendas por período e por produto." },
    ],
    flow: [
      { title: "Cliente acessa as encomendas", desc: "Pelo link do estabelecimento ou pelo cardápio." },
      { title: "Monta o carrinho", desc: "Escolhe produtos, quantidades e observações." },
      { title: "Define retirada e pagamento", desc: "Data, horário e forma de pagamento." },
      { title: "Pedido entra no painel", desc: "Com numeração e status de recebido." },
      { title: "Equipe confirma e produz", desc: "Status avança conforme a produção." },
      { title: "Cliente retira", desc: "Pedido é marcado como entregue e vai para o histórico." },
    ],
    benefits: [
      { icon: "TrendingUp", title: "Nova fonte de receita", desc: "Venda além do salão, com produção planejada." },
      { icon: "Wallet", title: "Produção sob demanda", desc: "Compre insumos com base em pedidos já fechados." },
      { icon: "ShieldCheck", title: "Nada se perde", desc: "Todo pedido fica registrado com data, itens e valor." },
      { icon: "Clock", title: "Vendas 24 horas", desc: "O cliente encomenda mesmo com a casa fechada." },
      { icon: "Sparkles", title: "Experiência clara", desc: "O cliente acompanha o status sem precisar ligar." },
      { icon: "Users", title: "Equipe organizada", desc: "A produção do dia aparece por horário de retirada." },
    ],
    useCases: [
      "Confeitarias e docerias",
      "Padarias",
      "Casas de marmita",
      "Buffets e rotisserias",
      "Cafeterias com produção própria",
      "Kits de datas comemorativas",
    ],
    integrations: ["Cardápio Digital", "Pedidos na Cozinha", "Métricas em Tempo Real", "Avaliações"],
    faq: [
      { q: "O cliente paga pelo site?", a: "Ele informa a forma de pagamento (Pix ou cartão) e a cobrança é combinada pelo estabelecimento na confirmação ou na retirada." },
      { q: "Funciona com o estabelecimento fechado?", a: "Sim. As encomendas são independentes do horário de funcionamento do salão." },
      { q: "Posso escolher quais produtos aceitam encomenda?", a: "Sim. Cada produto tem um controle próprio que define se ele aparece na loja de encomendas." },
      { q: "Como aviso o cliente que o pedido está pronto?", a: "Você atualiza o status no painel e pode enviar uma resposta ao cliente, que também consulta pelo telefone." },
      { q: "Dá para limitar horários de retirada?", a: "Sim. As configurações do módulo permitem definir os períodos disponíveis para retirada." },
      { q: "Existe histórico das encomendas?", a: "Sim. Todos os pedidos ficam registrados com itens, valores, datas e status." },
    ],
    cta: {
      title: "Comece a vender por encomenda",
      desc: "Ative o módulo e receba pedidos antecipados com data e hora marcadas.",
    },
  },

  avaliacoes: {
    slug: "avaliacoes",
    moduleName: "Avaliações",
    title: "Avaliações",
    subtitle: "Ouça o cliente antes que ele fale na internet.",
    description:
      "Colete notas sobre ambiente, atendimento e comida direto na mesa, responda cada cliente pelo painel e transforme feedback em melhoria — e em destaque para quem elogia.",
    heroImage: avaliacoesHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o módulo de Avaliações",
        body: "É o canal de feedback do seu estabelecimento. Ao final da experiência, o cliente avalia ambiente, atendimento e comida, deixa um comentário e a equipe responde diretamente pela plataforma.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Evita que a crítica apareça primeiro em redes sociais e aplicativos de avaliação. Dá visibilidade a problemas recorrentes e permite recuperar um cliente insatisfeito antes que ele vá embora sem falar nada.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Qualquer estabelecimento que dependa de reputação: restaurantes, bares, cafeterias, hotéis, pousadas e redes que precisam comparar a percepção do cliente entre unidades.",
      },
      {
        heading: "Como funciona",
        body: "O cliente acessa a página de avaliação pelo QR Code da mesa ou por um link após o pedido. As notas são registradas com uma média geral e o painel permite responder, destacar depoimentos e acompanhar a evolução.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Aparece como ação nas telas do cliente (mesa, cardápio e status do pedido) e envia os indicadores de satisfação para o painel de Métricas.",
      },
    ],
    features: [
      { icon: "Star", title: "Notas por critério", desc: "Ambiente, atendimento e comida avaliados separadamente." },
      { icon: "BarChart3", title: "Média geral", desc: "Nota consolidada calculada automaticamente." },
      { icon: "MessageCircle", title: "Resposta ao cliente", desc: "Responda cada avaliação diretamente pelo painel." },
      { icon: "Sparkles", title: "Depoimentos em destaque", desc: "Marque os melhores comentários para exibição." },
      { icon: "ShieldCheck", title: "Contato protegido", desc: "Telefone do cliente exibido de forma mascarada." },
      { icon: "ListChecks", title: "Status de tratativa", desc: "Saiba o que já foi respondido e o que está pendente." },
      { icon: "Search", title: "Busca e filtros", desc: "Encontre avaliações por nota, período ou palavra." },
      { icon: "QrCode", title: "Acesso por QR Code", desc: "Avaliação a um toque na mesa ou na conta." },
      { icon: "Palette", title: "Com a sua identidade", desc: "Formulário nas cores do estabelecimento." },
      { icon: "TrendingUp", title: "Evolução no tempo", desc: "Acompanhe se a percepção está melhorando." },
    ],
    flow: [
      { title: "Cliente termina a experiência", desc: "Após o pedido ou no fechamento da conta." },
      { title: "Acessa o formulário", desc: "Pelo QR Code da mesa ou link enviado." },
      { title: "Dá notas e comenta", desc: "Ambiente, atendimento, comida e observações." },
      { title: "Painel recebe a avaliação", desc: "Com média calculada e status pendente." },
      { title: "Equipe responde", desc: "Agradece o elogio ou trata a reclamação." },
      { title: "Insights viram ação", desc: "Padrões repetidos indicam o que corrigir." },
    ],
    benefits: [
      { icon: "ShieldCheck", title: "Reputação protegida", desc: "Resolva internamente antes de virar nota pública." },
      { icon: "TrendingUp", title: "Melhoria contínua", desc: "Dados concretos sobre o que incomoda o cliente." },
      { icon: "Sparkles", title: "Prova social", desc: "Depoimentos positivos para usar na divulgação." },
      { icon: "Users", title: "Equipe reconhecida", desc: "Identifique quem está encantando os clientes." },
      { icon: "Clock", title: "Feedback imediato", desc: "Saiba do problema ainda no mesmo dia." },
      { icon: "Wallet", title: "Mais recorrência", desc: "Cliente ouvido é cliente que volta." },
    ],
    useCases: ["Restaurantes", "Bares", "Cafeterias", "Hotéis e pousadas", "Redes com várias unidades", "Serviços de buffet"],
    integrations: ["Cardápio Digital", "Chamado de Garçom", "Encomendas", "Métricas em Tempo Real"],
    faq: [
      { q: "A avaliação é anônima?", a: "O cliente informa o nome e, opcionalmente, o telefone. Os dados de contato aparecem mascarados nas telas." },
      { q: "Consigo responder o cliente?", a: "Sim. Cada avaliação pode receber uma resposta registrada com data e responsável." },
      { q: "As avaliações ficam públicas?", a: "Somente as que você marcar como destaque podem ser exibidas; as demais ficam internas." },
      { q: "Quais critérios são avaliados?", a: "Ambiente, atendimento e comida, além de um campo aberto para observações." },
      { q: "Onde o cliente acessa o formulário?", a: "Pelo QR Code da mesa, pela tela do cardápio ou pelo acompanhamento do pedido." },
      { q: "Isso substitui o Google Avaliações?", a: "Não substitui, mas antecipa: você resolve antes e pode convidar clientes satisfeitos a avaliarem publicamente." },
    ],
    cta: {
      title: "Descubra o que seu cliente realmente acha",
      desc: "Ative as avaliações e comece a coletar feedback hoje mesmo.",
    },
  },

  metricas: {
    slug: "metricas",
    moduleName: "Métricas em Tempo Real",
    title: "Métricas em Tempo Real",
    subtitle: "Decisões baseadas em números, não em achismo.",
    description:
      "Acompanhe faturamento, ticket médio, produtos campeões, horários de pico e desempenho do atendimento em um painel que se atualiza junto com a operação.",
    heroImage: metricasHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o painel de Métricas",
        body: "É a central de indicadores do seu estabelecimento. Todos os módulos ativos alimentam o painel: pedidos, comandas, encomendas, reservas, fila, chamados e avaliações.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Acaba com o fechamento no caderno e com a sensação de não saber o que está dando certo. Mostra em números onde está o lucro, o gargalo e o desperdício.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Proprietários e gerentes que precisam decidir cardápio, escala de equipe, compras e promoções com base em dados reais da própria casa.",
      },
      {
        heading: "Como funciona",
        body: "Nada precisa ser digitado duas vezes: cada pedido, comanda e reserva registrada gera automaticamente os indicadores, filtráveis por período.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "É transversal a todos os módulos. Quanto mais módulos ativos, mais completo fica o retrato da operação.",
      },
    ],
    features: [
      { icon: "BarChart3", title: "Faturamento por período", desc: "Dia, semana e mês em poucos cliques." },
      { icon: "TrendingUp", title: "Ticket médio", desc: "Valor médio por comanda, mesa ou pedido." },
      { icon: "Star", title: "Produtos campeões", desc: "Ranking dos itens mais vendidos." },
      { icon: "Clock", title: "Horários de pico", desc: "Descubra quando sua casa realmente enche." },
      { icon: "Users", title: "Desempenho da equipe", desc: "Atendimentos e tempo de resposta por atendente." },
      { icon: "ListChecks", title: "Volume por módulo", desc: "Pedidos, reservas, encomendas, chamados e fila." },
      { icon: "Zap", title: "Atualização em tempo real", desc: "Os números acompanham o movimento do salão." },
      { icon: "Search", title: "Filtros por data", desc: "Compare períodos e identifique tendências." },
      { icon: "ShieldCheck", title: "Dados do seu negócio", desc: "Cada estabelecimento vê apenas os próprios números." },
      { icon: "Sparkles", title: "Leitura simples", desc: "Cartões e gráficos claros, sem planilha complexa." },
    ],
    flow: [
      { title: "A operação acontece", desc: "Pedidos, comandas, reservas e chamados são registrados." },
      { title: "Dados são consolidados", desc: "A plataforma calcula os indicadores automaticamente." },
      { title: "Painel é atualizado", desc: "Os números mudam junto com o movimento." },
      { title: "Gestor filtra o período", desc: "Compare hoje com a semana ou o mês anterior." },
      { title: "Decisões são tomadas", desc: "Cardápio, escala, compras e promoções ajustados." },
    ],
    benefits: [
      { icon: "Wallet", title: "Mais margem", desc: "Foque no que vende e corte o que só ocupa espaço." },
      { icon: "Users", title: "Escala inteligente", desc: "Equipe dimensionada pelos horários de pico reais." },
      { icon: "TrendingUp", title: "Crescimento medido", desc: "Saiba se a ação de marketing realmente funcionou." },
      { icon: "Clock", title: "Fechamento rápido", desc: "Sem somar comandas manualmente no fim do dia." },
      { icon: "ShieldCheck", title: "Menos perdas", desc: "Desvios aparecem rápido nos números." },
      { icon: "Sparkles", title: "Gestão profissional", desc: "Indicadores de rede, mesmo com uma unidade só." },
    ],
    useCases: ["Proprietários", "Gerentes de operação", "Redes com várias unidades", "Franquias", "Consultorias de food service"],
    integrations: ["Cardápio Digital", "Pedidos na Cozinha", "Comanda Digital", "Reservas", "Fila de Espera", "Avaliações"],
    faq: [
      { q: "Preciso digitar dados no painel?", a: "Não. Todos os indicadores vêm automaticamente da operação registrada nos outros módulos." },
      { q: "Os números atualizam quando?", a: "Em tempo real, conforme pedidos, comandas e chamados são registrados." },
      { q: "Consigo filtrar por período?", a: "Sim. É possível analisar por dia, semana, mês ou intervalo personalizado." },
      { q: "Outro estabelecimento vê meus números?", a: "Não. Os dados são isolados por estabelecimento, com regras de segurança no banco." },
      { q: "Funciona com poucos módulos ativos?", a: "Sim, mas o painel fica mais rico à medida que você ativa mais módulos." },
      { q: "Dá para acompanhar pelo celular?", a: "Sim. O painel é responsivo e pode ser consultado de qualquer lugar." },
    ],
    cta: {
      title: "Enxergue seu negócio em números",
      desc: "Ative a plataforma e acompanhe os indicadores da sua operação em tempo real.",
    },
  },

  "vitrine-digital": {
    slug: "vitrine-digital",
    moduleName: "Vitrine Digital",
    title: "Vitrine Digital",
    subtitle: "Seus produtos em rotação na TV, vendendo o tempo todo.",
    description:
      "Transforme qualquer televisão em uma vitrine de vendas: fotos, nomes e preços dos produtos que você escolher, em três modelos de exibição, atualizados direto do seu cardápio.",
    heroImage: vitrineHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é a Vitrine Digital",
        body: "É um painel de exibição feito para telas grandes. Basta abrir o link da vitrine na TV ou em um dispositivo conectado a ela para que os produtos entrem em rotação automática.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Substitui cartazes impressos e quadros de giz desatualizados. Elimina o custo de produzir material gráfico a cada promoção e dá visibilidade aos itens de maior margem.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Cafeterias, padarias, lanchonetes, sorveterias, food halls, balcões de autoatendimento e casas que têm fila no caixa — momento perfeito para influenciar a escolha.",
      },
      {
        heading: "Como funciona",
        body: "Cada produto tem um controle de exibição na vitrine. Você escolhe o modelo (Cinema, Split ou Mosaico), abre o link em tela cheia na TV e a rotação começa automaticamente.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Usa as mesmas fotos e preços do Cardápio Digital: alterou o valor no painel, a TV mostra o novo preço na próxima rotação.",
      },
    ],
    features: [
      { icon: "Tv", title: "Três modelos", desc: "Cinema, Split e Mosaico para diferentes ambientes." },
      { icon: "Play", title: "Rotação automática", desc: "Os produtos passam sozinhos, sem operador." },
      { icon: "EyeOff", title: "Seleção por produto", desc: "Escolha exatamente o que aparece na tela." },
      { icon: "Image", title: "Fotos em destaque", desc: "Imagens grandes e valorizadas na tela cheia." },
      { icon: "Tag", title: "Preço e promoção", desc: "Valor atual e promocional exibidos com clareza." },
      { icon: "RefreshCw", title: "Sempre atualizado", desc: "Alterou no cardápio, muda na TV." },
      { icon: "Palette", title: "Cores do estabelecimento", desc: "A vitrine respeita a identidade da marca." },
      { icon: "Globe", title: "Basta um link", desc: "Funciona em Smart TV, TV Box, notebook ou tablet." },
      { icon: "Clock", title: "Tempo de exibição", desc: "Configure a velocidade da rotação." },
      { icon: "Sparkles", title: "Destaques da casa", desc: "Priorize combos e itens de maior margem." },
    ],
    flow: [
      { title: "Marque os produtos", desc: "Ative a exibição na vitrine para os itens escolhidos." },
      { title: "Escolha o modelo", desc: "Cinema, Split ou Mosaico conforme a tela." },
      { title: "Abra o link na TV", desc: "Em tela cheia, no navegador do dispositivo." },
      { title: "A rotação começa", desc: "Produtos passam automaticamente, sem intervenção." },
      { title: "Atualize quando quiser", desc: "Mudanças no cardápio refletem na exibição." },
    ],
    benefits: [
      { icon: "TrendingUp", title: "Venda por impulso", desc: "Imagens grandes despertam o desejo na hora da escolha." },
      { icon: "Wallet", title: "Zero material gráfico", desc: "Sem impressão de cartazes a cada promoção." },
      { icon: "Zap", title: "Troca instantânea", desc: "Mude a oferta em segundos, de qualquer lugar." },
      { icon: "Sparkles", title: "Ambiente moderno", desc: "Um visual profissional para o seu balcão." },
      { icon: "Clock", title: "Fila mais leve", desc: "Quem espera se distrai e já decide o pedido." },
      { icon: "Star", title: "Destaque estratégico", desc: "Coloque em evidência os itens que você quer vender." },
    ],
    useCases: ["Cafeterias", "Padarias", "Sorveterias", "Lanchonetes", "Food halls", "Balcões de autoatendimento"],
    integrations: ["Cardápio Digital", "Encomendas", "Métricas em Tempo Real"],
    faq: [
      { q: "Preciso de um equipamento especial?", a: "Não. Qualquer Smart TV com navegador, TV Box, notebook ou tablet conectado à televisão funciona." },
      { q: "Todos os produtos aparecem?", a: "Não. Você define produto por produto quais devem ser exibidos na vitrine." },
      { q: "Quais são os três modelos?", a: "Cinema (uma imagem em tela cheia), Split (produto em destaque com lista lateral) e Mosaico (vários produtos simultaneamente)." },
      { q: "A vitrine funciona offline?", a: "Não. É necessária conexão com a internet para carregar e atualizar os produtos." },
      { q: "Consigo mudar o tempo de cada produto?", a: "Sim. A velocidade da rotação é configurável nas opções do módulo." },
      { q: "As promoções aparecem?", a: "Sim. Quando há preço promocional cadastrado, ele é exibido em destaque." },
    ],
    cta: {
      title: "Transforme sua TV em vendedora",
      desc: "Ative a Vitrine Digital e coloque seus produtos em rotação hoje.",
    },
  },

  "comanda-digital": {
    slug: "comanda-digital",
    moduleName: "Comanda Digital",
    title: "Comanda Digital",
    subtitle: "Várias comandas por mesa, com fechamento individual.",
    description:
      "Mesa 10 com quatro grupos diferentes? Abra 10.01, 10.02, 10.03 e feche cada uma separadamente, com o total calculado automaticamente a cada item lançado.",
    heroImage: comandaHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é a Comanda Digital",
        body: "É o controle de consumo por comanda dentro de cada mesa. Cada comanda recebe um código no formato {mesa}.{sequência}, acumula os itens lançados e pode ser fechada de forma independente.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Resolve a dor clássica do bar cheio: várias pessoas na mesma mesa querendo pagar separado. Elimina soma manual, comanda de papel rasurada e discussão sobre quem consumiu o quê.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Bares, cervejarias, casas noturnas, restaurantes com mesas compartilhadas, food halls e qualquer operação em que um mesmo espaço atenda grupos distintos.",
      },
      {
        heading: "Como funciona",
        body: "A equipe abre uma comanda na mesa, com nome ou identificação do cliente. Os itens lançados somam automaticamente ao total. Ao pedir a conta, a comanda muda de status e pode ser fechada isoladamente.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Recebe os itens do módulo de Pedidos, é vinculada à mesa do Controle de Mesas e envia o consumo consolidado para as Métricas.",
      },
    ],
    features: [
      { icon: "Receipt", title: "Código {mesa}.{sequência}", desc: "10.01, 10.02, 10.03 — fácil de identificar no salão." },
      { icon: "Layers", title: "Várias por mesa", desc: "Quantas comandas forem necessárias no mesmo espaço." },
      { icon: "Wallet", title: "Total automático", desc: "Cada item lançado recalcula o valor da comanda." },
      { icon: "ListChecks", title: "Status da comanda", desc: "Aberta, conta solicitada e fechada." },
      { icon: "Users", title: "Nome do cliente", desc: "Identifique cada comanda por pessoa ou grupo." },
      { icon: "Printer", title: "Impressão da conta", desc: "Extrato da comanda pronto para entregar ao cliente." },
      { icon: "Zap", title: "Tempo real", desc: "A equipe inteira acompanha o mesmo estado da mesa." },
      { icon: "Tag", title: "Adicionais somados", desc: "Combinações e adicionais entram no cálculo." },
      { icon: "FileText", title: "Observações", desc: "Anotações internas por comanda." },
      { icon: "Clock", title: "Tempo de permanência", desc: "Da abertura ao fechamento, tudo registrado." },
    ],
    flow: [
      { title: "Mesa é ocupada", desc: "A equipe registra a chegada do grupo." },
      { title: "Comandas são abertas", desc: "Uma para cada pessoa ou subgrupo da mesa." },
      { title: "Itens são lançados", desc: "Pelo garçom ou vindos do pedido do cliente." },
      { title: "Total é recalculado", desc: "Automaticamente a cada item ou adicional." },
      { title: "Cliente pede a conta", desc: "A comanda muda de status e pode ser impressa." },
      { title: "Fechamento individual", desc: "Cada comanda é encerrada sem afetar as demais." },
    ],
    benefits: [
      { icon: "ShieldCheck", title: "Fim da soma errada", desc: "O total é calculado pelo sistema, não na calculadora." },
      { icon: "Zap", title: "Fechamento mais rápido", desc: "Cada grupo paga quando quiser ir embora." },
      { icon: "TrendingUp", title: "Mais giro", desc: "Mesas liberadas antes, com menos atrito no caixa." },
      { icon: "Users", title: "Clientes satisfeitos", desc: "Sem discussão sobre divisão de conta." },
      { icon: "Wallet", title: "Menos perdas", desc: "Consumo registrado item a item, sem esquecimento." },
      { icon: "Clock", title: "Equipe focada", desc: "Menos tempo conferindo papel, mais tempo atendendo." },
    ],
    useCases: ["Bares e cervejarias", "Casas noturnas", "Restaurantes com mesas compartilhadas", "Food halls", "Clubes", "Eventos"],
    integrations: ["Controle de Mesas", "Pedidos na Cozinha", "Cardápio Digital", "Chamado de Garçom", "Métricas em Tempo Real"],
    faq: [
      { q: "Quantas comandas posso abrir por mesa?", a: "Não há limite fixo. A sequência avança automaticamente: 10.01, 10.02, 10.03 e assim por diante." },
      { q: "Consigo fechar só uma comanda da mesa?", a: "Sim. Esse é o objetivo do módulo: cada comanda tem fechamento independente." },
      { q: "O total é calculado sozinho?", a: "Sim. Um gatilho no banco recalcula o total sempre que um item ou adicional é lançado ou removido." },
      { q: "Dá para imprimir a conta?", a: "Sim. O extrato da comanda pode ser impresso em impressora térmica." },
      { q: "Funciona sem o Controle de Mesas?", a: "Funciona, mas a combinação dos dois módulos dá a visão completa do salão." },
      { q: "O cliente vê a própria comanda?", a: "Sim, pelo QR Code da mesa é possível acompanhar o consumo registrado." },
    ],
    cta: {
      title: "Acabe com a confusão na hora da conta",
      desc: "Ative a Comanda Digital e feche cada consumo separadamente.",
    },
  },

  "controle-de-mesas": {
    slug: "controle-de-mesas",
    moduleName: "Controle de Mesas",
    title: "Controle de Mesas",
    subtitle: "O mapa do seu salão em tempo real.",
    description:
      "Monte o layout da sua casa arrastando as mesas, organize por áreas e veja num relance o que está livre, ocupado, aguardando conta ou reservado.",
    heroImage: mesasHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o Controle de Mesas",
        body: "É a planta digital do seu salão. Cada mesa tem número, capacidade, formato, área e posição, e muda de cor conforme o status da operação.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Elimina a pergunta constante \"tem mesa livre?\". Evita alocar um grupo grande em mesa pequena, perder tempo procurando lugar e deixar mesas ociosas com fila na porta.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes com salão médio ou grande, bares com áreas internas e externas, casas com varanda, mezanino ou espaço reservado, e operações com equipe grande de atendimento.",
      },
      {
        heading: "Como funciona",
        body: "Você cria as mesas (individualmente ou em lote), arrasta cada uma para a posição real no mapa e define a área. A partir daí, sessões, chamados e comandas atualizam o status automaticamente.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Cada mesa gera o QR Code usado pelo Cardápio Digital e pelo Chamado de Garçom, recebe as Comandas Digitais e conversa com Reservas e Fila de Espera na hora de acomodar clientes.",
      },
    ],
    features: [
      { icon: "LayoutGrid", title: "Mapa do salão", desc: "Layout visual com a disposição real das mesas." },
      { icon: "Move", title: "Arrastar e soltar", desc: "Posicione cada mesa exatamente como no salão." },
      { icon: "Layers", title: "Áreas customizáveis", desc: "Interno, varanda, mezanino, deck ou o que você quiser." },
      { icon: "Users", title: "Capacidade por mesa", desc: "Aloque grupos no tamanho certo de mesa." },
      { icon: "Zap", title: "Status em tempo real", desc: "Livre, ocupada, conta solicitada ou reservada." },
      { icon: "QrCode", title: "QR Code por mesa", desc: "Gerado automaticamente com número e nome da casa." },
      { icon: "Upload", title: "Criação em lote", desc: "Cadastre dezenas de mesas de uma só vez." },
      { icon: "Receipt", title: "Comandas vinculadas", desc: "Veja o consumo aberto direto pelo mapa." },
      { icon: "Clock", title: "Tempo de ocupação", desc: "Saiba há quanto tempo cada mesa está ocupada." },
      { icon: "Sparkles", title: "Formatos diferentes", desc: "Mesas redondas, quadradas ou retangulares." },
    ],
    flow: [
      { title: "Cadastre as mesas", desc: "Número, nome, capacidade e formato." },
      { title: "Monte o mapa", desc: "Arraste cada mesa para a posição real e defina a área." },
      { title: "Gere os QR Codes", desc: "Um por mesa, pronto para imprimir." },
      { title: "Operação atualiza o status", desc: "Sessões, chamados e comandas mudam as cores no mapa." },
      { title: "Equipe consulta o salão", desc: "Decide onde acomodar o próximo cliente em segundos." },
    ],
    benefits: [
      { icon: "Zap", title: "Decisão instantânea", desc: "Onde sentar o próximo grupo sem caminhar pelo salão." },
      { icon: "TrendingUp", title: "Ocupação otimizada", desc: "Menos mesas ociosas em horário de pico." },
      { icon: "Users", title: "Equipe alinhada", desc: "Todos veem o mesmo estado do salão." },
      { icon: "Clock", title: "Giro controlado", desc: "Identifique mesas paradas há tempo demais." },
      { icon: "ShieldCheck", title: "Menos erros", desc: "Chamados e comandas sempre ligados à mesa correta." },
      { icon: "Sparkles", title: "Operação profissional", desc: "Controle de salão que antes era só de grandes redes." },
    ],
    useCases: ["Restaurantes de salão amplo", "Bares com área externa", "Casas com mezanino ou deck", "Hotéis", "Food halls", "Clubes"],
    integrations: ["Comanda Digital", "Chamado de Garçom", "Reservas", "Fila de Espera", "Cardápio Digital"],
    faq: [
      { q: "Preciso desenhar o salão do zero?", a: "Você cadastra as mesas e as posiciona arrastando no mapa — leva poucos minutos mesmo em salões grandes." },
      { q: "Posso criar várias mesas de uma vez?", a: "Sim. Existe cadastro em lote para criar sequências de mesas rapidamente." },
      { q: "Cada mesa tem QR Code próprio?", a: "Sim, com identificação do número da mesa e do estabelecimento na impressão." },
      { q: "O status muda sozinho?", a: "Sim. Abertura de comanda, chamados e fechamento atualizam o status automaticamente." },
      { q: "Consigo separar áreas do salão?", a: "Sim. Cada mesa pertence a uma área definida por você, como interno, varanda ou deck." },
      { q: "Funciona no celular?", a: "Sim. O mapa é responsivo e pode ser consultado por tablets e celulares da equipe." },
    ],
    cta: {
      title: "Enxergue seu salão inteiro numa tela",
      desc: "Monte o mapa das suas mesas e controle a ocupação em tempo real.",
    },
  },

  "reserva-de-eventos": {
    slug: "reserva-de-eventos",
    moduleName: "Reserva de Eventos",
    title: "Reserva de Eventos",
    subtitle: "Do pedido de orçamento ao evento confirmado.",
    description:
      "Receba solicitações de aniversários, confraternizações corporativas, casamentos e grupos com todos os dados que você precisa para orçar — e acompanhe cada proposta até o fechamento.",
    heroImage: eventosHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é o módulo de Eventos",
        body: "É o funil comercial dos seus eventos. O cliente preenche tipo de evento, data, número de convidados, faixa de orçamento e descrição; você responde com uma proposta e acompanha o status até confirmar.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Acaba com o orçamento perdido no WhatsApp, com o retorno esquecido e com a falta de histórico das negociações. Padroniza as informações necessárias já na primeira mensagem.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Restaurantes com espaço reservado, casas de festa, buffets, cervejarias com área para grupos, hotéis e espaços gastronômicos que vendem confraternizações.",
      },
      {
        heading: "Como funciona",
        body: "Cada solicitação gera um código de reserva e entra como pendente. Você registra o valor do orçamento, os detalhes da proposta e a resposta ao cliente; o status avança até confirmado ou cancelado.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Complementa o módulo de Reservas (que trata do dia a dia) e usa o Cardápio Digital como base para montar menus fechados de evento.",
      },
    ],
    features: [
      { icon: "PartyPopper", title: "Tipos de evento", desc: "Aniversário, corporativo, casamento, grupo e mais." },
      { icon: "Tag", title: "Código do orçamento", desc: "Cada solicitação recebe identificação única." },
      { icon: "Users", title: "Número de convidados", desc: "Dimensione espaço, equipe e produção." },
      { icon: "Wallet", title: "Faixa de orçamento", desc: "Saiba de saída o quanto o cliente pretende investir." },
      { icon: "FileText", title: "Proposta detalhada", desc: "Registre valor e condições da sua oferta." },
      { icon: "MessageCircle", title: "Resposta ao cliente", desc: "Comunique a proposta direto pelo painel." },
      { icon: "ListChecks", title: "Funil de status", desc: "Pendente, orçado, confirmado e cancelado." },
      { icon: "CalendarCheck", title: "Data e horário", desc: "Agenda de eventos separada do movimento diário." },
      { icon: "Search", title: "Histórico completo", desc: "Consulte negociações anteriores a qualquer momento." },
      { icon: "Palette", title: "Formulário com sua marca", desc: "Página de solicitação personalizada." },
    ],
    flow: [
      { title: "Cliente solicita orçamento", desc: "Preenche tipo, data, convidados e descrição." },
      { title: "Pedido entra como pendente", desc: "Com código de reserva gerado automaticamente." },
      { title: "Você monta a proposta", desc: "Valor, condições e detalhes do pacote." },
      { title: "Cliente recebe a resposta", desc: "Comunicação registrada no próprio pedido." },
      { title: "Evento é confirmado", desc: "Status muda e a data entra na agenda." },
      { title: "Histórico fica salvo", desc: "Base para orçar eventos semelhantes no futuro." },
    ],
    benefits: [
      { icon: "TrendingUp", title: "Mais eventos fechados", desc: "Resposta rápida e padronizada aumenta a conversão." },
      { icon: "Wallet", title: "Receita de alto valor", desc: "Um evento equivale a muitos atendimentos de salão." },
      { icon: "ShieldCheck", title: "Nada se perde", desc: "Todo pedido fica registrado com histórico." },
      { icon: "Clock", title: "Menos idas e vindas", desc: "As informações essenciais já vêm no formulário." },
      { icon: "Sparkles", title: "Imagem profissional", desc: "Proposta organizada transmite confiança." },
      { icon: "BarChart3", title: "Previsibilidade", desc: "Agenda de eventos confirmados para planejar compras." },
    ],
    useCases: ["Restaurantes com espaço reservado", "Buffets", "Cervejarias com área para grupos", "Hotéis", "Espaços gastronômicos", "Casas de festa"],
    integrations: ["Reservas", "Cardápio Digital", "Controle de Mesas", "Métricas em Tempo Real"],
    faq: [
      { q: "O cliente vê o preço na hora?", a: "Não. Ele informa a faixa de orçamento pretendida e você envia a proposta com o valor final." },
      { q: "Consigo acompanhar as negociações?", a: "Sim. Cada solicitação tem status (pendente, orçado, confirmado, cancelado) e histórico de respostas." },
      { q: "Qual a diferença para o módulo de Reservas?", a: "Reservas atende o movimento diário do salão; Eventos trata de orçamentos para grupos e datas especiais." },
      { q: "Dá para registrar o valor negociado?", a: "Sim. O painel guarda o valor do orçamento e os detalhes da proposta enviada." },
      { q: "Onde divulgo o formulário?", a: "Pelo link do estabelecimento, redes sociais, WhatsApp ou QR Code impresso na casa." },
      { q: "Recebo eventos com o salão fechado?", a: "Sim. O formulário fica disponível 24 horas por dia." },
    ],
    cta: {
      title: "Transforme pedidos em eventos fechados",
      desc: "Ative o módulo e centralize todos os orçamentos em um só funil.",
    },
  },

  "agenda-de-funcionarios": {
    slug: "agenda-de-funcionarios",
    moduleName: "Agenda de Funcionários",
    title: "Agenda de Funcionários",
    subtitle: "Escala, folgas e ponto da equipe em um só lugar.",
    description:
      "Monte a escala semanal, controle férias e folgas, registre entrada e saída e acompanhe as horas trabalhadas sem planilhas paralelas nem grupo de WhatsApp para trocar turno.",
    heroImage: agendaHero,
    tryPath: "/onboarding",
    about: [
      {
        heading: "O que é a Agenda de Funcionários",
        body: "É o módulo de gestão de equipe: cadastro de funcionários, escala por dia e horário, solicitações de folga e férias e registro de ponto com cálculo de horas.",
      },
      {
        heading: "Quais problemas resolve",
        body: "Elimina escala em papel na parede, dúvida sobre quem trabalha amanhã, folga combinada e esquecida e a dificuldade de saber quantas horas cada pessoa realmente fez no mês.",
      },
      {
        heading: "Para quem foi desenvolvido",
        body: "Estabelecimentos com equipe em turnos: restaurantes, bares, cafeterias, padarias e hotéis, especialmente onde a escala muda toda semana.",
      },
      {
        heading: "Como funciona",
        body: "Você cadastra os funcionários com função, valor-hora e carga semanal, monta a escala por data e horário e registra as marcações de ponto. Folgas e férias passam por aprovação.",
      },
      {
        heading: "Como se integra à plataforma",
        body: "Funcionários podem ser vinculados aos atendentes do salão: ao desativar um colaborador, o atendente correspondente é desativado automaticamente, mantendo o Chamado de Garçom coerente.",
      },
    ],
    features: [
      { icon: "CalendarClock", title: "Escala semanal", desc: "Turnos por data, horário e função." },
      { icon: "Users", title: "Cadastro da equipe", desc: "Função, contato, data de admissão e status." },
      { icon: "Clock", title: "Controle de ponto", desc: "Entrada, saída e intervalos registrados." },
      { icon: "Wallet", title: "Valor-hora", desc: "Base para estimar o custo de cada turno." },
      { icon: "ListChecks", title: "Folgas e férias", desc: "Solicitação, aprovação e histórico." },
      { icon: "BarChart3", title: "Horas trabalhadas", desc: "Somatório por período e por funcionário." },
      { icon: "ShieldCheck", title: "Sincronia com atendentes", desc: "Desativou o funcionário, o atendente sai do salão." },
      { icon: "FileText", title: "Observações", desc: "Anotações por turno ou por colaborador." },
      { icon: "Zap", title: "Atualização em tempo real", desc: "A escala publicada é a mesma para todos." },
      { icon: "Search", title: "Busca e filtros", desc: "Encontre turnos por data, função ou pessoa." },
    ],
    flow: [
      { title: "Cadastre a equipe", desc: "Nome, função, carga horária e valor-hora." },
      { title: "Monte a escala", desc: "Defina turnos por dia e horário." },
      { title: "Equipe consulta", desc: "Todos veem a mesma escala atualizada." },
      { title: "Folgas são solicitadas", desc: "Pedidos entram para aprovação da gestão." },
      { title: "Ponto é registrado", desc: "Entrada, intervalo e saída de cada turno." },
      { title: "Horas são apuradas", desc: "Relatório por período para o fechamento." },
    ],
    benefits: [
      { icon: "Clock", title: "Menos tempo em planilha", desc: "Escala e ponto no mesmo sistema da operação." },
      { icon: "ShieldCheck", title: "Menos conflitos", desc: "Escala oficial registrada, sem versão de bolso." },
      { icon: "Wallet", title: "Custo sob controle", desc: "Acompanhe horas e valor-hora antes de estourar." },
      { icon: "Users", title: "Equipe informada", desc: "Todos sabem quando trabalham e quando folgam." },
      { icon: "TrendingUp", title: "Escala inteligente", desc: "Dimensione o time conforme os horários de pico." },
      { icon: "Sparkles", title: "Gestão organizada", desc: "Histórico completo de turnos, folgas e ponto." },
    ],
    useCases: ["Restaurantes", "Bares e cervejarias", "Cafeterias e padarias", "Hotéis", "Buffets", "Redes com várias unidades"],
    integrations: ["Chamado de Garçom", "Controle de Mesas", "Comanda Digital", "Métricas em Tempo Real"],
    faq: [
      { q: "O funcionário precisa de login?", a: "O cadastro pode existir sem acesso ao sistema; se quiser, você concede acesso com permissões específicas por módulo." },
      { q: "Como funciona o registro de ponto?", a: "Cada turno registra entrada, saída e minutos de intervalo, com cálculo automático das horas trabalhadas." },
      { q: "Folgas precisam de aprovação?", a: "Sim. As solicitações ficam pendentes até que um responsável aprove ou recuse." },
      { q: "Dá para calcular o custo da escala?", a: "Sim. Com o valor-hora cadastrado é possível estimar o custo dos turnos planejados." },
      { q: "O que acontece ao desligar alguém?", a: "Ao desativar o funcionário, o atendente vinculado é automaticamente desativado no salão." },
      { q: "Serve para várias funções?", a: "Sim. Cada turno pode ter uma função definida, como cozinha, salão, caixa ou bar." },
    ],
    cta: {
      title: "Organize a escala da sua equipe",
      desc: "Ative a agenda de funcionários e controle turnos, folgas e ponto em um só painel.",
    },
  },
};

export function getModuleLanding(slug?: string): ModuleLanding | undefined {
  if (!slug) return undefined;
  return MODULE_LANDINGS[slug];
}