FROM node:20-alpine AS base

# ---------------------------------------------------
# 1. BUILDER
# ---------------------------------------------------
FROM base AS builder
# specific to Alpine: required for Next.js (SWC) build process
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
# Only prune 'web' 
RUN turbo prune --scope=web --docker

# ---------------------------------------------------
# 2. INSTALLER
# ---------------------------------------------------
FROM base AS installer
WORKDIR /app
RUN npm install -g pnpm turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

# Build only the web app
RUN turbo run build --filter=web...

# ---------------------------------------------------
# 3. RUNNER
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Required for Next.js runtime (image optimization etc.)
RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone build artifacts
# 1. Public assets (images, fonts, etc.)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# 2. Standalone server (node_modules + server code)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# 3. Static assets (CSS, JS chunks)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]