## Módulo Reserva de Eventos

Objetivo: cliente solicita reserva de evento (aniversário, corporativo, grupo, casamento, confraternização) informando data, número de convidados e detalhes; admin responde com orçamento e status.

### Banco de dados

Nova tabela `event_bookings`:
- `restaurant_id uuid` (FK, RLS por tenant)
- `booking_code text` (E-001, E-002…)
- `event_type text` — `birthday` | `corporate` | `wedding` | `group` | `other`
- `customer_name text`, `customer_email text`, `customer_phone text`
- `event_date date`, `event_time time`
- `guest_count int`
- `budget_range text` (opcional — faixa que o cliente sugere)
- `description text` (detalhes do cliente)
- `status text` — `pending` | `quoted` | `confirmed` | `cancelled` | `completed`
- `quote_amount numeric` (orçamento enviado pelo admin)
- `quote_details text` (o que está incluído — cardápio, decoração, bebidas…)
- `admin_response text`
- `quoted_at`, `confirmed_at`, `cancelled_at`

RLS:
- Público (anon): INSERT (submeter pedido) restrito por `restaurant_id` válido.
- Autenticado com `has_tenant_admin(restaurant_id)`: gestão total.
- Sem SELECT público (cliente acompanha por link único com `booking_code`, escopo futuro).

Registrar em `restaurant_modules` como `event_bookings` (e no `create-tenant`).

### Hooks

- `useAdminEventBookings.ts`: listagem por status com realtime, mutations para responder orçamento (`quoteEventBooking`), confirmar, cancelar, marcar concluído.
- `useSubmitEventBooking.ts`: formulário público (insert direto, pois é INSERT-only anon).

### Admin UI

Nova página `src/pages/admin/AdminEventBookings.tsx`:
- Cards agrupados por status (Pendentes, Orçados, Confirmados, Concluídos).
- Card com dados do evento + botão "Enviar orçamento" (modal com valor, detalhes, resposta).
- Ações: confirmar, cancelar, marcar concluído.
- Ícone `PartyPopper` na sidebar quando módulo `event_bookings` ativo.

Adicionar `event_bookings` em `useAdminModules` (MODULE_INFO) e em `src/types/restaurant.ts` (ModulesMap + MODULE_NAME_MAP).

### UI Cliente

Nova página `src/pages/EventBookingPage.tsx` (rota `/:slug/eventos`):
- Hero com nome do estabelecimento.
- Formulário: tipo de evento (chips), data, horário, número de convidados, contato, descrição.
- Toast de confirmação e código gerado (E-001).

Adicionar link "Reservar Evento" no `HubPage` quando o módulo estiver ativo.

### Landing Page

Adicionar card "Reserva de Eventos" na seção de módulos da `LandingPage`.

### Fora do escopo

- Acompanhamento público por link com `booking_code` (próxima entrega).
- Pagamento de sinal do evento.
- Contratos em PDF.

### Detalhes técnicos

- Design tokens semânticos (`bg-surface`, `text-foreground`), sem cores hardcoded.
- Realtime com canal único por instância (padrão dos demais hooks).
- Tabela com GRANT para `authenticated` e `service_role`; `INSERT` para `anon` conforme política pública.
