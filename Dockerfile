# =================================================
# СТАДИЯ 1: builder (сборка)
# =================================================

FROM node:lts-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci                 

COPY . .               
RUN npm run build          

# =================================================
# СТАДИЯ 2: production (финальный образ)
# =================================================
FROM node:lts-bookworm-slim

WORKDIR /app

# Берем ТОЛЬКО нужные файлы из стадии builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Устанавливаем ТОЛЬКО продакшен-зависимости
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/index.js"]


# https://docs.docker.com/guides/nodejs/