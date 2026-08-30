# Chamado de atendimento com nome do cliente

Hoje o chamado é identificado só pela mesa. A ideia é o cliente informar o nome uma vez no celular dele, esse nome ficar salvo no aparelho e acompanhar todos os chamados que ele fizer — e cada pessoa da mesa poder chamar sem ser bloqueada pelo chamado de outra.

## Como vai funcionar para o cliente

1. Na primeira vez que toca em "Chamar atendente" ou "Pedir a conta", abre um pequeno campo pedindo o nome ("Como podemos te chamar?").
2. O nome é salvo no celular (por estabelecimento) e reutilizado automaticamente nos próximos chamados — sem pedir de novo.
3. Um link/botão discreto "Não é você? Trocar nome" permite alterar.
4. Se o cliente preferir, pode seguir sem nome (fica só "Mesa X").
5. O bloqueio "solicitação já enviada" passa a valer apenas para o mesmo nome/dispositivo. Se outra pessoa da mesa (outro celular/outro nome) chamar, um novo chamado é criado normalmente, mesmo já existindo um pendente na mesma mesa.

## Como fica no painel (Admin → Atendimentos)

- O card do chamado mostra "Mesa 10 · João" em vez de apenas "Mesa 10".
- No agrupamento por mesa, aparecem os nomes de quem chamou (ex.: "João, Maria") em vez de só "chamou 2×".
- Mapa de mesas e histórico exibem o nome quando existir.

## Detalhes técnicos

- **Banco**: migração adicionando `customer_name text` (nullable, texto curto) em `service_calls`. Sem mudança de RLS — o insert público já existe.
- **Cliente**: `useTableContext`/novo helper guarda o nome em `localStorage` com chave por tenant+mesa; `useClientServiceCall.createCall` passa `customer_name` (limitado a ~60 caracteres, `trim`).
- **Duplicidade**: `hasActiveCall(callType)` passa a considerar também o nome do dispositivo atual, de modo que chamados de outras pessoas na mesma mesa não impedem um novo chamado.
- **Telas afetadas**: `TableEntryPage.tsx`, `WaiterCallPage.tsx`, `MenuPage.tsx` (FAB de chamado) — um único componente de diálogo/`input` reutilizado, seguindo os tokens do design system (`bg-surface`, `placeholder:text-surface-foreground`, `border-border`).
- **Admin**: `useAdminServiceCalls` inclui `customer_name` no tipo e no select; `ServiceCallCard.tsx` e `AdminWaiterCalls.tsx` exibem o nome; `TableFloorMap` mostra os nomes dos chamados ativos.
- Som e alertas em tempo real continuam iguais; cada novo chamado dispara notificação como hoje.
