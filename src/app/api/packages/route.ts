import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    // No auth required for viewing active packages
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return success({ packages })
  } catch (err) {
    console.error('Get packages error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    // If table doesn't exist, return empty list gracefully
    if (msg.includes('_prisma') || msg.includes('relation') || msg.includes('table') || msg.includes('does not exist')) {
      return success({ packages: [], needsSetup: true })
    }
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { name, description, price, durationMonths, features, maxAdDuration, displayOrder, isActive } = body

    if (!name || !description || price === undefined || !durationMonths || !features) {
      return error('name, description, price, durationMonths, and features are required')
    }

    const pkg = await db.package.create({
      data: {
        name,
        description,
        price: Number(price),
        durationMonths: Number(durationMonths),
        features: typeof features === 'string' ? features : JSON.stringify(features),
        maxAdDuration: maxAdDuration ? Number(maxAdDuration) : 30,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'PACKAGE',
        entityId: pkg.id,
        details: JSON.stringify({ name, price, durationMonths }),
      },
    })

    return success({ package: pkg }, 201)
  } catch (err) {
    console.error('Create package error:', err)
    return error('Internal server error', 500)
  }
}
