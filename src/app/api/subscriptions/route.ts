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
        pricingTier: true,
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
    const {
      packageId,
      requestId,
      phoneNumber,
      autoRenew,
      // New pricing fields
      pricingTierId,
      userCount,
      durationMonths,
      unitPrice,
      totalAmount,
      includesAudio,
    } = body

    if (!requestId) {
      return error('requestId is required')
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

    // Determine pricing data
    let finalPackageId = packageId || null
    let finalAmount = 0
    let finalUnitPrice = 0
    let finalUserCount = 1
    let finalDurationMonths = 1
    let finalIncludesAudio = false
    let finalPricingTierId = pricingTierId || null

    if (pricingTierId && userCount && durationMonths && unitPrice) {
      // New pricing model: use pricing tier
      finalPricingTierId = pricingTierId
      finalUserCount = userCount
      finalDurationMonths = durationMonths
      finalUnitPrice = unitPrice
      finalAmount = totalAmount || (unitPrice * userCount * durationMonths)
      finalIncludesAudio = includesAudio || false
    } else if (packageId) {
      // Legacy pricing model: use package
      const pkg = await db.package.findUnique({ where: { id: packageId } })
      if (!pkg) return error('Package not found', 404)
      if (!pkg.isActive) return error('Package is not available')
      finalPackageId = packageId
      finalAmount = pkg.price
      finalDurationMonths = pkg.durationMonths
    } else {
      return error('Either packageId or (pricingTierId + userCount + durationMonths + unitPrice) is required')
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + finalDurationMonths)

    const subscription = await db.subscription.create({
      data: {
        userId: auth.user.id,
        packageId: finalPackageId,
        pricingTierId: finalPricingTierId,
        requestId,
        startDate,
        endDate,
        status: 'PENDING',
        amount: finalAmount,
        unitPrice: finalUnitPrice,
        userCount: finalUserCount,
        durationMonths: finalDurationMonths,
        includesAudio: finalIncludesAudio,
        currency: 'TZS',
        paymentStatus: 'UNPAID',
        mnoStatus: 'NOT_SUBMITTED',
        phoneNumber: phoneNumber || null,
        autoRenew: autoRenew || false,
      },
      include: {
        user: { select: { id: true, name: true, businessName: true } },
        package: true,
        pricingTier: true,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        details: JSON.stringify({
          amount: finalAmount,
          userCount: finalUserCount,
          durationMonths: finalDurationMonths,
          includesAudio: finalIncludesAudio,
        }),
      },
    })

    return success({ subscription }, 201)
  } catch (err) {
    console.error('Create subscription error:', err)
    return error('Internal server error', 500)
  }
}
