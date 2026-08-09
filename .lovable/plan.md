# Painel Consolidado de CMV

Nova tela no admin (`/admin/:slug/cmv`) que reúne, em uma única visão, o custo e a margem de todas as fichas técnicas do estabelecimento.

## O que a tela mostra

**Indicadores no topo**
- CMV médio das fichas com preço praticado
- Quantidade de fichas por faixa: Incentivar venda / Saudável / Ajustar produto / Sem preço
- Custo médio por porção e valor de desperdício do período selecionado

**Régua de CMV configurável**
- Campos para faixa saudável (padrão 25% a 30%), aplicados na classificação e no semáforo da tabela
- A régua fica salva no navegador do usuário para não precisar reconfigurar

**Tabela consolidada**
- Colunas: ficha, tipo (produto final / preparação), rendimento, custo total, custo por porção, preço praticado, preço sugerido pelo CMV alvo, CMV aplicado, semáforo e etiqueta de tratamento
- Filtros: busca por nome, tipo, status (rascunho/publicada/fora de linha) e faixa de CMV
- Ordenação por CMV, custo ou nome; clique na linha abre a ficha no editor
- Botão "Exportar CSV" com as colunas exibidas

**Destaques**
- Top 10 fichas com maior CMV (prioridade de ajuste)
- Top 10 com melhor margem (candidatas a incentivar venda)

## Detalhes técnicos

- Nova página `src/pages/admin/AdminCmv.tsx`, sem alterações de banco: consome `recipes` (custo total/unitário, rendimento), `recipe_pricing` (CMV alvo, preço praticado, etiqueta) e `waste_entries` para o card de desperdício.
- Novo hook `useCmvOverview` em `src/hooks/useRecipes.ts` (ou arquivo próprio `useCmvPanel.ts`) que busca fichas + pricing do tenant em uma consulta com join e monta as linhas usando `portionCost`, `suggestedPrice`, `appliedCmv` e `cmvLevel` de `src/lib/cmv.ts`.
- Rota `cmv` registrada em `src/App.tsx` com `AuthGuard requireAdmin section="cmv"`; `cmv` adicionado a `src/lib/adminSections.ts` mapeado para o módulo `technical_sheet`; item "Painel de CMV" no `AdminLayout` acima de Insumos.
- Exportação CSV reaproveitando o utilitário de CSV já usado na importação, sem dependência nova.
- Cores e cards seguem os tokens semânticos do design system e as cores do estabelecimento.
