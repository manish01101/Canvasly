FROM node:20-alpine AS base

# ---------------------------------------------------
# 1. BUILDER: Filters the repo down to just this app
# ---------------------------------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
# Prune the workspace to just this app
RUN turbo prune --scope=http-backend --docker

# ---------------------------------------------------
# 2. INSTALLER: Installs deps and compiles code
# ---------------------------------------------------
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Install dependencies (shamefully-hoist ensures nested packages resolve correctly in pnpm monorepos)
RUN pnpm install --frozen-lockfile --shamefully-hoist
# Copy the full source code
COPY --from=builder /app/out/full/ .
# Manually copy prisma.config.ts since turbo prune tends to exclude it
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts
# Define a build argument for the DATABASE_URL.
# Falls back to a dummy postgres URL so prisma generate doesn't crash during build.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:password@localhost:5432/postgres}
# Generate the Prisma client
RUN pnpm --filter @repo/db run db:generate
# Build the app
RUN turbo run build --filter=http-backend...

# ---------------------------------------------------
# 3. RUNNER: Lean production image
# Only compiled output, production node_modules, and prisma schema are copied — no source code or dev tools.
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Install system libs required by Prisma (openssl) and Node native addons (libc6-compat)
RUN apk add --no-cache openssl libc6-compat

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the entire app — needed because pnpm uses symlinks in node_modules that point to workspace package locations. Selective copying breaks them.
COPY --from=installer --chown=expressjs:nodejs /app .

USER expressjs

# Use the local prisma CLI from node_modules — this guarantees the CLI version matches @prisma/client exactly, avoiding subtle version mismatch bugs.
ENV PATH="/app/node_modules/.bin:$PATH"
ENV PORT=8000
EXPOSE 8000

# NOTE: Migrations are intentionally NOT run here.
# Run `prisma migrate deploy` as a one-off pre-deploy job in Railway/CI config to avoid migration races when multiple replicas start simultaneously.
CMD ["node", "apps/http-backend/dist/index.js"]