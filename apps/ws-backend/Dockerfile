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
RUN turbo prune --scope=ws-backend --docker

# ---------------------------------------------------
# 2. INSTALLER: Installs deps and compiles code
# ---------------------------------------------------
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Install all dependencies
RUN pnpm install --frozen-lockfile
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
# Build the app and all its workspace dependencies
RUN turbo run build --filter=ws-backend...
# ---------------------------------------------------
# pnpm deploy creates a fully self-contained directory for the app.
# Unlike node_modules symlinks, this copies workspace packages as real folders.
# the official pnpm solution for deploying monorepo apps in Docker.
# ---------------------------------------------------
RUN pnpm deploy --filter=ws-backend --prod --legacy /app/deploy

# for further optimisation
# Strip source files, wrong-platform Prisma engines, and junk from deploy output
RUN find /app/deploy -name "*.ts" ! -name "*.d.ts" -delete \
  && find /app/deploy -name "tsconfig*.json" -delete \
  && find /app/deploy -name "*.tsbuildinfo" -delete \
  && find /app/deploy/node_modules -name "libquery_engine-*" \
       ! -name "libquery_engine-linux-musl*" -delete \
  && find /app/deploy/node_modules -name "query-engine-*" \
       ! -name "query-engine-linux-musl*" -delete


# ---------------------------------------------------
# 3. RUNNER: Lean production image
# Uses the output of `pnpm deploy` — a standalone folder with no symlinks.
# ws-backend does not run migrations so no prisma CLI needed at runtime.
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Required by Prisma client (openssl) and native addons (libc6-compat)
RUN apk add --no-cache openssl libc6-compat

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the self-contained deploy output — real folders, no symlinks
COPY --from=installer --chown=expressjs:nodejs /app/deploy .
# Copy the compiled dist separately since pnpm deploy copies source, not dist
COPY --from=installer --chown=expressjs:nodejs /app/apps/ws-backend/dist ./dist
# Only copy the schema file, not the entire prisma dir
COPY --from=installer --chown=expressjs:nodejs /app/packages/db/prisma/schema.prisma ./packages/db/prisma/schema.prisma
# Only copy generated client, then remove duplicate Prisma engine binaries
COPY --from=installer --chown=expressjs:nodejs /app/packages/db/src/generated ./packages/db/src/generated
RUN find ./packages/db/src/generated -name "libquery_engine-*" \
       ! -name "libquery_engine-linux-musl*" -delete

USER expressjs

# Use the local prisma CLI from node_modules to guarantee version consistency
ENV PATH="/app/node_modules/.bin:$PATH"
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]