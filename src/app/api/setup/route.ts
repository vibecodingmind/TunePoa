import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
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
        console.log('📝 No data found after schema push, running seed...')
        // Call the seed endpoint internally
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.RAILWAY_STATIC_URL
            ? `https://${process.env.RAILWAY_STATIC_URL}`
            : 'http://localhost:3000'

        const seedRes = await fetch(`${baseUrl}/api/seed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        const seedData = await seedRes.json()
        console.log('Seed result:', seedData.success ? 'SUCCESS' : 'FAILED')

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
      message = 'STDOUT: ' + String((err as { stdout: unknown }).stdout) + '\nSTDERR: ' + String((err as { stderr: unknown }).stderr)
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
