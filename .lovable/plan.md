
## Problema

Hoje `/onboarding` exige um usuário já autenticado e usa `user.id` (via `useAuth`) como `owner_id` do restaurante. Se alguém que já está logado (ex: darionascimento@gmail.com) clica em "Começar grátis" na Landing, o novo restaurante é vinculado à mesma conta em vez de criar um usuário isolado para o novo cliente.

## Objetivo

Cada novo cadastro de restaurante deve criar um **usuário novo e isolado** (email/senha próprios), independentemente de qualquer sessão ativa no navegador.

## Fluxo novo

Transformar `/onboarding` em um formulário único com duas seções:

1. **Dados do responsável** (novos campos)
   - Nome completo
   - Email
   - Senha + Confirmar senha
2. **Dados do restaurante** (o que já existe)
   - Nome, slug, subtítulo, plano, checkbox de trial

Ao submeter:

1. Se houver sessão ativa no navegador, chamar `supabase.auth.signOut()` antes de criar a nova conta — evita "sequestrar" a sessão anterior e garante que a nova conta seja a que fica logada.
2. Chamar `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` com `emailRedirectTo = window.location.origin`. O trigger `handle_new_user` já cria automaticamente o `profiles` e o `user_roles` (staff) para esse novo `auth.users`.
3. Se o projeto exigir confirmação de email, o `signUp` retorna sessão nula — nesse caso fazemos `signInWithPassword` imediato para obter um token válido (assumindo confirmação de email desabilitada, comportamento padrão do projeto atual). Se falhar, mostrar erro claro.
4. Com a sessão do novo usuário ativa, chamar a Edge Function `create-tenant` normalmente. Ela vai:
   - Ler `user.id` do JWT do novo usuário (código atual não muda).
   - Criar `restaurants` com `owner_id = novo_user.id`.
   - Inserir `tenant_user_roles(user_id = novo_user.id, role = 'owner')`.
5. Redirecionar para `/admin/{slug}` — já logado como o novo dono.

## Alterações de código

### `src/pages/OnboardingPage.tsx` (única alteração significativa)

- Remover a exigência de estar logado e a tela "Acesso Necessário".
- Adicionar ao `onboardingSchema` os campos `fullName`, `email`, `password`, `confirmPassword` com validação zod (incluindo refine para senhas iguais).
- Renderizar os novos campos no topo do formulário, em uma seção "Sua conta".
- No `onSubmit`:
  1. `await supabase.auth.signOut()` (silencioso; ignora erro se não havia sessão).
  2. `await supabase.auth.signUp(...)`.
  3. Se `data.session` for `null`, `await supabase.auth.signInWithPassword(...)`.
  4. Chamar `supabase.functions.invoke('create-tenant', ...)` como hoje.
  5. Toasts de erro específicos: email já cadastrado, senha fraca, slug em uso.
- Remover import/uso de `useAuth` para o gate; ainda pode ser usado só se necessário.

### Não alterar

- `create-tenant/index.ts`: já pega o `user` do JWT — funciona com qualquer usuário autenticado.
- `SignupPage.tsx`, `LoginPage.tsx`: continuam existindo para logins/cadastros avulsos; a Landing continua apontando para `/onboarding`.
- Trigger `handle_new_user` e tabelas: nada a migrar.

## Observação sobre dados existentes

Isto corrige apenas cadastros futuros. Restaurantes já criados sob a conta darionascimento continuam vinculados a ela — se o usuário quiser transferir a titularidade de um restaurante existente para outro email, isso é um pedido separado (podemos fazer via `UPDATE tenant_user_roles`/`restaurants.owner_id`).
