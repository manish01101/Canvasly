FROM node:20-alpine AS base

# ---------------------------------------------------
# 1. BUILDER: Filters the repo down to just this app
# ---------------------------------------------------
FROM base AS builder
# Required for Next.js SWC compiler on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
# Prune the workspace to just the web app
RUN turbo prune --scope=web --docker

# ---------------------------------------------------
# 2. INSTALLER: Installs deps and compiles code
# ---------------------------------------------------
FROM base AS installer
# Required for Next.js SWC compiler and native addons
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# shamefully-hoist ensures nested workspace packages resolve correctly in pnpm monorepos
RUN pnpm install --frozen-lockfile --shamefully-hoist
# Copy the full source code
COPY --from=builder /app/out/full/ .
# Set NODE_ENV before build so Next.js applies production optimizations during next build
ENV NODE_ENV=production
# Build only the web app
# NOTE: Ensure next.config.ts has `output: 'standalone'` set, otherwise the .next/standalone directory won't be generated and the runner stage will fail.
RUN turbo run build --filter=web...

# ---------------------------------------------------
# 3. RUNNER: Lean production image
# Uses Next.js standalone output — contains its own minimal node_modules, so no need to copy the full monorepo node_modules.
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Required for Next.js image optimization and other runtime features
RUN apk add --no-cache libc6-compat

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 1. Public assets (images, fonts, etc.)
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
# 2. Standalone server — includes a self-contained node_modules, no full monorepo copy needed
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# 3. Static assets (CSS, JS chunks) — must sit alongside the standalone output
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "apps/web/server.js"]