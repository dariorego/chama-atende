# Cancelar automaticamente chamados de dias anteriores

Hoje o painel "Atendimentos" mostra chamados pendentes com tempos absurdos (ex.: 2087:47), porque solicitações abertas em dias anteriores nunca foram encerradas. A ideia é que todo chamado que não seja do dia atual seja cancelado automaticamente.

## Como vai funcionar

- Qualquer chamado com status pendente / reconhecido / em andamento cuja data de abertura seja anterior ao dia de hoje (fuso de Recife, UTC-3) passa a ficar como "cancelado".
- A limpeza acontece automaticamente:
  - no banco, uma vez por dia (rotina agendada), e
  - ao abrir/atualizar a tela de Atendimentos, garantindo que o painel nunca exiba chamado de outro dia.
- Contadores ("Chamados pendentes", badge das abas) e o mapa de mesas passam a refletir apenas o dia atual.
- Chamados cancelados por expiração continuam no histórico, marcados como cancelados (nada é apagado).

## Detalhes técnicos

- Migração: função `expire_old_service_calls()` (security definer) que faz `UPDATE public.service_calls SET status='cancelled', completed_at=now() WHERE status IN ('pending','acknowledged','in_progress') AND (called_at AT TIME ZONE 'America/Recife')::date < (now() AT TIME ZONE 'America/Recife')::date`. Grant de execute para `authenticated`/`service_role`.
- Agendamento diário via `pg_cron` (00:05 America/Recife) se a extensão estiver disponível; caso contrário, a limpeza fica apenas no gatilho da aplicação.
- `useAdminServiceCalls.ts`: antes de cada fetch das listas (`admin-service-calls` e `pending-service-calls`), chamar `supabase.rpc('expire_old_service_calls')` (ignorando erro) e, adicionalmente, filtrar em memória chamados pendentes com `called_at` anterior ao dia atual, para não exibir nada obsoleto mesmo se o RPC falhar.
- Nenhuma mudança no fluxo de criação de chamado, som ou realtime.
