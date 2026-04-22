import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let schemaEnsured = false
let seedAttempted = false
let _db: PrismaClient | null = null

function isValidDatabaseUrl(url?: string): boolean {
  if (!url) return false
  return url.startsWith('postgresql://') || url.startsWith('postgres://')
}

/**
 * Create PrismaClient lazily — only when first accessed.
 * Avoids crashing at import time if DATABASE_URL is missing/invalid.
 */
function createPrismaClient(): PrismaClient {
  if (!_db) {
    _db = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    })
  }
  return _db
}

/**
 * Proxy-based lazy db export.
 * Any route calling `db.model.method()` will trigger PrismaClient creation on first use,
 * not at module import time.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = createPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    // Bind methods so `this` context is correct
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = createPrismaClient()
}

/**
 * In production (Railway), automatically push schema and seed the database
 * on first startup. This ensures the app works after a fresh deploy.
 */
async function ensureSchemaAndSeed() {
  if (schemaEnsured || process.env.NODE_ENV !== 'production') return
  // Guard: skip if DATABASE_URL is missing or invalid
  if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
    console.warn(
      '[db] Skipping auto-schema: DATABASE_URL is missing or invalid. ' +
      'Set DATABASE_URL to a postgresql:// URL to enable auto-setup.'
    )
    schemaEnsured = true
    return
  }

  try {
    // Check if the PricingTier table exists (our core table)
    const client = createPrismaClient()
    await client.pricingTier.count({ take: 0 })
    // Check if data exists — if not, seed
    const tierCount = await client.pricingTier.count()
    if (tierCount === 0 && !seedAttempted) {
      seedAttempted = true
      // The seed will be triggered via the /api/seed endpoint on first request
      // We set a flag so the landing page knows to call it
      globalThis.__TUNEPOA_NEEDS_SEED = true
    }

    schemaEnsured = true
  } catch {
    // Tables missing, running prisma db push
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'pipe',
        timeout: 60000,
      })

      // After schema push, seed data is needed
      globalThis.__TUNEPOA_NEEDS_SEED = true
      schemaEnsured = true
    } catch {
      // Don't crash — let individual API routes handle DB errors gracefully
      schemaEnsured = true // Don't retry on every request
    }
  }
}

// Run on startup (non-blocking)
ensureSchemaAndSeed().catch(() => {})

// Extend globalThis type
declare global {
  var __TUNEPOA_NEEDS_SEED: boolean | undefined
}
