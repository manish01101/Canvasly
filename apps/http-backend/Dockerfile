FROM node:20-alpine AS base

#builder->Takes the massive repo and filters it down.
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune --scope=http-backend --docker

#installer->Installs specific dependencies and compiles the TypeScript code.
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# (frozen lockfile for consistency)
RUN pnpm install --frozen-lockfile 
COPY --from=builder /app/out/full/ .
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN pnpm run build --filter=http-backend


#runner->only part that actually goes to production. It copies only the compiled Javascript files from the installer stage. It leaves behind the heavy source code, TypeScript compilers, and dev tools.
FROM base AS runner
WORKDIR /app
# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy the built app
COPY --from=installer /app .

ENV PORT=8000
EXPOSE 8000
CMD ["node", "apps/http-backend/dist/index.js"]