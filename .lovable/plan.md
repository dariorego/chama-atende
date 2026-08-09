# Módulo Ficha Técnica — plano de implementação

Adaptação do PRD à arquitetura atual: multi-tenant por `restaurant_id`, RLS com `has_tenant_access` / `has_tenant_admin` / `has_module_access`, páginas em `src/pages/admin/*`, hooks React Query em `src/hooks/*`, módulo registrado em `restaurant_modules` + `adminSections.ts`.

Escopo aprovado: F1 a F5, **sem** importação de XML de NF-e (Épico H fica para depois). Fichas vinculadas aos produtos do cardápio (`menu_products`).

## Fases de entrega

### Fase 1 — Fundação (insumos e cotações)
- Tabelas: `suppliers`, `ingredient_categories`, `ingredients`, `ingredient_quotes`.
- Fator de correção e preço unitário são **calculados** e somente leitura na interface.
- Insumo do tipo `PREPARACAO` recebe preço derivado da ficha de origem.
- Tela "Insumos": busca sem acento/caixa, filtros (categoria, fornecedor, cotação vencida), edição rápida de preço, alerta de cotação vencida (padrão 60 dias) e aviso de duplicata ao cadastrar.
- Histórico de cotação por insumo, com gráfico e tabela.
- Importação CSV de cotações reaproveitando `src/lib/csv.ts`, com prévia de impacto (preço antigo → novo, Δ%, nº de fichas afetadas) antes de confirmar.

### Fase 2 — Ficha técnica
- Tabelas: `recipes`, `recipe_versions`, `recipe_components`.
- Componente aponta para o insumo por **chave**, nunca por texto; peso bruto e custo calculados ao vivo.
- Sub-receita: ficha `PREPARACAO` publicada expõe custo por unidade de rendimento e passa a ser consumível como insumo.
- Bloqueio de ciclo com mensagem nomeando o caminho (`A → B → A`).
- Publicar congela fator de correção e preço unitário na versão (custo histórico reproduzível) e exige todos os componentes resolvidos e com preço.
- Diff entre versões, duplicar ficha, marcar fora de linha, fotos no bucket `imagens/{slug}/fichas/`.
- Vínculo opcional com `menu_products` para trazer o preço praticado do cardápio.

### Fase 3 — Precificação e guia de produtos
- Tabela `recipe_pricing` (CMV alvo, embalagem, preço praticado) e defaults de CMV por categoria.
- Preço sugerido, CMV aplicado, custo direto e semáforo (<25% incentivar / 25–30% saudável / >30% ajustar), régua parametrizável por categoria.
- Custo de embalagem entra como componente da ficha, não como planilha separada.
- Painel "Guia de produtos": custo, CMV, semáforo, filtros, ordenação, CMV médio da casa e tags de tratativa.
- Simulador de cenário ("e se a carne de sol subir 15%?") sem persistir nada.

### Fase 4 — Operação de cozinha
- Tabelas: `recipe_steps`, `portion_standards`.
- Visão "Ficha de preparo" derivada da mesma ficha: ingrediente, peso líquido, medida caseira em destaque, foto, passos, tempo, utensílios e validade — **sem custo**.
- Medida caseira é campo do componente, então preparo e custo nunca divergem.
- Referências "(VER FICHA)" viram links navegáveis.
- Escalonamento de rendimento e exportação em PDF A4 de alto contraste (fonte ≥ 16px).
- Padrão de porções sugere o peso ao montar a ficha e avisa divergência acima de 20%.

### Fase 5 — Controle
- Tabelas: `waste_entries`, `inventory_counts`, `inventory_count_lines`, `seasonal_menus`, `seasonal_menu_items`.
- Desperdício com motivo em lista fechada e valor pelo preço vigente (snapshot no lançamento).
- Inventário por data com valorização, fechamento que trava a contagem e comparativo entre contagens.
- Cardápios sazonais (vigência, canal, preço próprio por produto).
- Exportação CSV de insumos, fichas e guia de produtos.

## Regras de negócio implementadas
- `FC = peso_liquido_ref / peso_bruto_ref`, sempre em (0, 1]; zero ou vazio bloqueia o cálculo com erro visível.
- `peso_bruto = peso_liquido / FC`; `custo = peso_bruto × preco_unitario`; `custo_receita = soma dos componentes`; `custo_unitario = custo_receita / rendimento`.
- `preco_sugerido = custo_porcao / cmv_alvo`; `cmv_aplicado = custo_porcao / preco_praticado`.
- Propagação transacional: alterar o preço do pacote recalcula todas as fichas que consomem o insumo, direta ou indiretamente.
- Nenhum fallback silencioso: insumo não resolvido gera erro, nunca custo zero.
- A unidade do componente precisa ser compatível com a do insumo; conversões (g→kg, ml→l) são explícitas na entrada.

## Detalhes técnicos
- Cada tabela nova leva `restaurant_id`, `created_at`/`updated_at` com trigger, GRANTs explícitos e RLS via `has_tenant_access` (leitura) e `has_tenant_admin` (escrita). Nada exposto a visitantes anônimos.
- Perfil Cozinha: campos de custo escondidos na interface e leitura sem valores de custo; controle por `tenant_user_modules` (`ficha-tecnica`) com `has_module_access`.
- Cálculo de custo e propagação em funções Postgres `SECURITY DEFINER` (`search_path = public`) chamadas por RPC, garantindo transação única e recálculo completo em menos de 3 s.
- Detecção de ciclo por CTE recursiva antes de gravar componente do tipo sub-receita.
- Auditoria em `recipe_audit_log` (quem, quando, o quê, valor antes/depois) alimentada por triggers em insumo, ficha, precificação e inventário.
- Hooks novos: `useIngredients`, `useIngredientQuotes`, `useRecipes`, `useRecipeComponents`, `useRecipePricing`, `useWaste`, `useInventory` — mesmo padrão de `useAdminProducts`.
- Páginas: `AdminIngredients`, `AdminRecipes`, `AdminRecipeEditor`, `AdminMenuEngineering`, `AdminWaste`, `AdminInventory`, mais a visão de cozinha `RecipePrepPage`.
- Rotas em `src/App.tsx` sob `/admin/:slug/...` e entradas em `src/lib/adminSections.ts`.
- Campos de formulário seguem o padrão do projeto (`bg-surface`, `placeholder:text-surface-foreground`) e as cores do estabelecimento via `TenantThemeApplier`.
- Observação: o app aponta para o Supabase self-hosted (`supabase.chamaatende.com.br`); as migrações geradas aqui precisam ser aplicadas também nesse banco.

## Fora deste plano
- Importação de XML de NF-e, conciliação de itens e custo real de aquisição (Épico H).
- Migração automática da planilha legada de 302 MB — a entrada de dados será por CSV, etapa por etapa.
- Estoque perpétuo com baixa por venda, integração com PDV e ficha nutricional.