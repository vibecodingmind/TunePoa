import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}

    // Non-admin users can only see their own subscriptions
    if (!isAdmin(auth.user.role)) {
      where.userId = auth.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) where.status = status

    const subscriptions = await db.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
        package: true,
        request: {
          select: { id: true, businessName: true, adType: true },
        },
        mnoProvider: {
          select: { id: true, name: true, code: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return success({ subscriptions })
  } catch (err) {
    console.error('Get subscriptions error:', err)
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()
    const { packageId, requestId, phoneNumber, autoRenew } = body

    if (!packageId || !requestId) {
      return error('packageId and requestId are required')
    }

    // Validate package exists
    const pkg = await db.package.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return error('Package not found', 404)
    }
    if (!pkg.isActive) {
      return error('Package is not available')
    }

    // Validate service request exists
    const serviceRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!serviceRequest) {
      return error('Service request not found', 404)
    }

    // Non-admin: validate requestId belongs to user
    if (!isAdmin(auth.user.role) && serviceRequest.userId !== auth.user.id) {
      return forbidden()
    }

    // Check for duplicate subscription on same request
    const existingSub = await db.subscription.findUnique({ where: { requestId } })
    if (existingSub) {
      return error('A subscription already exists for this service request', 409)
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + pkg.durationMonths)

    const subscription = await db.subscription.create({
      data: {
        userId: auth.user.id,
        packageId,
        requestId,
        startDate,
        endDate,
        status: 'PENDING',
        amount: pkg.price,
        currency: pkg.currency,
        paymentStatus: 'UNPAID',
        mnoStatus: 'NOT_SUBMITTED',
        phoneNumber: phoneNumber || null,
        autoRenew: autoRenew || false,
      },
      include: {
        user: { select: { id: true, name: true, businessName: true } },
        package: true,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        details: JSON.stringify({ packageId, amount: pkg.price }),
      },
    })

    return success({ subscription }, 201)
  } catch (err) {
    console.error('Create subscription error:', err)
    return error('Internal server error', 500)
  }
}
