# Migração para Supabase self-hosted (Docker Compose em VPS)

Contexto: o frontend já aponta para `https://supabase.chamaatende.com.br`
(fixado em `src/integrations/supabase/client.ts`). Falta preparar o
servidor: Edge Functions, secrets, buckets e migração das imagens.

Sem Supabase CLI: tudo abaixo é feito por SSH + `docker compose` + SQL Editor
(Studio) do self-hosted.

---

## Passo 1 — Localizar a stack no servidor

```bash
ssh root@SEU_IP
cd /caminho/da/stack/supabase/docker   # onde está o docker-compose.yml
ls                                     # deve conter docker-compose.yml, .env, volumes/
docker compose ps                      # confirme os serviços (kong, auth, rest, storage, functions...)
```

Guarde o caminho como `$STACK`:

```bash
export STACK=$(pwd)
```

---

## Passo 2 — Enviar as Edge Functions

No self-hosted, o serviço `functions` (edge-runtime) serve tudo que está em
`$STACK/volumes/functions`. Cada função é uma pasta com `index.ts`.

### 2.1 Baixar o código do projeto

Se o projeto está no GitHub (Lovable → GitHub), na VPS:

```bash
cd /opt
git clone https://github.com/SEU_USUARIO/SEU_REPO.git chamaatende-app
cd chamaatende-app
```

Alternativa sem git — copie da sua máquina:

```bash
# rodando na SUA máquina, dentro do projeto
scp -r supabase/functions root@SEU_IP:/opt/chamaatende-functions
```

### 2.2 Copiar para o volume do edge-runtime

```bash
cd $STACK
SRC=/opt/chamaatende-app/supabase/functions   # ou /opt/chamaatende-functions

mkdir -p volumes/functions
cp -r $SRC/_shared               volumes/functions/
cp -r $SRC/create-tenant         volumes/functions/
cp -r $SRC/manage-tenant-user    volumes/functions/
cp -r $SRC/migrate-menu-images   volumes/functions/
cp -r $SRC/public-api            volumes/functions/
cp -r $SRC/whatsapp-manage       volumes/functions/
cp -r $SRC/whatsapp-webhook      volumes/functions/

ls volumes/functions
```

Importante: **não** apague `volumes/functions/main` (é o router do
edge-runtime). Se ele não existir, crie:

```bash
mkdir -p volumes/functions/main
```

e use o `main/index.ts` padrão do repo oficial
(`supabase/docker/volumes/functions/main/index.ts`).

### 2.3 Desligar verificação de JWT nas funções públicas

No self-hosted o edge-runtime valida JWT via variável global. Em
`$STACK/docker-compose.yml`, no serviço `functions`, garanta:

```yaml
  functions:
    environment:
      VERIFY_JWT: "false"
```

As funções deste projeto validam a sessão em código (`auth.getUser()` +
checagem em `tenant_user_roles`), então desligar o JWT global é seguro e é
necessário para `whatsapp-webhook` (chamado pela Evolution) e para as rotas
públicas de `public-api`.

### 2.4 Reiniciar

```bash
cd $STACK
docker compose up -d functions
docker compose logs -f functions   # Ctrl+C para sair
```

### 2.5 Testar

```bash
curl -i -X OPTIONS https://supabase.chamaatende.com.br/functions/v1/migrate-menu-images
```

Esperado: `200`. Se vier `InvalidWorkerCreation: could not find an
appropriate entrypoint`, a pasta ou o `index.ts` está no lugar errado.

---

## Passo 3 — Secrets das funções

O edge-runtime lê o arquivo apontado por `env_file` no serviço `functions`
(normalmente o próprio `.env` da stack). Crie um arquivo dedicado:

```bash
cd $STACK
cat > volumes/functions/.env.functions <<'EOF'
SUPABASE_URL=https://supabase.chamaatende.com.br
SUPABASE_ANON_KEY=COLE_A_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=COLE_A_SERVICE_ROLE_KEY
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=SUA_CHAVE_GLOBAL_EVOLUTION
OPENROUTER_API_KEY=sk-or-...
WHATSAPP_WEBHOOK_SECRET=um_valor_aleatorio_forte
EOF
chmod 600 volumes/functions/.env.functions
```

No `docker-compose.yml`, serviço `functions`:

```yaml
  functions:
    env_file:
      - ./volumes/functions/.env.functions
```

Depois:

```bash
docker compose up -d functions
```

As chaves `ANON_KEY` e `SERVICE_ROLE_KEY` são as mesmas que estão no `.env`
da stack (geradas junto com o `JWT_SECRET`). Nunca exponha a service_role no
frontend.

Webhook a configurar na Evolution API:
`https://supabase.chamaatende.com.br/functions/v1/whatsapp-webhook`

---

## Passo 4 — Buckets e policies de storage

No Studio do self-hosted (`https://SEU_STUDIO`) → SQL Editor, rode:

```sql
-- Buckets públicos
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true), ('chama-atende', 'chama-atende', true)
on conflict (id) do update set public = true;

-- Leitura pública
drop policy if exists "public_read_imagens" on storage.objects;
create policy "public_read_imagens" on storage.objects
  for select using (bucket_id in ('imagens', 'chama-atende'));

-- Upload/atualização/remoção apenas autenticado
drop policy if exists "auth_insert_imagens" on storage.objects;
create policy "auth_insert_imagens" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('imagens', 'chama-atende'));

drop policy if exists "auth_update_imagens" on storage.objects;
create policy "auth_update_imagens" on storage.objects
  for update to authenticated
  using (bucket_id in ('imagens', 'chama-atende'));

drop policy if exists "auth_delete_imagens" on storage.objects;
create policy "auth_delete_imagens" on storage.objects
  for delete to authenticated
  using (bucket_id in ('imagens', 'chama-atende'));
```

Teste:

```bash
curl -I https://supabase.chamaatende.com.br/storage/v1/object/public/imagens/qualquer.jpg
# 400/404 = bucket existe e é público; 401/403 = policy faltando
```

---

## Passo 5 — Migrar as imagens do cardápio

Com os passos 2–4 concluídos, use a própria interface:

1. Entre em `plataforma.chamaatende.com/login/{slug}` como owner/admin.
2. Admin → **Importar CSV** → aba **Imagens** → card
   *Migrar imagens externas*.
3. Clique **Analisar** (mostra quantas estão fora do bucket) e depois
   **Migrar tudo** (lotes de 20, com log linha a linha).
4. Repita para cada estabelecimento: `cafecomdengo`, `bistro-verde`, etc.

O destino é `imagens/{slug}/cardapio/<timestamp>-<hash>-<nome>.<ext>` e o
`menu_products.image_url` é reescrito para a URL pública do self-hosted.

Se algum item falhar, o log mostra o motivo (`download HTTP 403`,
`upload: ...`). Rode **Migrar tudo** novamente — a função só processa o que
ainda está fora do bucket.

---

## Passo 6 — Checklist final

```bash
# funções respondendo
for f in migrate-menu-images public-api whatsapp-manage whatsapp-webhook \
         create-tenant manage-tenant-user; do
  printf '%s -> ' "$f"
  curl -s -o /dev/null -w '%{http_code}\n' -X OPTIONS \
    "https://supabase.chamaatende.com.br/functions/v1/$f"
done
```

- [ ] Todas as funções retornam `200` no OPTIONS
- [ ] Login funciona em `/login/{slug}`
- [ ] Cardápio carrega imagens de `supabase.chamaatende.com.br`
- [ ] QR code da mesa abre `/{slug}/mesa/{id}`
- [ ] Chamar atendente aparece em Admin → Atendimentos
- [ ] WhatsApp AI conecta e gera QR code

---

## Observação sobre mudanças de schema

As ferramentas de migração da Lovable ainda apontam para o projeto Supabase
Cloud antigo. De agora em diante, toda alteração de schema eu entrego como
SQL neste repositório e você aplica no **SQL Editor do self-hosted**. Guarde
os scripts em `supabase/migrations/` para manter o histórico.