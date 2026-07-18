## Módulo Agenda de Funcionários

Gestão interna (admin) para cadastrar funcionários, montar escala semanal, aprovar folgas/férias e registrar ponto (entrada, saída e intervalos). Não expõe nada ao cliente final.

### Banco de dados

**`employees`** (colaboradores do tenant)
- `restaurant_id`, `user_id` (nullable — vincula a `auth.users` se o funcionário também logar), `full_name`, `email`, `phone`, `role` (garçom, cozinha, caixa, gerente, outro — texto livre), `hourly_rate numeric`, `weekly_hours int` (carga contratual), `hire_date date`, `is_active bool default true`, `notes text`.

**`employee_shifts`** (escala planejada)
- `restaurant_id`, `employee_id`, `shift_date date`, `start_time time`, `end_time time`, `role text` (posição naquele turno), `status` (`scheduled` | `confirmed` | `absent` | `completed`), `notes`.
- Índice único (`employee_id`, `shift_date`, `start_time`) para evitar duplicatas.

**`employee_time_off`** (folgas / férias / atestados)
- `restaurant_id`, `employee_id`, `type` (`vacation` | `day_off` | `sick_leave` | `unpaid` | `other`), `start_date date`, `end_date date`, `reason text`, `status` (`pending` | `approved` | `rejected`), `reviewed_by uuid`, `reviewed_at`.

**`time_clock_entries`** (ponto)
- `restaurant_id`, `employee_id`, `shift_id uuid nullable` (vincula ao turno planejado), `clock_in timestamptz`, `clock_out timestamptz nullable`, `break_minutes int default 0`, `source` (`manual` | `pin` | `self`), `notes`.
- Função `total_minutes` derivada em query.

RLS (todas as tabelas): apenas `has_tenant_admin(restaurant_id)` gerencia; sem acesso público/anon. GRANTs para `authenticated` e `service_role`.

Registrar módulo `staff_schedule` em `restaurant_modules` (e no `create-tenant`).

### Hooks

- `useAdminEmployees.ts` — CRUD + toggle ativo.
- `useAdminShifts.ts` — listar por semana (`from`/`to`), criar, editar, duplicar semana anterior, marcar falta/concluído. Realtime.
- `useAdminTimeOff.ts` — listar por status, aprovar, rejeitar, cancelar.
- `useAdminTimeClock.ts` — bater ponto (entrada/saída), listar do dia, corrigir manualmente, calcular horas trabalhadas x planejadas.

### Admin UI

Sidebar: ícone `CalendarClock`, rota `/admin/:slug/agenda`, visível quando módulo `staff_schedule` ativo.

Página `AdminStaffSchedule.tsx` com 4 abas:

1. **Funcionários** — tabela com nome, função, contato, carga semanal, ativo/inativo, ações (editar, desativar). Dialog `EmployeeFormDialog`.
2. **Escala** — grade semanal (dias × funcionários) tipo calendário. Célula exibe turnos do dia com horário e status colorido. Botões: "Semana anterior", "Semana atual", "Próxima", "Duplicar semana anterior", "Novo turno". Dialog `ShiftFormDialog` (funcionário, data, hora início/fim, função, observações). Drag opcional fora do escopo.
3. **Folgas & Férias** — cards agrupados por status (Pendentes, Aprovadas, Rejeitadas). Ações rápidas de aprovar/rejeitar. Dialog `TimeOffFormDialog` para lançar manualmente.
4. **Ponto** — visão do dia: lista de funcionários com botão "Bater entrada" / "Bater saída" (registro manual pelo admin), tempo decorrido em tempo real, correção manual (dialog `TimeClockAdjustDialog`). Resumo semanal por funcionário: horas planejadas vs realizadas.

Todos usam design tokens (`bg-surface`, `text-foreground`, `text-muted-foreground`), sem cores hardcoded.

### Landing Page

Card "Agenda de Funcionários" na grid de módulos com ícone `CalendarClock` e badge "Novo".

### Registrar módulo

- `MODULE_INFO.staff_schedule` em `useAdminModules.ts`.
- `ModulesMap.staffSchedule` + `MODULE_NAME_MAP` em `src/types/restaurant.ts`.
- `DEFAULT_MODULES` em `useRestaurantModules.ts`.
- `defaultModules` array em `create-tenant` edge function.
- Item de menu em `AdminLayout.tsx`.

### Fora do escopo (próximas entregas)

- App/portal do funcionário para bater ponto sozinho (por enquanto só admin registra).
- Geolocalização / biometria no ponto.
- Exportação de folha de pagamento em PDF/CSV.
- Notificações automáticas de escala publicada.
- Regras de horas extras / adicional noturno automatizadas.

### Detalhes técnicos

- Realtime com canal único por instância (padrão do projeto).
- Cálculo de horas em `date-fns`.
- Grid semanal com CSS grid responsivo (scroll horizontal no mobile).
- Sem `.select().single()` em inserts (RLS pode bloquear SELECT).
