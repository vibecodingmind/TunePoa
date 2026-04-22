import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let schemaEnsured = false
let seedAttempted = false

/**
 * Create the Prisma client. Wrapped in try-catch so the app doesn't crash
 * at import time if DATABASE_URL is misconfigured. Individual API routes
 * will handle the null case gracefully.
 */
function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })
}

let _client: PrismaClient | null = null

function getDb(): PrismaClient | null {
  if (!_client) {
    try {
      _client = createClient()
    } catch (err: any) {
      console.error('[db] Failed to create PrismaClient:', err?.message)
      return null
    }
  }
  return _client
}

/**
 * Database client. Use `getDb()` in API routes for safe access with
 * null-checking, or use `db` directly if you want Prisma to throw
 * on misconfiguration (original behaviour for Railway where DB is valid).
 *
 * On Railway (production), DATABASE_URL is always set by the platform,
 * so `db` will work fine. Locally, use `getDb()` if you don't have Postgres.
 */
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * In production (Railway), automatically push schema and seed the database
 * on first startup. This ensures the app works after a fresh deploy.
 */
async function ensureSchemaAndSeed() {
  if (schemaEnsured || process.env.NODE_ENV !== 'production') return

  try {
    await db.pricingTier.count({ take: 0 })
    const tierCount = await db.pricingTier.count()
    if (tierCount === 0 && !seedAttempted) {
      seedAttempted = true
      globalThis.__TUNEPOA_NEEDS_SEED = true
    }
    schemaEnsured = true
  } catch {
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'pipe',
        timeout: 60000,
      })
      globalThis.__TUNEPOA_NEEDS_SEED = true
      schemaEnsured = true
    } catch {
      schemaEnsured = true
    }
  }
}

ensureSchemaAndSeed().catch(() => {})

declare global {
  var __TUNEPOA_NEEDS_SEED: boolean | undefined
}
