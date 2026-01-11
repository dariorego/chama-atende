# 🚀 Guia de Deploy: Plataforma Chama-atende

## Publicação via GitHub + EasyPanel + Supabase

---

## 📋 Índice

1. [Introdução e Visão Geral](#1-introdução-e-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Arquitetura da Solução](#4-arquitetura-da-solução)
5. [Arquivos de Configuração](#5-arquivos-de-configuração)
6. [Configuração do Supabase](#6-configuração-do-supabase)
7. [Configuração do GitHub](#7-configuração-do-github)
8. [Deploy no EasyPanel](#8-deploy-no-easypanel)
9. [Configurações Pós-Deploy](#9-configurações-pós-deploy)
10. [CI/CD e Atualizações](#10-cicd-e-atualizações)
11. [Monitoramento e Logs](#11-monitoramento-e-logs)
12. [Backup e Recuperação](#12-backup-e-recuperação)
13. [Troubleshooting](#13-troubleshooting)
14. [Checklist de Produção](#14-checklist-de-produção)
15. [Anexos](#15-anexos)

---

## 1. Introdução e Visão Geral

### 1.1 Sobre a Plataforma

A **Chama-atende** é uma plataforma completa de gestão para restaurantes, oferecendo:

| Módulo | Descrição |
|--------|-----------|
| 📱 **Cardápio Digital** | Menu interativo com categorias, produtos e preços |
| 🍳 **Pedidos Cozinha** | Gestão de pedidos com status em tempo real |
| 🔔 **Chamada de Garçom** | Sistema de chamadas por QR Code nas mesas |
| 📅 **Reservas Online** | Agendamento de mesas com confirmação |
| ⏳ **Fila de Espera** | Gerenciamento de fila virtual |
| ⭐ **Avaliações** | Sistema de feedback dos clientes |
| 📦 **Encomendas** | Pedidos antecipados para retirada |

### 1.2 Objetivo deste Documento

Guiar a publicação da plataforma em ambiente de produção utilizando:
- **GitHub** para versionamento e integração
- **EasyPanel** para hospedagem e orquestração
- **Supabase** como backend (banco de dados, autenticação, storage)

---

## 2. Stack Tecnológico

### 2.1 Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | 18.3.x | Biblioteca de UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 5.x | Build tool e dev server |
| Tailwind CSS | 3.x | Framework CSS utility-first |
| shadcn/ui | Latest | Componentes de UI |
| React Router | 6.x | Roteamento SPA |
| TanStack Query | 5.x | Gerenciamento de estado server |

### 2.2 Backend (Supabase)

| Serviço | Função |
|---------|--------|
| PostgreSQL | Banco de dados relacional |
| Auth | Autenticação e autorização |
| Storage | Armazenamento de arquivos |
| Realtime | Subscriptions em tempo real |
| Edge Functions | Funções serverless (opcional) |

### 2.3 Infraestrutura

| Componente | Função |
|------------|--------|
| Docker | Containerização |
| Nginx | Servidor web para SPA |
| EasyPanel | Orquestração e deploy |
| Traefik | Reverse proxy e SSL |
| Let's Encrypt | Certificados SSL gratuitos |

---

## 3. Pré-requisitos

### 3.1 Conta EasyPanel

#### Opção A: EasyPanel Cloud (Recomendado para iniciantes)
- Acesse [easypanel.io](https://easypanel.io)
- Crie uma conta
- Escolha um plano (há opção gratuita para testes)

#### Opção B: EasyPanel Self-Hosted
Requisitos mínimos do servidor:

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| vCPU | 1 | 2 |
| RAM | 1 GB | 2 GB |
| Disco | 20 GB SSD | 40 GB SSD |
| Sistema | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Rede | IP público fixo | IP público fixo |

**Instalação do EasyPanel no servidor:**
```bash
# Conectar via SSH
ssh root@seu-servidor-ip

# Instalar EasyPanel
curl -sSL https://get.easypanel.io | sh
```

### 3.2 Conta GitHub

- Repositório do projeto (público ou privado)
- Token de acesso ou OAuth configurado
- Permissão de leitura no repositório

### 3.3 Conta Supabase

#### Criar Projeto no Supabase Cloud
1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: `chama-atende-prod`
   - **Database Password**: (anote em local seguro!)
   - **Region**: `South America (São Paulo)` - sa-east-1
5. Aguarde a criação (2-3 minutos)

#### Credenciais Necessárias
Após criar o projeto, obtenha em **Settings > API**:

| Credencial | Onde Encontrar | Uso |
|------------|----------------|-----|
| Project URL | Settings > API | `VITE_SUPABASE_URL` |
| Anon Key | Settings > API (public) | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Project Ref | URL do projeto | `VITE_SUPABASE_PROJECT_ID` |

⚠️ **IMPORTANTE**: Nunca exponha a `service_role key` no frontend!

### 3.4 Domínio

| Configuração | Exemplo |
|--------------|---------|
| Domínio | `app.seurestaurante.com.br` |
| Registro DNS | Tipo A apontando para IP do EasyPanel |
| TTL | 300 segundos |

**Verificação DNS:**
```bash
# Verificar propagação
dig app.seurestaurante.com.br +short
# Deve retornar o IP do seu servidor EasyPanel
```

---

## 4. Arquitetura da Solução

### 4.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
│                                  │                                       │
│                     ┌────────────┴────────────┐                         │
│                     │  app.seurestaurante.com │                         │
│                     └────────────┬────────────┘                         │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │ HTTPS (443)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EASYPANEL SERVER                                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    TRAEFIK (Reverse Proxy)                          │ │
│  │                                                                      │ │
│  │  • Terminação SSL automática (Let's Encrypt)                        │ │
│  │  • Roteamento baseado em domínio                                    │ │
│  │  • Load balancing (se múltiplas instâncias)                         │ │
│  │  • Headers de segurança                                             │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │ HTTP (80)                                │
│                               ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              CONTAINER: CHAMA-ATENDE                                │ │
│  │                                                                      │ │
│  │  ┌──────────────────────────────────────────────────────────────┐  │ │
│  │  │                         NGINX                                 │  │ │
│  │  │                                                               │  │ │
│  │  │  • Serve arquivos estáticos (React build)                    │  │ │
│  │  │  • SPA routing (fallback para index.html)                    │  │ │
│  │  │  • Compressão Gzip                                           │  │ │
│  │  │  • Cache de assets (JS, CSS, imagens)                        │  │ │
│  │  │  • Headers de segurança (CSP, X-Frame-Options)               │  │ │
│  │  └──────────────────────────────────────────────────────────────┘  │ │
│  │                                                                      │ │
│  │  📁 /usr/share/nginx/html/                                          │ │
│  │     ├── index.html                                                   │ │
│  │     ├── assets/                                                      │ │
│  │     │   ├── index-[hash].js                                         │ │
│  │     │   └── index-[hash].css                                        │ │
│  │     └── favicon.ico                                                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS (API Calls)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD                                   │
│                    (xxxxx.supabase.co)                                   │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │                 │  │                 │  │                 │         │
│  │   PostgreSQL    │  │      Auth       │  │    Storage      │         │
│  │                 │  │                 │  │                 │         │
│  │  • 18 tabelas   │  │  • Email/Pass   │  │  • Bucket:      │         │
│  │  • RLS ativo    │  │  • JWT tokens   │  │    imagens      │         │
│  │  • Triggers     │  │  • Roles        │  │  • Público      │         │
│  │  • Functions    │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │                 │  │                 │                               │
│  │    Realtime     │  │ Edge Functions  │                               │
│  │                 │  │   (opcional)    │                               │
│  │  • Subscriptions│  │                 │                               │
│  │  • WebSocket    │  │  • Webhooks     │                               │
│  │                 │  │  • Integrações  │                               │
│  └─────────────────┘  └─────────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Fluxo de Requisições

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Cliente │────▶│  Traefik │────▶│  Nginx   │────▶│  React   │
│ (Browser)│     │  (SSL)   │     │ (Static) │     │  (SPA)   │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                                                        │ API Calls
                                                        ▼
                                                  ┌──────────┐
                                                  │ Supabase │
                                                  │  (API)   │
                                                  └──────────┘
```

### 4.3 Estrutura de Pastas do Projeto

```
chama-atende/
├── 📁 public/                    # Arquivos estáticos públicos
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
│
├── 📁 src/                       # Código fonte React
│   ├── 📁 components/            # Componentes React
│   │   ├── 📁 admin/            # Componentes do painel admin
│   │   ├── 📁 auth/             # Componentes de autenticação
│   │   ├── 📁 layout/           # Layouts (Admin, Client)
│   │   └── 📁 ui/               # Componentes UI (shadcn)
│   │
│   ├── 📁 hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAdminOrders.ts
│   │   └── ...
│   │
│   ├── 📁 pages/                 # Páginas da aplicação
│   │   ├── 📁 admin/            # Páginas administrativas
│   │   ├── MenuPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   │
│   ├── 📁 integrations/          # Integrações externas
│   │   └── 📁 supabase/
│   │       ├── client.ts        # Cliente Supabase
│   │       └── types.ts         # Tipos gerados
│   │
│   ├── 📁 lib/                   # Utilitários
│   ├── 📁 types/                 # Tipos TypeScript
│   ├── App.tsx                   # Componente raiz
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Estilos globais
│
├── 📁 supabase/                  # Configuração Supabase
│   ├── config.toml              # Configuração local
│   └── 📁 migrations/           # Migrações SQL
│
├── 📄 Dockerfile                 # Build Docker
├── 📄 nginx.conf                 # Configuração Nginx
├── 📄 .dockerignore              # Exclusões Docker
├── 📄 .env.example               # Template de variáveis
├── 📄 package.json               # Dependências
├── 📄 vite.config.ts             # Configuração Vite
├── 📄 tailwind.config.ts         # Configuração Tailwind
└── 📄 tsconfig.json              # Configuração TypeScript
```

---

## 5. Arquivos de Configuração

### 5.1 Dockerfile

O Dockerfile utiliza build multi-stage para otimizar o tamanho da imagem final:

```dockerfile
# ============================================
# Stage 1: Build da aplicação React
# ============================================
FROM node:20-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Variáveis de ambiente para o build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Build de produção
RUN npm run build

# ============================================
# Stage 2: Servidor Nginx para produção
# ============================================
FROM nginx:1.25-alpine

# Remover configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar build do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 5.2 nginx.conf

Configuração otimizada para Single Page Application:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compressão Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml 
               application/javascript application/json;
    gzip_comp_level 6;

    # Cache para assets estáticos (JS, CSS, imagens)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Cache para imagens e fontes
    location ~* \.(ico|gif|jpe?g|png|svg|woff2?|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # SPA Fallback - redireciona todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }

    # Desabilitar cache para index.html (sempre buscar versão mais recente)
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;
}
```

### 5.3 .dockerignore

Arquivos excluídos do build Docker:

```
# Dependências
node_modules
npm-debug.log*

# Build local
dist
build

# Git
.git
.gitignore

# Ambiente
.env
.env.*
!.env.example

# IDE
.vscode
.idea
*.swp
*.swo

# Testes
coverage
*.test.ts
*.spec.ts

# Documentação
*.md
!README.md

# Supabase local
.supabase

# Outros
.DS_Store
Thumbs.db
*.log
```

### 5.4 .env.example

Template de variáveis de ambiente:

```bash
# ============================================
# Configurações do Supabase
# ============================================

# URL do projeto Supabase
# Encontre em: Supabase Dashboard > Settings > API > Project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Chave pública (anon key) do Supabase
# Encontre em: Supabase Dashboard > Settings > API > Project API keys > anon public
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ID do projeto Supabase (reference ID)
# É a parte "xxxxxxxxxxxxx" da URL do projeto
VITE_SUPABASE_PROJECT_ID=xxxxxxxxxxxxx

# ============================================
# IMPORTANTE
# ============================================
# 1. Copie este arquivo para .env
# 2. Preencha com suas credenciais reais
# 3. NUNCA commite o arquivo .env no repositório
# 4. No EasyPanel, configure estas variáveis como Build Args
```

---

## 6. Configuração do Supabase

### 6.1 Criar Projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os campos:

| Campo | Valor |
|-------|-------|
| Organization | Sua organização |
| Name | `chama-atende-prod` |
| Database Password | Senha forte (guarde com segurança!) |
| Region | `South America (São Paulo)` |
| Pricing Plan | Free (ou Pro para produção) |

4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos

### 6.2 Obter Credenciais

Navegue até **Settings > API**:

```
┌─────────────────────────────────────────────────────────────┐
│ Project Settings > API                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Project URL                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://txtgrxwulaqyfxdyxnik.supabase.co               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ↑ Use como VITE_SUPABASE_URL                                │
│                                                              │
│ Project API keys                                             │
│                                                              │
│ anon (public)                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ↑ Use como VITE_SUPABASE_PUBLISHABLE_KEY                    │
│                                                              │
│ service_role (secret)                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ NUNCA exponha esta chave no frontend!               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Project Reference ID: txtgrxwulaqyfxdyxnik                  │
│ ↑ Use como VITE_SUPABASE_PROJECT_ID                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Executar Migrações

#### Via SQL Editor

1. No Supabase Dashboard, vá para **SQL Editor**
2. Clique em **"New Query"**
3. Copie e execute o SQL das migrações em `supabase/migrations/` **na ordem cronológica**

#### Estrutura das Tabelas Principais

```sql
-- Resumo das tabelas que serão criadas:

-- Restaurantes e Configurações
CREATE TABLE restaurants (...);           -- Dados do restaurante
CREATE TABLE restaurant_modules (...);    -- Módulos ativos

-- Usuários e Permissões
CREATE TABLE profiles (...);              -- Perfis de usuários
CREATE TABLE user_roles (...);            -- Roles (admin, manager, staff)

-- Cardápio
CREATE TABLE menu_categories (...);       -- Categorias do cardápio
CREATE TABLE menu_products (...);         -- Produtos

-- Pedidos na Mesa
CREATE TABLE tables (...);                -- Mesas
CREATE TABLE table_sessions (...);        -- Sessões de mesa
CREATE TABLE orders (...);                -- Pedidos
CREATE TABLE order_items (...);           -- Itens configuráveis
CREATE TABLE order_line_items (...);      -- Itens do pedido

-- Encomendas
CREATE TABLE pre_orders (...);            -- Encomendas
CREATE TABLE pre_order_items (...);       -- Itens da encomenda

-- Outros Módulos
CREATE TABLE reservations (...);          -- Reservas
CREATE TABLE queue_entries (...);         -- Fila de espera
CREATE TABLE service_calls (...);         -- Chamadas de garçom
CREATE TABLE customer_reviews (...);      -- Avaliações
CREATE TABLE waiters (...);               -- Garçons
```

### 6.4 Configurar Storage

1. Vá para **Storage** no Dashboard
2. Clique em **"New Bucket"**
3. Configure:

| Campo | Valor |
|-------|-------|
| Name | `imagens` |
| Public bucket | ✅ Sim |
| File size limit | 5 MB |
| Allowed MIME types | `image/*` |

4. Clique em **"Create bucket"**

#### Políticas de Storage

```sql
-- Leitura pública
CREATE POLICY "Imagens são públicas" ON storage.objects
FOR SELECT USING (bucket_id = 'imagens');

-- Upload apenas para usuários autenticados
CREATE POLICY "Upload autenticado" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'imagens' 
  AND auth.role() = 'authenticated'
);

-- Atualização pelo dono
CREATE POLICY "Atualização pelo dono" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Deleção pelo dono
CREATE POLICY "Deleção pelo dono" ON storage.objects
FOR DELETE USING (
  bucket_id = 'imagens' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6.5 Configurar Autenticação

1. Vá para **Authentication > Providers**
2. Habilite **Email**:

| Configuração | Valor |
|--------------|-------|
| Enable Email provider | ✅ |
| Confirm email | ❌ (para desenvolvimento) |
| Secure email change | ✅ |

3. Em **Authentication > URL Configuration**:

| Campo | Valor |
|-------|-------|
| Site URL | `https://app.seurestaurante.com.br` |
| Redirect URLs | `https://app.seurestaurante.com.br/**` |

---

## 7. Configuração do GitHub

### 7.1 Preparar Repositório

Verifique que os arquivos estão na raiz:

```
chama-atende/
├── Dockerfile          ✅ Obrigatório
├── nginx.conf          ✅ Obrigatório
├── .dockerignore       ✅ Recomendado
├── package.json        ✅ Obrigatório
├── package-lock.json   ✅ Obrigatório
└── ...
```

### 7.2 Verificar .gitignore

Garanta que `.env` está sendo ignorado:

```gitignore
# Variáveis de ambiente
.env
.env.local
.env.*.local

# Mas mantenha o exemplo
!.env.example
```

### 7.3 Commit e Push

```bash
# Adicionar arquivos de configuração
git add Dockerfile nginx.conf .dockerignore .env.example

# Commit
git commit -m "feat: adicionar configurações para deploy EasyPanel"

# Push
git push origin main
```

### 7.4 Estrutura de Branches (Recomendado)

```
main (produção)
  │
  ├── develop (desenvolvimento)
  │     │
  │     ├── feature/nova-funcionalidade
  │     └── feature/outra-funcionalidade
  │
  └── hotfix/correcao-urgente
```

---

## 8. Deploy no EasyPanel

### 8.1 Criar Projeto

1. Acesse o **Dashboard do EasyPanel**
2. Clique em **"Create Project"**
3. Nome: `chama-atende`
4. Clique em **"Create"**

```
┌─────────────────────────────────────────────────────────────┐
│ EasyPanel Dashboard                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │  + Create       │                                        │
│  │    Project      │                                        │
│  └─────────────────┘                                        │
│                                                              │
│  Project Name: [ chama-atende          ]                    │
│                                                              │
│  [Create Project]                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Adicionar Aplicação

1. Dentro do projeto, clique em **"+ Add"**
2. Selecione **"App"**
3. Configure:

| Campo | Valor |
|-------|-------|
| App Name | `web` |
| Source | GitHub |
| Repository | `seu-usuario/chama-atende` |
| Branch | `main` |

### 8.3 Configurar Build

Na aba **"Build"**:

| Campo | Valor |
|-------|-------|
| Build Type | Dockerfile |
| Dockerfile Path | `./Dockerfile` |
| Build Context | `.` |

### 8.4 Configurar Variáveis de Ambiente

Na aba **"Environment"**, adicione como **Build Arguments**:

```
┌─────────────────────────────────────────────────────────────┐
│ Build Arguments                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ VITE_SUPABASE_URL                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://txtgrxwulaqyfxdyxnik.supabase.co               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ VITE_SUPABASE_PUBLISHABLE_KEY                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ VITE_SUPABASE_PROJECT_ID                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ txtgrxwulaqyfxdyxnik                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Add Variable]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 Configurar Domínio

Na aba **"Domains"**:

1. Clique em **"+ Add Domain"**
2. Configure:

| Campo | Valor |
|-------|-------|
| Domain | `app.seurestaurante.com.br` |
| Container Port | `80` |
| HTTPS | ✅ Enable |
| Force HTTPS | ✅ Enable |

```
┌─────────────────────────────────────────────────────────────┐
│ Domains                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌐 app.seurestaurante.com.br                           │ │
│ │    Port: 80                                             │ │
│ │    HTTPS: ✅ (Let's Encrypt)                           │ │
│ │    Status: 🟢 Active                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ Add Domain]                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.6 Deploy

1. Clique em **"Deploy"**
2. Acompanhe o build nos **Logs**
3. Aguarde a mensagem de sucesso

```
┌─────────────────────────────────────────────────────────────┐
│ Build Logs                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [12:00:01] Cloning repository...                            │
│ [12:00:05] Building Docker image...                         │
│ [12:00:10] Step 1/12 : FROM node:20-alpine AS builder       │
│ [12:00:12] Step 2/12 : WORKDIR /app                         │
│ [12:00:15] Step 3/12 : COPY package*.json ./                │
│ [12:00:20] Step 4/12 : RUN npm ci --legacy-peer-deps        │
│ [12:01:30] Step 5/12 : COPY . .                             │
│ [12:01:35] Step 6/12 : ARG VITE_SUPABASE_URL                │
│ [12:01:36] Step 7/12 : ARG VITE_SUPABASE_PUBLISHABLE_KEY    │
│ [12:01:37] Step 8/12 : RUN npm run build                    │
│ [12:02:00] ✓ Build completed successfully                   │
│ [12:02:05] Step 9/12 : FROM nginx:1.25-alpine               │
│ [12:02:10] Step 10/12 : COPY --from=builder /app/dist ...   │
│ [12:02:12] Step 11/12 : COPY nginx.conf ...                 │
│ [12:02:15] Step 12/12 : CMD ["nginx", "-g", "daemon off;"]  │
│ [12:02:20] ✓ Image built successfully                       │
│ [12:02:25] ✓ Container started                              │
│ [12:02:30] ✓ Health check passed                            │
│ [12:02:35] ✓ Deploy completed!                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Configurações Pós-Deploy

### 9.1 Atualizar Supabase

Após o deploy, atualize as URLs no Supabase:

1. Vá para **Authentication > URL Configuration**
2. Atualize:

| Campo | Valor |
|-------|-------|
| Site URL | `https://app.seurestaurante.com.br` |
| Redirect URLs | `https://app.seurestaurante.com.br/**` |

### 9.2 Criar Usuário Administrador

1. Acesse `https://app.seurestaurante.com.br/signup`
2. Crie uma conta com email e senha
3. No Supabase SQL Editor, execute:

```sql
-- Verificar o ID do usuário criado
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Promover para admin (substitua o UUID)
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'SEU-USER-UUID-AQUI';

-- Verificar
SELECT ur.*, p.email 
FROM public.user_roles ur 
JOIN public.profiles p ON p.id = ur.user_id;
```

### 9.3 Criar Restaurante Inicial

```sql
-- Inserir restaurante
INSERT INTO public.restaurants (
  name,
  slug,
  subtitle,
  status,
  is_active
) VALUES (
  'Meu Restaurante',
  'meu-restaurante',
  'O melhor da cidade',
  'open',
  true
);

-- Obter ID do restaurante
SELECT id FROM public.restaurants LIMIT 1;

-- Vincular usuário ao restaurante (substitua os UUIDs)
UPDATE public.profiles 
SET restaurant_id = 'RESTAURANT-UUID-AQUI' 
WHERE id = 'USER-UUID-AQUI';
```

### 9.4 Testar Funcionalidades

| Teste | URL | Esperado |
|-------|-----|----------|
| Hub Principal | `/` | Página de entrada com módulos |
| Cardápio | `/cardapio` | Lista de categorias e produtos |
| Login Admin | `/login` | Formulário de login |
| Dashboard | `/admin` | Dashboard administrativo |

---

## 10. CI/CD e Atualizações

### 10.1 Deploy Automático

No EasyPanel, habilite **Auto Deploy**:

1. Vá para **App Settings**
2. Habilite **"Auto Deploy on Push"**
3. Cada push para `main` dispara rebuild automático

```
┌─────────────────────────────────────────────────────────────┐
│ App Settings                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Auto Deploy                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✅] Deploy automatically when code is pushed           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Branch: main                                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Deploy Manual

Para deploy manual:

1. Acesse o App no EasyPanel
2. Clique em **"Rebuild"**

Ou via git:

```bash
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# O EasyPanel detectará automaticamente (se Auto Deploy ativado)
```

### 10.3 Rollback

Para voltar a uma versão anterior:

1. No EasyPanel, vá para **"Deployments"**
2. Encontre o deploy anterior funcionando
3. Clique em **"Redeploy"**

---

## 11. Monitoramento e Logs

### 11.1 Logs em Tempo Real

No EasyPanel:

1. Vá para o App
2. Clique na aba **"Logs"**
3. Visualize logs do Nginx em tempo real

```
┌─────────────────────────────────────────────────────────────┐
│ Application Logs                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [2024-01-15 10:30:15] 200 GET /                             │
│ [2024-01-15 10:30:16] 200 GET /assets/index-abc123.js       │
│ [2024-01-15 10:30:17] 200 GET /assets/index-def456.css      │
│ [2024-01-15 10:30:20] 200 GET /cardapio                     │
│ [2024-01-15 10:30:25] 200 GET /api/health                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Métricas do Container

O EasyPanel exibe:

| Métrica | Descrição |
|---------|-----------|
| CPU | Uso de processador |
| RAM | Uso de memória |
| Disco | Espaço utilizado |
| Network | Tráfego de rede |

### 11.3 Logs do Supabase

Para logs do backend:

1. Acesse o **Supabase Dashboard**
2. Vá para **Logs**
3. Filtre por serviço:
   - **Postgres**: Queries SQL
   - **Auth**: Autenticação
   - **Storage**: Upload de arquivos
   - **Realtime**: WebSocket

---

## 12. Backup e Recuperação

### 12.1 Backup do Supabase

#### Backups Automáticos (Supabase Cloud)

- **Free tier**: Backup diário, retenção 7 dias
- **Pro tier**: Backup diário, retenção 30 dias
- Restauração via Dashboard

#### Backup Manual

```bash
# Via pg_dump (necessita acesso direto)
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# Download via Dashboard
# Supabase > Database > Backups > Download
```

### 12.2 Backup de Configurações

Mantenha versionado no Git:

```
backup-configs/
├── .env.production      # Variáveis (encriptadas)
├── Dockerfile           # Build config
├── nginx.conf           # Nginx config
└── supabase-migrations/ # SQL migrations
```

### 12.3 Recuperação

#### Restaurar Aplicação

```bash
# Re-deploy a partir do Git
git checkout v1.0.0  # ou commit específico
git push origin main --force
```

#### Restaurar Banco de Dados

1. Supabase Dashboard > **Database**
2. **Backups** > Selecione backup
3. **Restore**

---

## 13. Troubleshooting

### 13.1 Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| **Página em branco** | Variáveis de ambiente não injetadas | Verificar Build Args no EasyPanel |
| **Erro 502 Bad Gateway** | Container não iniciou | Verificar logs do container |
| **Erro de CORS** | Domínio não autorizado | Adicionar URL nas Redirect URLs do Supabase |
| **SSL inválido** | DNS não propagou | Aguardar propagação ou verificar registro A |
| **Login não funciona** | Site URL incorreta | Atualizar Site URL no Supabase Auth |
| **Imagens não carregam** | Bucket não público | Verificar políticas do Storage |
| **Erro 404 em rotas** | Nginx não configurado para SPA | Verificar nginx.conf (try_files) |

### 13.2 Verificações de Debug

#### Verificar DNS

```bash
# Propagação DNS
dig app.seurestaurante.com.br +short
nslookup app.seurestaurante.com.br

# Deve retornar o IP do servidor EasyPanel
```

#### Verificar Container

No EasyPanel:

```bash
# Ver logs
Logs > Selecionar período

# Verificar saúde
curl https://app.seurestaurante.com.br/health
# Deve retornar: healthy
```

#### Verificar Variáveis

1. Inspecionar o build no console do navegador:
2. `F12` > Console
3. Verificar se há erros de conexão com Supabase

#### Verificar Supabase

```sql
-- No SQL Editor, testar conexão
SELECT current_database(), current_user, now();

-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 13.3 Logs Detalhados

#### Habilitar Debug no Nginx

```nginx
# nginx.conf
error_log /var/log/nginx/error.log debug;
```

#### Verificar Network no Browser

1. `F12` > Network
2. Filtrar por `Fetch/XHR`
3. Verificar requests para Supabase

---

## 14. Checklist de Produção

### 14.1 Pré-Deploy

- [ ] Dockerfile na raiz do projeto
- [ ] nginx.conf na raiz do projeto
- [ ] .dockerignore configurado
- [ ] .env.example atualizado
- [ ] Todas as alterações commitadas
- [ ] Branch main atualizada

### 14.2 Supabase

- [ ] Projeto criado na região correta
- [ ] Todas as migrações executadas
- [ ] Bucket de imagens criado (público)
- [ ] Políticas de Storage configuradas
- [ ] Autenticação Email habilitada
- [ ] RLS habilitado em todas as tabelas

### 14.3 EasyPanel

- [ ] Projeto criado
- [ ] App configurado com GitHub
- [ ] Build Arguments configurados
- [ ] Domínio adicionado
- [ ] HTTPS habilitado
- [ ] Auto Deploy configurado (opcional)

### 14.4 Pós-Deploy

- [ ] Site URL atualizada no Supabase
- [ ] Redirect URLs configuradas
- [ ] Usuário admin criado
- [ ] Restaurante inicial cadastrado
- [ ] Teste de login realizado
- [ ] Teste de upload de imagem
- [ ] Teste de todas as rotas principais

### 14.5 Segurança

- [ ] service_role key NÃO exposta
- [ ] .env não commitado
- [ ] HTTPS forçado
- [ ] Headers de segurança no nginx
- [ ] RLS ativo em todas as tabelas

---

## 15. Anexos

### 15.1 Lista Completa de Dependências

#### Dependências de Produção

| Pacote | Versão | Função |
|--------|--------|--------|
| react | ^18.3.1 | Biblioteca UI |
| react-dom | ^18.3.1 | Renderização DOM |
| react-router-dom | ^6.30.1 | Roteamento |
| @supabase/supabase-js | ^2.89.0 | Cliente Supabase |
| @tanstack/react-query | ^5.83.0 | Gerenciamento de estado |
| tailwindcss-animate | ^1.0.7 | Animações Tailwind |
| class-variance-authority | ^0.7.1 | Variantes de classes |
| clsx | ^2.1.1 | Concatenação de classes |
| tailwind-merge | ^2.6.0 | Merge de classes Tailwind |
| lucide-react | ^0.462.0 | Ícones |
| date-fns | ^3.6.0 | Manipulação de datas |
| zod | ^3.25.76 | Validação de schemas |
| react-hook-form | ^7.61.1 | Formulários |
| @hookform/resolvers | ^3.10.0 | Resolvers para validação |
| sonner | ^1.7.4 | Notificações toast |
| recharts | ^2.15.4 | Gráficos |
| qrcode.react | ^4.2.0 | Geração de QR Codes |
| next-themes | ^0.3.0 | Temas dark/light |
| vaul | ^0.9.9 | Drawer component |
| embla-carousel-react | ^8.6.0 | Carousel |
| react-day-picker | ^8.10.1 | Seletor de data |
| react-image-crop | ^11.0.10 | Crop de imagens |
| react-resizable-panels | ^2.1.9 | Painéis redimensionáveis |
| cmdk | ^1.1.1 | Command menu |
| input-otp | ^1.4.2 | Input OTP |

#### Componentes Radix UI

| Pacote | Versão |
|--------|--------|
| @radix-ui/react-accordion | ^1.2.11 |
| @radix-ui/react-alert-dialog | ^1.1.14 |
| @radix-ui/react-aspect-ratio | ^1.1.7 |
| @radix-ui/react-avatar | ^1.1.10 |
| @radix-ui/react-checkbox | ^1.3.2 |
| @radix-ui/react-collapsible | ^1.1.11 |
| @radix-ui/react-context-menu | ^2.2.15 |
| @radix-ui/react-dialog | ^1.1.14 |
| @radix-ui/react-dropdown-menu | ^2.1.15 |
| @radix-ui/react-hover-card | ^1.1.14 |
| @radix-ui/react-label | ^2.1.7 |
| @radix-ui/react-menubar | ^1.1.15 |
| @radix-ui/react-navigation-menu | ^1.2.13 |
| @radix-ui/react-popover | ^1.1.14 |
| @radix-ui/react-progress | ^1.1.7 |
| @radix-ui/react-radio-group | ^1.3.7 |
| @radix-ui/react-scroll-area | ^1.2.9 |
| @radix-ui/react-select | ^2.2.5 |
| @radix-ui/react-separator | ^1.1.7 |
| @radix-ui/react-slider | ^1.3.5 |
| @radix-ui/react-slot | ^1.2.3 |
| @radix-ui/react-switch | ^1.2.5 |
| @radix-ui/react-tabs | ^1.1.12 |
| @radix-ui/react-toast | ^1.2.14 |
| @radix-ui/react-toggle | ^1.1.9 |
| @radix-ui/react-toggle-group | ^1.1.10 |
| @radix-ui/react-tooltip | ^1.2.7 |

#### Drag and Drop

| Pacote | Versão |
|--------|--------|
| @dnd-kit/core | ^6.3.1 |
| @dnd-kit/sortable | ^10.0.0 |
| @dnd-kit/utilities | ^3.2.2 |

#### Fontes

| Pacote | Versão |
|--------|--------|
| @fontsource/plus-jakarta-sans | ^5.2.8 |

### 15.2 Variáveis de Ambiente Completas

```bash
# ============================================
# VARIÁVEIS OBRIGATÓRIAS
# ============================================

# URL do projeto Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Chave pública do Supabase (anon key)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ID do projeto Supabase
VITE_SUPABASE_PROJECT_ID=xxxxxxxxxxxxx
```

### 15.3 Comandos Úteis

```bash
# ============================================
# Desenvolvimento Local
# ============================================

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# ============================================
# Docker Local
# ============================================

# Build da imagem
docker build \
  --build-arg VITE_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... \
  --build-arg VITE_SUPABASE_PROJECT_ID=xxx \
  -t chama-atende:latest .

# Executar container
docker run -p 8080:80 chama-atende:latest

# Acessar: http://localhost:8080

# ============================================
# Git
# ============================================

# Status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: descrição"

# Push
git push origin main

# Pull
git pull origin main

# ============================================
# Supabase CLI (opcional)
# ============================================

# Login
supabase login

# Link projeto
supabase link --project-ref xxxxxxxxxxxxx

# Push migrations
supabase db push

# Pull schema
supabase db pull
```

### 15.4 Referências

| Recurso | URL |
|---------|-----|
| Documentação EasyPanel | https://easypanel.io/docs |
| Documentação Supabase | https://supabase.com/docs |
| Documentação Vite | https://vitejs.dev/guide |
| Documentação React | https://react.dev |
| Documentação Tailwind | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com |

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este documento
2. Consulte a documentação oficial das ferramentas
3. Abra uma issue no repositório GitHub

---

**Documento criado para a Plataforma Chama-atende**  
**Versão:** 1.0  
**Última atualização:** Janeiro 2025
