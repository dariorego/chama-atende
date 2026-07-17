## Módulo Vitrine Digital

Novo módulo que exibe produtos do cardápio em uma TV, em rotação automática. Cada produto ganha um switch para entrar/sair da vitrine, e o admin escolhe entre 3 modelos visuais de exibição.

### 1. Banco de dados
- Adicionar coluna `show_on_display boolean NOT NULL DEFAULT false` em `menu_products`.
- Inserir módulo `vitrine_digital` em `restaurant_modules` para todos os tenants existentes (inativo por padrão) e incluí-lo na função `create-tenant` para novos tenants.
- Settings do módulo (`restaurant_modules.settings`): `{ display_model: 'cinema' | 'split' | 'mosaico', interval_seconds: number, show_price: boolean }`.

### 2. Admin — controles
- **AdminProducts**: nova coluna/switch **"Exibir na Vitrine"** em cada produto (grava `show_on_display`).
- **Nova página `/admin/:slug/vitrine`** (item no sidebar quando o módulo estiver ativo):
  - Seletor visual dos 3 modelos com preview em miniatura.
  - Slider de intervalo de rotação (5s–15s).
  - Toggle "Exibir preço".
  - Contador de produtos elegíveis (ativos + `show_on_display=true`).
  - Botão **"Abrir na TV"** → abre `/:slug/vitrine` em nova aba, tela cheia.
- **AdminModules**: card do novo módulo `vitrine_digital` com ícone `Tv`.

### 3. Tela pública `/:slug/vitrine`
- Rota fullscreen sem chrome do cliente (sem header/back).
- Busca produtos ativos com `show_on_display=true` do tenant, respeitando o modelo escolhido nas settings.
- Rotação automática por `interval_seconds`, com fade/slide entre itens.
- Header discreto com logo + nome do estabelecimento no topo; rodapé com "chamaatende.com".
- Usa as cores do tenant (primary/secondary/background) já implementadas.

### 4. Três modelos de exibição

**Modelo 1 — Cinema (foto imersiva)**
Imagem ocupa a tela inteira com gradiente escuro na base. Nome do produto em display serif grande, descrição curta e preço em destaque dourado no canto inferior esquerdo. Transição fade suave. Ideal para pratos com foto profissional.

**Modelo 2 — Split (editorial)**
Layout dividido 60/40: foto à esquerda, painel à direita com kicker (categoria), nome, descrição completa e preço grande. Transição slide horizontal. Ideal para destacar detalhes e ingredientes.

**Modelo 3 — Mosaico (grid)**
Grid 2×2 mostrando 4 produtos simultâneos com foto quadrada, nome e preço abaixo. Troca o conjunto inteiro a cada intervalo. Ideal para vitrines de padaria/confeitaria com muitos itens.

### 5. Detalhes técnicos
- Registrar `vitrine_digital` em `MODULE_INFO`, `MODULE_NAME_MAP` e `ModulesMap`.
- Hook `useVitrineProducts(restaurantId)` com Realtime em `menu_products` para refletir mudanças na TV sem reload.
- Página `/:slug/vitrine` fora do `ClientLayout` (renderizada como rota fullscreen dentro de `ClientTenantPages`).
- Sidebar do admin ganha item **"Vitrine Digital"** com ícone `Tv`, visível quando o módulo está ativo.

### Fora do escopo
- Playlist manual ou ordenação customizada (usa a ordem do cardápio).
- Vídeos ou anúncios entre produtos.
- Múltiplas vitrines por tenant (uma única por enquanto).
