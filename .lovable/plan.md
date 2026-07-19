## Objetivo

Vincular cada **Atendente** (tabela `waiters`, usada em chamados de mesa, comandas e sessões) a um **Funcionário** cadastrado no módulo Agenda (tabela `employees`), evitando cadastro duplicado e permitindo reaproveitar dados (nome, telefone, cargo).

## Comportamento

- No cadastro/edição de Atendente, um seletor "Funcionário" lista os funcionários ativos do restaurante (filtrando quem tem cargo compatível: garçom, atendente, waiter — os demais aparecem em "Mostrar todos").
- Ao escolher o funcionário, o campo Nome é preenchido automaticamente (mas continua editável para apelido).
- Um funcionário só pode estar vinculado a **um** atendente (validação por índice único).
- Na listagem de Atendentes, mostrar chip com o cargo do funcionário vinculado e um badge "Sem vínculo" quando não houver.
- Botão "Importar da Agenda" no topo da página Atendentes: abre modal com funcionários ainda não vinculados e cria atendentes em lote.
- Ao desativar/excluir um funcionário na Agenda, o atendente correspondente é automaticamente desativado (`is_active=false`) via trigger — não é excluído, para preservar histórico de chamados.

## Alterações técnicas

**Migração**
- `ALTER TABLE public.waiters ADD COLUMN employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;`
- Índice único parcial: `CREATE UNIQUE INDEX waiters_employee_id_unique ON public.waiters(employee_id) WHERE employee_id IS NOT NULL;`
- Trigger `AFTER UPDATE OF is_active ON employees` que, quando `is_active` vira `false`, atualiza `waiters.is_active=false` do registro vinculado.

**Frontend**
- `src/hooks/useAdminEmployees.ts` (novo ou existente do módulo Agenda): expor `useAdminEmployees()` para leitura.
- `src/hooks/useAdminWaiters.ts`: adicionar `employee_id` ao tipo `Waiter`/`WaiterInsert`; incluir join `employees(full_name, role, phone)` na query.
- `src/components/admin/WaiterFormDialog.tsx`: novo `Select` "Funcionário (Agenda)" com opção "Nenhum". Ao trocar, preenche o nome se estiver vazio.
- `src/pages/admin/AdminWaiters.tsx`:
  - Exibir cargo/telefone do funcionário vinculado nos cards e na tabela.
  - Novo botão **"Importar da Agenda"** que abre `ImportWaitersFromEmployeesDialog` (novo componente) com checklist dos funcionários não vinculados.
- Filtrar do seletor os funcionários já vinculados a outro atendente (exceto o atual em edição).

## Fora do escopo

- Não alteramos o módulo Agenda em si (nenhuma mudança em telas/hooks de funcionários além da leitura).
- Não sincronizamos edições de nome/telefone bidirecionalmente — a Agenda continua sendo a fonte da verdade e o campo "Nome" no atendente é apelido opcional.
