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
    console.log('✅ Database tables exist, schema check passed')

    // Check if data exists — if not, seed
    const tierCount = await client.pricingTier.count()
    if (tierCount === 0 && !seedAttempted) {
      seedAttempted = true
      console.log('📝 No data found, triggering auto-seed...')
      // The seed will be triggered via the /api/seed endpoint on first request
      // We set a flag so the landing page knows to call it
      globalThis.__TUNEPOA_NEEDS_SEED = true
    }

    schemaEnsured = true
  } catch (err) {
    console.log('⚠️ Database tables missing, running prisma db push...')
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        timeout: 60000,
      })
      console.log('✅ Schema push completed')

      // After schema push, seed data is needed
      globalThis.__TUNEPOA_NEEDS_SEED = true
      schemaEnsured = true
    } catch (pushErr) {
      console.error('❌ Failed to push schema:', pushErr)
      // Don't crash — let individual API routes handle DB errors gracefully
      schemaEnsured = true // Don't retry on every request
    }
  } finally {
    await client.$disconnect()
  }
}

// Run on startup (non-blocking)
ensureSchemaAndSeed().catch(console.error)

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
