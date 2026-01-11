# ============================================
# Plataforma Chama-atende
# Dockerfile para build de produção
# ============================================

# ======= Build stage =======
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifestos (com ou sem lockfile)
COPY package.json ./
COPY package-lock.json* npm-shrinkwrap.json* ./

# Instala dependências:
# - se tiver lockfile -> npm ci (reprodutível)
# - se não tiver -> npm install (fallback)
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# Copia o restante do projeto
COPY . .

# Build args (para Vite; ficam disponíveis só no build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

# Executa build com VITE_* somente no comando (sem gravar ENV na imagem)
RUN VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
    VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID" \
    npm run build

# Listar arquivos gerados para debug
RUN ls -la dist/

# ======= Runtime stage =======
FROM nginx:1.25-alpine

# Labels para identificação
LABEL maintainer="Chama-atende"
LABEL description="Plataforma de gestão para restaurantes"
LABEL version="1.0"

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia build do React/Vite para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx (mais completa com gzip, cache, segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
