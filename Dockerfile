# Build stage
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json bun.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps 2>/dev/null || yarn install --frozen-lockfile 2>/dev/null || npm install

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Run database migrations on build (schema push)
# In production, Railway will inject DATABASE_URL
RUN if [ -n "$DATABASE_URL" ]; then npx prisma db push --skip-generate; else echo "No DATABASE_URL - skipping db push"; fi 2>/dev/null || true

RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Startup script that runs migrations then starts the server
COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
