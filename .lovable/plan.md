# Alertas em tempo real de não conformidade (Higiene)

Avisar o painel administrativo no instante em que aparecer uma não conformidade em um checklist de higiene: temperatura/valor fora da faixa, item marcado como "Não conforme", ou não conformidade sem ação corretiva preenchida.

## O que o usuário vai ter

**1. Alerta imediato**
- Quando qualquer usuário do estabelecimento registra uma resposta fora da faixa ou "Não conforme", os outros painéis abertos recebem o aviso na hora (sem recarregar).
- Notificação toast com o item, o valor registrado e a faixa esperada, com atalho "Ver checklist" que abre a execução correspondente.
- Som de notificação usando a mesma configuração de som já existente em Configurações (tipo, volume, repetição).

**2. Sino de pendências no menu**
- O item "Higiene" no menu lateral passa a exibir um contador vermelho com o número de não conformidades sem ação corretiva.
- O contador zera conforme as ações corretivas são preenchidas.

**3. Faixa de pendências na tela de Higiene**
- Bloco no topo de "Higiene" listando as não conformidades em aberto (turno, item, valor, responsável) com botão para abrir o checklist e escrever a ação corretiva.
- Aviso separado quando um checklist é concluído mas ainda existem não conformidades sem ação corretiva registradas.

**4. Validades também alertam**
- O mesmo sino/toast avisa quando um produto controlado vence hoje ou já está vencido, aproveitando o semáforo já existente.

## Detalhes técnicos

**Banco (migração)**
- Adicionar `hygiene_checklist_answers`, `hygiene_checklist_runs` e `hygiene_shelf_life_items` à publicação `supabase_realtime` (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`), com `REPLICA IDENTITY FULL` nas respostas para que o payload traga os campos antigos.
- Nenhuma nova tabela ou política: as RLS por `has_tenant_access(restaurant_id)` já filtram os eventos. Como `hygiene_checklist_answers` não tem `restaurant_id`, o filtro de tenant é aplicado no cliente cruzando o `run_id` com os runs já carregados; quando o run não é conhecido, o hook faz refetch em vez de exibir o alerta.
- A migração precisa ser aplicada no Supabase self-hosted usado pelo app.

**Frontend**
- `src/hooks/useHygieneAlerts.ts` (novo): assina os canais Realtime dentro de `useEffect` com nome único e `supabase.removeChannel` na limpeza (padrão de `useAdminServiceCalls.ts`), invalida as queries de higiene, deriva a lista de não conformidades em aberto a partir de `useHygieneRuns` + `is_out_of_range`/`corrective_action`, dispara toast e som via `useNotificationSound`, e mantém fallback de polling (`refetchInterval` ~30s) para não depender só do Realtime.
- `src/hooks/useHygiene.ts`: expor helper `openNonConformities(runs)` e contador para reuso no menu e na página.
- `src/components/layout/AdminLayout.tsx`: badge de contagem no item "Higiene" (mesmo padrão visual usado em Atendimentos), alimentado pelo hook, apenas quando o módulo `hygiene_checklists` está ativo.
- `src/pages/admin/AdminHygiene.tsx`: bloco "Não conformidades em aberto" no topo, abrindo `HygieneRunSheet` no run correto.
- Toasts via `sonner`; cores e superfícies com tokens do design system (`bg-surface`, `text-destructive`), sem cores fixas.

## Ordem de execução
1. Migração de Realtime (publicação + replica identity).
2. Hook `useHygieneAlerts` com toast, som e polling de fallback.
3. Badge no menu lateral.
4. Bloco de não conformidades em aberto na tela de Higiene.
5. Inclusão dos alertas de validade vencida/vencendo.
