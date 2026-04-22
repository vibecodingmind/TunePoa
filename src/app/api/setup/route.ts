import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { authenticate } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Auth check: if any users exist, require SUPER_ADMIN authentication.
    // Allows unauthenticated setup on a completely fresh database.
    const userCount = await db.user.count()
    if (userCount > 0) {
      const auth = await authenticate(request)
      if (!auth.authenticated || !auth.user || auth.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only Super Admin can run setup' },
          { status: 403 }
        )
      }
    }

    // Step 1: Run prisma db push to create/update tables
    const pushResult = execSync('npx prisma db push --skip-generate --accept-data-loss', {
      timeout: 60000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Step 2: Auto-seed if no data exists
    const { PrismaClient } = await import('@prisma/client')
    const client = new PrismaClient({ log: ['error'] })

    try {
      const tierCount = await client.pricingTier.count()
      if (tierCount === 0) {
        // Call the seed endpoint internally
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.RAILWAY_STATIC_URL
            ? `https://${process.env.RAILWAY_STATIC_URL}`
            : 'http://localhost:3000'

        const headers: Record<string, string> = { 'Content-Type': 'application/json' }

        const seedRes = await fetch(`${baseUrl}/api/seed`, {
          method: 'POST',
          headers,
        })
        const seedData = await seedRes.json()

        return NextResponse.json({
          success: true,
          message: 'Schema pushed and data seeded',
          pushOutput: pushResult,
          seedResult: seedData,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Schema pushed successfully (data already exists)',
        pushOutput: pushResult,
      })
    } finally {
      await client.$disconnect()
    }
  } catch (err: unknown) {
    let message = ''
    if (err && typeof err === 'object' && 'stdout' in err) {
      const errObj = err as Record<string, unknown>
      message = 'STDOUT: ' + String(errObj['stdout'] ?? '') + '\nSTDERR: ' + String(errObj['stderr'] ?? '')
    } else {
      message = err instanceof Error ? err.message : String(err)
    }
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const client = new PrismaClient({ log: ['error'] })

    try {
      const tierCount = await client.pricingTier.count()
      const userCount = await client.user.count()
      const subCount = await client.subscription.count()

      return NextResponse.json({
        success: true,
        database: 'connected',
        data: {
          pricingTiers: tierCount,
          users: userCount,
          subscriptions: subCount,
          needsSeed: tierCount === 0,
        },
      })
    } finally {
      await client.$disconnect()
    }
  } catch (err) {
    return NextResponse.json({
      success: false,
      database: 'error',
      error: err instanceof Error ? err.message : String(err),
      needsSetup: true,
    })
  }
}
