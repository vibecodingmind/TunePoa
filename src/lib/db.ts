import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let schemaEnsured = false
let seedAttempted = false

/**
 * In production (Railway), automatically push schema and seed the database
 * on first startup. This ensures the app works after a fresh deploy.
 */
async function ensureSchemaAndSeed() {
  if (schemaEnsured || process.env.NODE_ENV !== 'production') return

  const client = new PrismaClient({
    log: ['error'],
  })

  try {
    // Check if the PricingTier table exists (our core table)
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
  } finally {
    await client.$disconnect()
  }
}

// Run on startup (non-blocking)
ensureSchemaAndSeed().catch(() => {})

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Extend globalThis type
declare global {
  var __TUNEPOA_NEEDS_SEED: boolean | undefined
}
