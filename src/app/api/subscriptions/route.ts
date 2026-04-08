import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (userId) where.userId = userId

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

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, packageId, requestId, phoneNumber, autoRenew } = body

    if (!userId || !packageId || !requestId) {
      return NextResponse.json({ error: 'userId, packageId, and requestId are required' }, { status: 400 })
    }

    const pkg = await db.package.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const serviceRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + pkg.durationMonths)

    const subscription = await db.subscription.create({
      data: {
        userId,
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

    await db.activityLog.create({
      data: {
        userId,
        action: 'CREATED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        details: JSON.stringify({ packageId, amount: pkg.price }),
      },
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
