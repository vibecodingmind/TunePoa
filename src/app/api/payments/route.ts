import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { VALID_STATUSES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (subscriptionId) {
      where.subscriptionId = subscriptionId

      // Non-admin: verify the subscription belongs to them
      if (!isAdmin(auth.user.role)) {
        const sub = await db.subscription.findUnique({
          where: { id: subscriptionId },
          select: { userId: true },
        })
        if (!sub || sub.userId !== auth.user.id) {
          return error('Payment not found', 404)
        }
      }
    } else if (!isAdmin(auth.user.role)) {
      // Non-admin: only show payments for their own subscriptions
      const userSubs = await db.subscription.findMany({
        where: { userId: auth.user.id },
        select: { id: true },
      })
      where.subscriptionId = { in: userSubs.map(s => s.id) }
    }

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

    return success({ payments })
  } catch (err) {
    console.error('Get payments error:', err)
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
    const { subscriptionId, amount, method, status, reference, gateway, gatewayReference, gatewayStatus, notes } = body

    if (!subscriptionId || amount === undefined) {
      return error('subscriptionId and amount are required')
    }

    // Validate payment status
    const paymentStatus = status || 'PENDING'
    if (!(VALID_STATUSES.PAYMENT as readonly string[]).includes(paymentStatus)) {
      return error(`Invalid payment status: ${paymentStatus}`, 400)
    }

    // Validate subscription exists
    const subscription = await db.subscription.findUnique({ where: { id: subscriptionId } })
    if (!subscription) {
      return error('Subscription not found', 404)
    }

    // Non-admin: verify the subscription belongs to them
    if (!isAdmin(auth.user.role) && subscription.userId !== auth.user.id) {
      return error('Subscription not found', 404)
    }

    const payment = await db.payment.create({
      data: {
        subscriptionId,
        amount: Number(amount),
        method: method || 'PESAPAL',
        status: paymentStatus,
        reference,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
        verifiedBy: paymentStatus === 'COMPLETED' ? auth.user.id : null,
        notes,
        ...(gateway ? { gateway } : {}),
        ...(gatewayReference ? { gatewayReference } : {}),
        ...(gatewayStatus ? { gatewayStatus } : {}),
      },
      include: {
        subscription: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    // If payment is completed, update subscription payment status
    if (paymentStatus === 'COMPLETED') {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { paymentStatus: 'PAID' },
      })
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        details: JSON.stringify({ amount, method: method || 'PESAPAL', status: paymentStatus, subscriptionId }),
      },
    })

    return success({ payment }, 201)
  } catch (err) {
    console.error('Create payment error:', err)
    return error('Internal server error', 500)
  }
}
