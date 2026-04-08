import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

async function ensureSchema() {
  // Only run in production on Railway
  if (process.env.NODE_ENV === 'production') {
    try {
      // Try a simple query to check if tables exist
      await new PrismaClient().$queryRaw`SELECT 1`
    } catch {
      console.log('Database tables not found, running prisma db push...')
      try {
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'inherit',
          timeout: 60000,
        })
        console.log('Schema push completed successfully')
      } catch (err) {
        console.error('Failed to push schema:', err)
      }
    }
  }
}

// Run schema check on startup
ensureSchema().catch(console.error)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
