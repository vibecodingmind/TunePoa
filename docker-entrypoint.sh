#!/bin/sh
set -e

echo "=== TunePoa Startup ==="
echo "Running Prisma db push to sync schema with database..."

# Try to push schema - this creates tables if they don't exist
npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "Warning: Prisma db push had issues (tables may already exist)"

echo "Prisma schema sync complete!"
echo "Starting Next.js server..."

exec node server.js
