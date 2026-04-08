#!/bin/sh
set -e

echo "Running Prisma db push..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || echo "Prisma push skipped or failed (tables may already exist)"

echo "Starting Next.js server..."
exec node server.js
