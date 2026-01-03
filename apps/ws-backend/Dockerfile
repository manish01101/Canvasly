FROM node:20-alpine AS base

# Prune Stage
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
# Note: Changing scope to ws-backend
RUN turbo prune --scope=ws-backend --docker

# Install & Build Stage
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
# Build the project
RUN pnpm run build --filter=ws-backend

# Production Runner Stage
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .

EXPOSE 8080
CMD ["node", "apps/ws-backend/dist/index.js"]