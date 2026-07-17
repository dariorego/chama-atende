## Módulo Comanda Digital

Objetivo: permitir várias comandas abertas simultaneamente em uma mesma mesa (ex.: Mesa 10 → 10.01, 10.02, 10.03), acumulando pedidos por comanda e fechando individualmente ou em conjunto.

### Banco de dados (migration)

Nova tabela `comandas`:
- `id uuid pk`
- `restaurant_id uuid` (FK restaurants, RLS por tenant)
- `table_id uuid` (FK tables, nullable para comandas avulsas/balcão)
- `table_session_id uuid` (FK table_sessions, opcional — vincula à sessão da mesa)
- `code text` — gerado como `{mesa}.{seq}` ex. `10.01`
- `sequence int` — sequencial por mesa/sessão
- `customer_name text` (opcional — "João", "Mesa Amigos 1")
- `status text` — `open` | `bill_requested` | `closed` | `cancelled`
- `waiter_id uuid` (FK waiters, nullable)
- `opened_at`, `closed_at`, `bill_requested_at`
- `total_amount numeric default 0`
- `notes text`

Alterar `order_line_items` (ou `orders`):
- adicionar `comanda_id uuid null` (FK comandas) para vincular cada pedido a uma comanda específica.

Function/trigger:
- `generate_comanda_code(_table_id, _restaurant_id)` — retorna próximo `NN.SS` baseado em número da mesa + próximo sequencial de comandas abertas naquela mesa.
- Trigger em `order_line_items` para recalcular `comandas.total_amount`.

RLS + GRANTs:
- SELECT/INSERT/UPDATE/DELETE para `authenticated` restrito por `has_tenant_access(restaurant_id)`.
- Admin/manager/owner: gestão total via `has_tenant_admin`.
- Registro no `restaurant_modules` como `digital_comanda`.

### Backend/Hooks

`src/hooks/useComandas.ts`:
- `useComandas(restaurantId, { status?, tableId? })` — lista com realtime.
- `useOpenComanda()` — cria comanda para uma mesa (chama RPC para gerar código).
- `useCloseComanda()` — encerra e move status.
- `useRequestBill()` — marca `bill_requested`.
- `useMoveItemsToComanda()` — divide conta transferindo line items entre comandas.

Extensão do fluxo de pedidos:
- `useSubmitOrder` passa a aceitar `comandaId` opcional.
- Edge function `public-api` (create-order-line-item) valida `comanda_id` e associa.

### Admin UI

Nova página `src/pages/admin/AdminComandas.tsx`:
- Cabeçalho com filtro por mesa e status.
- Lista agrupada por mesa: cada card de mesa mostra as comandas abertas (10.01, 10.02…) com totais, tempo aberto e botão "Nova comanda".
- Ações por comanda: ver itens, pedir conta, encerrar, imprimir, dividir/mover itens.
- Modal "Nova comanda": escolher mesa, opcional nome do cliente e garçom.

Sidebar: novo item "Comandas" (ícone `Receipt`) — visível quando módulo `digital_comanda` ativo.

`AdminModules.tsx` + `useAdminModules.ts`:
- Adicionar entrada `digital_comanda` com label "Comanda Digital".

### UI Cliente (mesa)

`src/pages/MenuPage.tsx`:
- Quando existir contexto de mesa e módulo ativo, exibir seletor "Sua comanda" (lista comandas abertas da mesa + botão "Abrir nova comanda").
- Persistir `comandaId` em `localStorage` junto ao contexto de mesa.
- Ao enviar pedido, incluir `comandaId`.

### Impressão / Fechamento

- Botão "Imprimir comanda" gera layout com código (10.01), itens, subtotais, opcional 10% garçom.
- Botão "Fechar mesa" fecha todas as comandas em `bill_requested` da mesa e encerra a sessão.

### Fora do escopo desta entrega

- Pagamento integrado (POS) — próximo módulo.
- Divisão automática por pessoa — apenas transferência manual de itens entre comandas.

### Detalhes técnicos

- Realtime: canal por `restaurant_id` com nome único (`comandas-${restaurantId}-${Date.now()}-${rand}`) seguindo padrão dos hooks existentes.
- Tokens semânticos do design system (bg-surface, text-foreground) para todos formulários.
- Sem quebra: pedidos existentes sem `comanda_id` continuam válidos (nullable).
