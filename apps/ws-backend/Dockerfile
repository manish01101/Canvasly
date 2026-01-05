FROM node:20-alpine AS base

# ---------------------------------------------------
# 1. BUILDER
# ---------------------------------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo pnpm
COPY . .
RUN turbo prune --scope=ws-backend --docker

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

# Define a Build Argument for the Database URL, this allows Railway to pass the real URL during build if it wants to.
ARG DATABASE_URL
# If DATABASE_URL is empty during build, we use a generic postgres string, so 'prisma generate' knows the provider is PostgreSQL and doesn't crash.
ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:password@localhost:5432/postgres}

# copy config so 'prisma generate' works, this is required because 'prisma generate' reads the config file to know where to output files
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the project (explicitly pass the ENV variable into the turbo command)
RUN DATABASE_URL=$DATABASE_URL turbo run build --filter=ws-backend...

# ---------------------------------------------------
# 3. RUNNER
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Install openssl for Prisma Client runtime
RUN apk add --no-cache openssl libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer --chown=expressjs:nodejs /app .

# (WS Backend doesn't run migrations, so it doesn't need the config file at runtime)

ENV PORT=8080
EXPOSE 8080

# Start Command
CMD ["node", "apps/ws-backend/dist/index.js"]