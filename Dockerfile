# ============================================
# Plataforma Chama-atende
# Dockerfile para build de produção
# ============================================

# ============================================
# Stage 1: Build da aplicação React
# ============================================
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instalar dependências
# --legacy-peer-deps para resolver conflitos de peer dependencies
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Variáveis de ambiente para o build do Vite
# Estas são injetadas durante o build e ficam no bundle final
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

# Definir as variáveis de ambiente para o processo de build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Executar build de produção
RUN npm run build

# ============================================
# Stage 2: Servidor Nginx para produção
# ============================================
FROM nginx:1.25-alpine

# Labels para identificação
LABEL maintainer="Chama-atende"
LABEL description="Plataforma de gestão para restaurantes"
LABEL version="1.0"

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar arquivos do build React para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Criar usuário não-root para segurança (opcional)
# RUN chown -R nginx:nginx /usr/share/nginx/html

# Expor porta 80 (HTTP)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Iniciar Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
