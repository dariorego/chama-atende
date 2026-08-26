# Checklists de Higiene / ANVISA (novo módulo)

Módulo `hygiene_checklists` para registro de boas práticas por turno, com medições de temperatura validadas por faixa e controle de validade de produtos abertos/manipulados.

## O que o usuário vai ter

**1. Modelos de checklist (templates)**
- Cadastro de checklists por turno (manhã / tarde / noite) — ex.: "Abertura da cozinha", "Fechamento do salão".
- Itens do checklist com 3 tipos de resposta:
  - Conforme / Não conforme / Não aplicável
  - Numérico com faixa esperada (ex.: temperatura de câmara fria entre -18 °C e -12 °C)
  - Texto livre (observação)
- Itens obrigatórios e ordem de exibição.

**2. Execução por turno**
- Tela "Higiene" no admin com o dia atual e os turnos.
- Ao iniciar, cria um registro de execução com data, turno e responsável (usuário logado).
- Preenchimento item a item; campos numéricos fora da faixa ficam destacados em vermelho e exigem uma ação corretiva escrita antes de concluir.
- Só é possível concluir quando todos os itens obrigatórios estão respondidos e todas as não conformidades têm ação corretiva.
- Histórico com filtro por período e turno, mostrando % de conformidade e quem assinou.

**3. Controle de validade**
- Registro de produto aberto/manipulado: nome (ou insumo do cadastro, quando o módulo Ficha Técnica estiver ativo), lote, data de manipulação, validade, local de armazenamento, responsável.
- Painel com semáforo: vencido (vermelho), vence em até 2 dias (amarelo), ok (verde).
- Ação de "descartar" que baixa o registro com motivo — e, quando houver insumo vinculado, oferece lançar em Desperdício.

**4. Relatórios**
- Resumo do período: execuções realizadas x esperadas, não conformidades por item, temperaturas fora da faixa, descartes por validade.
- Exportação CSV para apresentar em fiscalização.

## Detalhes técnicos

**Banco (migração, com GRANT + RLS por `restaurant_id`)**
- `hygiene_checklists`: restaurant_id, name, shift, is_active, created_at, updated_at.
- `hygiene_checklist_items`: checklist_id, label, item_type (`CONFORMIDADE` | `NUMERICO` | `TEXTO`), unit, min_value, max_value, is_required, position.
- `hygiene_checklist_runs`: restaurant_id, checklist_id, run_date, shift, status (`EM_ANDAMENTO` | `CONCLUIDO`), performed_by, completed_at, compliance_pct, notes.
- `hygiene_checklist_answers`: run_id, item_id, answer (`CONFORME`/`NAO_CONFORME`/`NA`), numeric_value, text_value, is_out_of_range, corrective_action.
- `hygiene_shelf_life_items`: restaurant_id, ingredient_id (nullable), product_name, batch_code, opened_at, expires_at, storage_location, quantity, unit, status (`ATIVO` | `DESCARTADO` | `CONSUMIDO`), discarded_reason, created_by.
- Enums novos: `hygiene_shift`, `hygiene_item_type`, `hygiene_answer`, `hygiene_run_status`, `hygiene_shelf_status`.
- Trigger para recalcular `compliance_pct` do run e `updated_at` nas tabelas com esse campo.
- Políticas usando `has_tenant_access(restaurant_id)` para leitura e `has_tenant_admin(restaurant_id)` (ou acesso ao módulo via `has_module_access`) para escrita, no mesmo padrão das tabelas de Ficha Técnica.

**Frontend**
- Novo módulo no catálogo: `MODULE_INFO.hygiene_checklists` em `src/hooks/useAdminModules.ts`, `ModulesMap`/`MODULE_NAME_MAP` em `src/types/restaurant.ts`.
- Seções em `src/lib/adminSections.ts`: `higiene`, `validades`, `higiene-modelos` → módulo `hygiene_checklists`.
- Rotas em `src/App.tsx` com `AuthGuard requireAdmin section=...` e itens no menu de `AdminLayout.tsx` (ícones `ShieldCheck` e `CalendarX`).
- Hook `src/hooks/useHygiene.ts` (queries/mutations com React Query, filtradas por `tenantId`), no padrão de `useWasteInventory.ts`.
- Páginas: `src/pages/admin/AdminHygiene.tsx` (execução + histórico + aba de modelos) e `src/pages/admin/AdminShelfLife.tsx` (validades).
- Componentes: `HygieneRunSheet.tsx` (formulário de execução), `HygieneTemplateDialog.tsx`, `ShelfLifeFormDialog.tsx` — usando tokens do design system (`bg-surface`, `placeholder:text-surface-foreground`).
- Validação com zod (faixas numéricas, obrigatoriedade de ação corretiva, datas de validade > manipulação).
- Landing: entrada em `src/data/moduleLandings.ts` + card no bento de `src/pages/LandingPage.tsx`, no mesmo padrão dos outros módulos.

## Ordem de execução
1. Migração do banco (enums, tabelas, grants, RLS, triggers).
2. Hook + tipos + catálogo de módulos e seções.
3. Rotas, menu e páginas de execução/histórico.
4. Painel de validades com semáforo e descarte.
5. Relatório/CSV e página de landing do módulo.
