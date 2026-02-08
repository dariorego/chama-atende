

## Plano: Criar Landing Page de Vendas em `/vendas`

### Objetivo
Criar uma página de vendas profissional e moderna que apresente a plataforma Chama Atende, seus módulos, benefícios e planos, incentivando novos restaurantes a se cadastrar.

---

### 1. Configuração de Rota

**Arquivo:** `src/App.tsx`

Adicionar a rota `/vendas` como rota global (antes das rotas de tenant):

```tsx
<Route path="/vendas" element={<ThemeProvider><SalesPage /></ThemeProvider>} />
```

Também adicionar `/vendas` à lista de `RESERVED_ROUTES` (se existir) para evitar conflito com slugs de tenant.

---

### 2. Criar Componente SalesPage

**Arquivo:** `src/pages/SalesPage.tsx`

#### Estrutura da Página:

```
Header (fixo com scroll)
├── Logo + Nome
├── Links de navegação (scroll suave)
└── CTA "Começar Grátis"

Hero Section
├── Título principal com gradiente
├── Subtítulo descritivo
├── 2 CTAs (Criar Restaurante + Ver Demonstração)
└── Badges de destaque (100% Web, Tempo Real, Multi-Tenant)

Section: Problema & Solução
├── Ícone ilustrativo
├── Texto do problema
└── Como a plataforma resolve

Section: Módulos (Grid de Cards)
├── Cardápio Digital
├── Chamar Atendente
├── Sistema de Reservas
├── Fila de Espera
├── Pedido para Cozinha
├── Avaliações
└── Sistema de Encomendas

Section: Como Funciona (Steps)
├── 1. Crie sua conta
├── 2. Configure seu restaurante
├── 3. Gere QR Codes
└── 4. Comece a atender

Section: Diferenciais
├── Cards com ícones
├── Hub Centralizado
├── QR Code Inteligente
├── Tempo Real
├── Multi-Tenant Seguro
└── Painel Admin Completo

Section: Planos e Preços
├── Card Starter (Grátis)
├── Card Professional (R$ 99/mês)
└── Card Enterprise (R$ 299/mês)

Section: CTA Final
├── Título motivacional
├── Botão "Criar Restaurante Grátis"
└── Link para demonstração

Footer
├── Links úteis
├── Redes sociais
└── Copyright
```

---

### 3. Componentes de UI a Utilizar

Reutilizar componentes existentes:
- `Button` - CTAs e ações
- `Card` - Módulos e planos
- `Badge` - Destaques e tags
- Ícones do `lucide-react`

Estilos do design system:
- `bg-background`, `bg-surface`, `bg-card`
- `text-foreground`, `text-muted-foreground`
- `border-border`, `border-primary`
- Classes utilitárias: `text-gradient`, `shadow-glow`, `glass`
- Animações: `animate-fade-in`, `animate-slide-up`

---

### 4. Conteúdo das Seções

#### Hero
```
Título: "Transforme seu Restaurante com Tecnologia Inteligente"
Subtítulo: "Cardápio digital, pedidos, reservas, fila de espera e muito mais. 
           Tudo em uma única plataforma 100% web."
```

#### Módulos (7 cards)
Cada módulo com:
- Ícone específico
- Título
- Descrição curta
- Lista de funcionalidades (3-4 itens)
- Tag de plano (Grátis / Pro / Enterprise)

#### Planos
| Plano | Preço | Usuários | Módulos | Features |
|-------|-------|----------|---------|----------|
| Starter | Grátis | 3 | Básicos | Cardápio, Chamar Atendente |
| Professional | R$ 99/mês | 10 | Todos | + Reservas, Fila, Pedidos, Relatórios |
| Enterprise | R$ 299/mês | Ilimitado | Todos | + API, Domínio próprio, Suporte prioritário |

---

### 5. Interatividade

- **Scroll suave** para navegação interna
- **Animações on-scroll** usando classes CSS existentes
- **Hover effects** nos cards
- **Links funcionais:**
  - "Criar Restaurante" → `/onboarding`
  - "Ver Demonstração" → `/bistro-verde` (restaurante demo)
  - "Fazer Login" → `/login`

---

### 6. Responsividade

- **Mobile:** Layout em coluna única, menu hambúrguer
- **Tablet:** Grid 2 colunas para módulos/planos
- **Desktop:** Grid 3-4 colunas, layout expandido

---

### 7. SEO e Acessibilidade

- Tags semânticas (`<header>`, `<main>`, `<section>`, `<footer>`)
- Atributos `aria-label` em elementos interativos
- Meta tags no `index.html` (título, descrição)
- Alt text em imagens

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/SalesPage.tsx` | **Criar** - Componente principal |
| `src/App.tsx` | **Modificar** - Adicionar rota `/vendas` |

---

### Estimativa de Implementação

A página será criada como um único componente `SalesPage.tsx` com aproximadamente 400-500 linhas, utilizando os componentes UI existentes e seguindo o design system estabelecido.

