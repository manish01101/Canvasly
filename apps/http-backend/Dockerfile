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
WORKDIR /app
RUN npm install -g pnpm turbo
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY --from=builder /app/out/full/ .

# Define a Build Argument for the Database URL, this allows Railway to pass the real URL during build if it wants to.
ARG DATABASE_URL
# If DATABASE_URL is empty during build, we use a generic postgres string, so 'prisma generate' knows the provider is PostgreSQL and doesn't crash.
ENV DATABASE_URL=${DATABASE_URL:-postgresql://postgres:password@localhost:5432/postgres}

# copy prisma.config.ts from builder (Turbo often ignores this file)
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts

# Generate the client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the app
RUN turbo run build --filter=http-backend...

# ---------------------------------------------------
# 3. RUNNER: The Production Image (only part that actually goes to production. It copies only the compiled Javascript files from the installer stage. It leaves behind the heavy source code, TypeScript compilers, and dev tools)
# ---------------------------------------------------
FROM base AS runner
WORKDIR /app

# Install system libs & Global Prisma CLI
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g prisma

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy the built application
COPY --from=installer --chown=expressjs:nodejs /app .

# copy the config file again for the runtime this ensures 'prisma migrate' has the file it needs
COPY --from=builder --chown=expressjs:nodejs /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts

ENV PORT=8000
EXPOSE 8000

# Start command
CMD ["sh", "-c", "prisma migrate deploy --schema=packages/db/prisma/schema.prisma --config=packages/db/prisma.config.ts && node apps/http-backend/dist/index.js"]