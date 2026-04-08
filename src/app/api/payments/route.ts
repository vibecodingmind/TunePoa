import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (subscriptionId) where.subscriptionId = subscriptionId
    if (status) where.status = status

    const payments = await db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            user: { select: { id: true, name: true, businessName: true } },
            package: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId, amount, method, reference, verifiedBy, notes } = body

    if (!subscriptionId || amount === undefined) {
      return NextResponse.json({ error: 'subscriptionId and amount are required' }, { status: 400 })
    }

    const subscription = await db.subscription.findUnique({ where: { id: subscriptionId } })
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const payment = await db.payment.create({
      data: {
        subscriptionId,
        amount,
        method: method || 'M_PESA',
        status: 'COMPLETED',
        reference,
        paidAt: new Date(),
        verifiedBy,
        notes,
      },
      include: {
        subscription: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    // Update subscription payment status
    await db.subscription.update({
      where: { id: subscriptionId },
      data: { paymentStatus: 'PAID' },
    })

    await db.activityLog.create({
      data: {
        userId: subscription.userId,
        action: 'CREATED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        details: JSON.stringify({ amount, method, subscriptionId }),
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
