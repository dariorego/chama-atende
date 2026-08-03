# Módulos de Fidelidade, Cupons e Indicação — Descrição Pré-Implementação

## Objetivo
Descrever, antes de escrever código, como os três módulos de marketing/CRM se encaixam na arquitetura multi-tenant atual do Chama Atende, quais dados armazenam, quais telas precisam e como são controlados por plano e ativação do administrador.

## Como a plataforma hoje recebe novos módulos

A arquitetura já tem um padrão fixo de cinco camadas para cada módulo:

```text
1. Ativação      → restaurant_modules (is_active, settings jsonb)
2. Admin         → src/pages/admin/Admin<Nome>.tsx
3. Público       → src/pages/<Nome>Page.tsx (rotas em ClientTenantPages)
4. Marketing     → src/data/moduleLandings.ts (/modulos/<slug>)
5. Permissão     → MODULE_INFO (useAdminModules.ts) + MODULE_NAME_MAP (types/restaurant.ts)
```

Os novos módulos seguirão exatamente esse padrão, acrescentando as tabelas operacionais específicas de cada um.

## Módulos propostos

### 1. Fidelidade e Cashback

Conceito: recompensar clientes recorrentes com pontos ou crédito pré-pago por compra, criando níveis (Bronze, Prata, Ouro) e permitindo resgate em pedidos futuros.

#### Fluxo de negócio

- Cliente faz pedidos no cardápio, encomendas ou comandas.
- Sistema converte valor gasto em pontos (ex: R$ 1,00 = 1 ponto) de acordo com configuração do tenant.
- Cliente acumula pontos e sobe de nível conforme regras configuradas.
- Cliente pode resgatar pontos como desconto em um pedido futuro (cashback) ou trocar por recompensas pré-cadastradas.
- Admin consulta saldo, histórico e manualmente ajusta pontos quando necessário.

#### Tabelas sugeridas

- `loyalty_programs` (um por tenant)
  - `restaurant_id`, `points_per_currency`, `currency_value_per_point`, `welcome_points`, `is_active`
  - `status` (draft, active, paused)
- `loyalty_tiers` (níveis de cliente)
  - `restaurant_id`, `name`, `min_points`, `multiplier`, `color`, `icon`
- `loyalty_rewards` (recompensas fixas)
  - `restaurant_id`, `name`, `description`, `points_cost`, `discount_value`, `is_active`
- `customer_loyalty_balances` (saldo por cliente)
  - `restaurant_id`, `customer_phone` (ou `customer_id` futuro), `points_balance`, `total_earned_lifetime`, `tier_id`, `updated_at`
- `loyalty_transactions` (auditoria imutável)
  - `restaurant_id`, `customer_phone`, `type` (earn, redeem, adjust, expire, revert), `points`, `order_id`, `description`, `created_by`, `created_at`

#### Telas

- **Admin**: `AdminLoyalty.tsx` com três abas: Configuração do programa, Regras de níveis/recompensas, Saldos e transações dos clientes.
- **Público**: durante o checkout do cardápio/encomenda aparece opção "Usar meus pontos" (se o cliente informar o mesmo telefone); após pagamento, mensagem com novo saldo.
- **Marketing**: `/modulos/fidelidade-e-cashback` explicando o programa.

#### Gating

- Disponível a partir do plano **Pro**.
- Ativado pelo admin em "Módulos" como `loyalty_cashback`.

---

### 2. Cupons e Promoções

Conceito: criar códigos de desconto que o cliente aplica no checkout, com regras por horário, categoria de produto, valor mínimo, primeiro pedido ou uso único por cliente.

#### Fluxo de negócio

- Admin cria um cupom com código, tipo de desconto (fixo ou percentual), regras de uso e validade.
- Cliente digita o código no checkout ou acessa via link automático (`?cupom=ABC`).
- Sistema valida: expirou? já usado por esse telefone? atende valor mínimo? categoria elegível?
- Desconto é aplicado ao total e registrado no pedido.
- Admin acompanha uso e desativa cupons.

#### Tabelas sugeridas

- `coupons`
  - `restaurant_id`, `code`, `type` (percentage, fixed_amount), `value`, `max_discount_value`, `min_order_value`
  - `usage_limit` (total), `usage_limit_per_customer`, `usage_count`
  - `valid_from`, `valid_until`, `status` (active, paused, expired), `is_first_order_only`, `apply_to` (all, category, product), `target_ids` (array UUID)
  - `auto_apply` (boolean), `description`
- `coupon_redemptions`
  - `restaurant_id`, `coupon_id`, `order_id`, `customer_phone`, `discount_value`, `applied_at`

#### Telas

- **Admin**: `AdminCoupons.tsx` com listagem de cupons, status de uso, formulário de criação/edição e relatório de resgates.
- **Público**: campo "Cupom de desconto" no checkout de cardápio, encomendas e comandas; validação instantânea com mensagem de erro clara.
- **Marketing**: `/modulos/cupons-e-promocoes` mostrando os tipos de promoção possíveis.

#### Gating

- Disponível a partir do plano **Pro**.
- Ativado pelo admin como `coupons`.

---

### 3. Programa de Indicação

Conceito: cliente indicador recebe crédito/pontos quando um amigo (indicado) fizer o primeiro pedido, e o amigo também ganha um benefício de boas-vindas.

#### Fluxo de negócio

- Cliente autenticado (ou informando telefone) gera um código/link de indicação exclusivo.
- Amigo acessa o link, faz o primeiro pedido e informa o código na hora do checkout (ou link já o aplica).
- Sistema verifica se é primeiro pedido do telefone indicado no tenant.
- Após confirmação do pagamento, ambos recebem crédito: indicador ganha pontos/cashback; indicado ganha desconto na primeira compra.
- Admin vê estatísticas de indicações, conversão e créditos pendentes.

#### Tabelas sugeridas

- `referral_programs` (configuração do tenant)
  - `restaurant_id`, `referrer_reward_type` (points, fixed_credit), `referrer_reward_value`, `referred_discount_type`, `referred_discount_value`, `is_active`
- `referral_codes` (códigos dos clientes)
  - `restaurant_id`, `customer_phone`, `code`, `referral_link`, `usage_count`, `created_at`
- `referral_referrals` (cada indicação)
  - `restaurant_id`, `referrer_code_id`, `referred_customer_phone`, `referred_order_id`, `status` (pending, converted, expired), `converted_at`, `reward_applied`
- Recompensas podem ser registradas reutilizando `loyalty_transactions` (se Fidelidade estiver ativa) ou uma tabela própria `referral_rewards`.

#### Telas

- **Admin**: `AdminReferrals.tsx` com configuração do programa, lista de códigos gerados e conversões.
- **Público**: no checkout final, opção "Foi indicado por um amigo?" com campo de código; em uma página `/compartilhar` (opcional), o cliente vê seu código/link para compartilhar.
- **Marketing**: `/modulos/programa-de-indicacao` explicando o ganha-ganha.

#### Gating

- Disponível a partir do plano **Premium** (ou Pro se desacoplado tecnicamente).
- Ativado pelo admin como `referral_program`.

---

## Dependências e integrações entre os módulos

- Fidelidade e Indicação compartilham o conceito de "saldo do cliente". Se Fidelidade estiver desativada, Indicação pode armazenar créditos em uma própria tabela `referral_rewards` ou simplesmente emitir cupons automáticos.
- Cupons pode gerar códigos automaticamente para a Indicação (cupom de boas-vindas do indicado).
- Todos os três devem se integrar ao checkout de pedidos, encomendas e comandas.

## Desafio de identidade do cliente

Hoje o sistema parece tratar o cliente principalmente pelo telefone (`customer_phone`) e não por conta persistente. Para Fidelidade e Indicação funcionarem bem, recomenda-se uma tabela `customers` (tenant-scoped):

- `restaurant_id`, `phone`, `name`, `email`, `created_at`
- Índice único por `restaurant_id, phone`

Assim, pedidos, saldos, resgates e indicações referenciam um `customer_id` estável, não só um telefone digitado no checkout. Sem isso, a fidelidade fica frágil (qualquer pessoa pode digitar o mesmo telefone e usar pontos de outro).

## Camadas de controle de acesso

1. **Plano**: adicionar `loyalty_cashback`, `coupons`, `referral_program` à lista `modules` dos planos Pro/Premium/Enterprise em `src/types/tenant.ts`.
2. **Ativação**: adicionar os três `module_name` na tabela `restaurant_modules` (CHECK constraint e `MODULE_NAME_MAP`).
3. **Permissão**: admin com acesso à seção `marketing` ou seção dedicada `loyalty` poderá gerenciar.
4. **RLS**: todas as tabelas novas terão `restaurant_id` e políticas usando `get_user_restaurant_id(auth.uid())` para admin e, quando público, acesso por `restaurant_id` via tenant slug (padrão já usado em `pre_orders`, `reservations`, etc.).

## Rotas sugeridas

- Admin:
  - `/admin/:slug/fidelidade` → `AdminLoyalty`
  - `/admin/:slug/cupons` → `AdminCoupons`
  - `/admin/:slug/indicacao` → `AdminReferrals`
- Público (integrado):
  - Campos de cupom/pontos no checkout de cardápio, encomendas e comandas.
- Marketing:
  - `/modulos/fidelidade-e-cashback`
  - `/modulos/cupons-e-promocoes`
  - `/modulos/programa-de-indicacao`

## Próximos passos para implementação

1. Validar se o CHECK constraint de `restaurant_modules.module_name` já permite os novos nomes; se não, criar migration `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT`.
2. Adicionar entradas em `MODULE_NAME_MAP`, `MODULE_INFO`, `moduleLandings.ts` e `PLANS`.
3. Criar tabelas `customers`, `loyalty_programs`, `loyalty_tiers`, `loyalty_rewards`, `customer_loyalty_balances`, `loyalty_transactions`, `coupons`, `coupon_redemptions`, `referral_programs`, `referral_codes`, `referral_referrals` com RLS e grants.
4. Criar as páginas admin correspondentes.
5. Integrar campos de cupom/pontos nos checkouts existentes.
6. Adicionar rotas de marketing e imagens dos módulos.

## Perguntas em aberto para decisão do produto

1. O cliente deve criar uma conta com senha para acumular pontos, ou basta o telefone + SMS?
2. Fidelidade e Indicação devem ser um único módulo de "CRM" ou três módulos independentes?
3. O resgate de pontos acontece apenas no checkout online ou também pode ser feito pelo garçom/admin?
4. Cupons podem ser combinados (cupom + pontos) ou apenas um por pedido?
