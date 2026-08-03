## Diagnóstico (verificado)

- No banco, `darionascimento@gmail.com` tem apenas o papel **admin em `bistro-verde`**; os slugs existentes são `bistro-verde` e `cafecomdengo`.
- A tela do print mostra "estabelecimento (atendimentos)": a URL acessada foi `/admin/atendimentos`, e a rota `/admin/:slug/*` interpretou "atendimentos" como slug de estabelecimento. Como não existe estabelecimento com esse slug, o `AuthGuard` mostrou "Acesso não autorizado" em vez de levar ao painel correto.
- Não existe hoje nenhuma tabela/UI de permissão por módulo, nem criação de usuários (a tela Usuários é somente leitura).

## O que será feito

### 1. Corrigir o acesso "Acesso negado" indevido
- Criar uma lista de segmentos reservados do admin (atendimentos, mesas, produtos, categorias, fila, reservas, pedidos, comandas, eventos, agenda, etc.).
- Em `/admin/:slug`, se o slug for um segmento reservado (ou não existir estabelecimento com aquele slug), redirecionar automaticamente para `/admin/{slug-do-usuário}/{seção}` quando o usuário tiver apenas um estabelecimento, ou para a lista de estabelecimentos dele.
- Diferenciar as telas: "Estabelecimento não encontrado" quando o slug não existe, e "Acesso não autorizado" apenas quando o estabelecimento existe e o usuário não tem papel nele.

### 2. Admin/Owner com acesso a todos os módulos do seu slug
- `owner` e `admin` do estabelecimento passam a ter acesso irrestrito a todas as seções daquele slug (nenhuma verificação de módulo se aplica a eles).
- `manager`, `staff`, `kitchen` e `waiter` só acessam as seções liberadas nas permissões.

### 3. Permissões por módulo (banco)
- Nova tabela `tenant_user_modules` (user_id, restaurant_id, module_name), com GRANTs, RLS e políticas: somente owner/admin do estabelecimento pode conceder/remover; o próprio usuário pode ler as suas.
- Função `has_module_access(_restaurant_id, _module_name)` (SECURITY DEFINER): retorna verdadeiro se o usuário for owner/admin do estabelecimento, ou se tiver o módulo liberado.

### 4. Criar usuário com módulos detalhados (tela Usuários)
- Botão "Novo usuário" com formulário: nome, e-mail, senha, cargo (Admin / Gerente / Equipe / Cozinha / Garçom) e lista de checkboxes com todos os módulos do estabelecimento (rótulos de `MODULE_INFO`, ex.: Chamar Atendente, Mesas, Cardápio, Comanda Digital...).
- Ao escolher Admin, os módulos ficam todos marcados e desabilitados (acesso total).
- Nova Edge Function `manage-tenant-user`: valida o JWT do solicitante, confirma que ele é owner/admin do estabelecimento, cria o usuário no Auth (e-mail + senha, já confirmado), cria o papel em `tenant_user_roles` e grava as permissões de módulo. Também usada para editar cargo/módulos e desativar acesso.
- A lista de usuários passa a exibir cargo + módulos liberados, com ações de editar permissões e remover acesso.

### 5. Aplicar permissões na navegação
- `AdminLayout`: o menu lateral mostra apenas as seções permitidas ao usuário.
- `AuthGuard`: aceita a seção/módulo requerido; usuário sem permissão naquela seção vê aviso de permissão insuficiente (sem sair do painel do seu slug).

## Detalhes técnicos

- Arquivos: `src/App.tsx` (rotas/redirect e módulo por rota), `src/components/auth/AuthGuard.tsx`, `src/components/layout/AdminLayout.tsx`, `src/contexts/TenantContext.tsx` (slugs reservados), `src/hooks/useAdminUsers.ts`, novo `src/hooks/useTenantUserModules.ts`, `src/pages/admin/AdminUsers.tsx` + novo `src/components/admin/UserFormDialog.tsx`, nova função `supabase/functions/manage-tenant-user/index.ts`.
- Migração: tabela `tenant_user_modules` + GRANTs + RLS + função `has_module_access`. Backfill: owner/admin não precisam de registros; usuários existentes sem registros só terão o painel básico até o admin definir os módulos.
- Formulários seguirão o padrão do design system (`bg-surface`, `placeholder:text-surface-foreground`, tokens semânticos).
