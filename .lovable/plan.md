# Disponibilidade por dia e horário (itens e categorias)

Permitir que cada produto e cada categoria do cardápio tenham uma janela de disponibilidade: dias da semana + um intervalo de horário. Fora dessa janela, o item/categoria fica oculto no cardápio do cliente.

## Regras acordadas

- Fora do horário: ocultar totalmente do cardápio público.
- Janela: um único intervalo (início/fim) + seleção de dias da semana.
- Herança: se a categoria estiver fora da janela, todos os itens dela ficam ocultos (categoria manda).
- Sem configuração = sempre disponível (comportamento atual preservado).
- Intervalo que cruza a meia-noite (ex: 18:00–02:00) é suportado.
- Fuso horário do estabelecimento é respeitado (mesmo campo já usado nos horários de funcionamento).

## Banco de dados

Novas colunas em `menu_products` e `menu_categories`:

- `availability_enabled` boolean, default false
- `available_days` integer[] (0=domingo … 6=sábado), default `{0,1,2,3,4,5,6}`
- `available_from` time, nulo = sem limite inicial
- `available_to` time, nulo = sem limite final

Nenhuma alteração de RLS: a filtragem é de apresentação e ocorre no cliente com base no fuso do estabelecimento.

## Admin

- Formulário de produto (`ProductFormDialog`): bloco "Disponibilidade" com switch para ativar, chips de dias da semana (D S T Q Q S S) e dois campos de hora.
- Formulário de categoria (`CategoryFormDialog`): mesmo bloco, reaproveitando um componente novo `AvailabilityFields`.
- Listagens (`ProductsTable`, `CategoriesTable`): badge discreta tipo "Seg–Sex 11:30–15:00" quando houver agenda; em telas de admin nada é ocultado.

## Cardápio do cliente

- Helper `isAvailableNow(schedule, timezone)` em `src/lib/availability.ts`.
- `MenuPage`: filtra categorias indisponíveis (e seus itens) e depois itens indisponíveis; a navegação/scroll-spy usa a lista já filtrada.
- Mesmo filtro aplicado nos fluxos de pedido (cardápio de encomendas e vitrine) para não exibir itens fora da janela.
- Reavaliação automática a cada minuto para o cardápio atualizar sozinho na virada do horário.

## Detalhes técnicos

- Migration adiciona as 4 colunas em cada tabela com defaults seguros; nada muda para registros existentes.
- Tipos de produto/categoria vêm de `src/integrations/supabase/types.ts` (regenerado após a migration), então os ajustes de código vêm depois da aprovação da migration.
- Hooks afetados: `useAdminProducts`, `useAdminCategories`, `useMenuProducts`, `useMenuCategories`, `usePreOrderProducts`, `useVitrineSettings` (apenas passar/filtrar os novos campos).
- Campos de formulário seguem o padrão `bg-surface placeholder:text-surface-foreground`.
