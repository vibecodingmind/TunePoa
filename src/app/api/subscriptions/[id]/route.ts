import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { SUB_TRANSITIONS, VALID_STATUSES } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true },
        },
        package: true,
        request: true,
        mnoProvider: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!subscription) {
      return error('Subscription not found', 404)
    }

    // Non-admin: only view own subscriptions
    if (!isAdmin(auth.user.role) && subscription.userId !== auth.user.id) {
      return forbidden()
    }

    return success({ subscription })
  } catch (err) {
    console.error('Get subscription error:', err)
    return error('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    // Only admins can update subscriptions
    if (!isAdmin(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.subscription.findUnique({ where: { id } })
    if (!existing) {
      return error('Subscription not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'paymentStatus', 'mnoProviderId', 'mnoReference', 'mnoStatus', 'mnoSubmittedAt', 'mnoActivatedAt', 'phoneNumber', 'autoRenew', 'notes', 'startDate', 'endDate']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate' || field === 'mnoSubmittedAt' || field === 'mnoActivatedAt') {
          updateData[field] = typeof body[field] === 'string' ? new Date(body[field]) : body[field]
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Validate subscription status transitions
    if (body.status && body.status !== existing.status) {
      const validTransitions = SUB_TRANSITIONS[existing.status]
      if (!validTransitions || !validTransitions.includes(body.status)) {
        return error(
          `Invalid subscription status transition from ${existing.status} to ${body.status}. Allowed: ${validTransitions?.join(', ') || 'none'}`,
          400
        )
      }
      if (!(VALID_STATUSES.SUBSCRIPTION as readonly string[]).includes(body.status)) {
        return error(`Invalid subscription status: ${body.status}`, 400)
      }

      // PENDING can go to ACTIVE only if payment status is PAID
      if (body.status === 'ACTIVE' && existing.paymentStatus !== 'PAID') {
        return error('Subscription can only be activated when payment status is PAID')
      }
    }

    // Validate payment status independently
    if (body.paymentStatus && !(VALID_STATUSES.PAYMENT_STATUS as readonly string[]).includes(body.paymentStatus)) {
      return error(`Invalid payment status: ${body.paymentStatus}`, 400)
    }

    // Validate MNO status independently
    const VALID_MNO_STATUSES = ['NOT_SUBMITTED', 'PENDING_MNO', 'ACTIVE_MNO', 'FAILED_MNO', 'REMOVED_MNO']
    if (body.mnoStatus && !VALID_MNO_STATUSES.includes(body.mnoStatus)) {
      return error(`Invalid MNO status: ${body.mnoStatus}`, 400)
    }

    // Handle MNO activation auto-effects
    if (body.mnoStatus === 'ACTIVE_MNO') {
      if (!updateData.mnoActivatedAt) {
        updateData.mnoActivatedAt = new Date()
      }
      if (existing.status === 'PENDING') {
        updateData.status = 'ACTIVE'
      }
    }

    // Handle MNO submission auto-effects
    if (body.mnoStatus === 'PENDING_MNO' && !updateData.mnoSubmittedAt) {
      updateData.mnoSubmittedAt = new Date()
    }

    // Handle cancellation auto-effects
    if (body.status === 'CANCELLED' && existing.mnoStatus !== 'REMOVED_MNO') {
      updateData.mnoStatus = 'REMOVED_MNO'
    }

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, businessName: true } },
        package: true,
        mnoProvider: true,
        payments: true,
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: body.status && body.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATED',
        entityType: 'SUBSCRIPTION',
        entityId: id,
        details: JSON.stringify({
          updatedFields: Object.keys(updateData),
          ...(body.status && body.status !== existing.status ? { statusFrom: existing.status, statusTo: body.status } : {}),
          ...(body.paymentStatus && body.paymentStatus !== existing.paymentStatus ? { paymentFrom: existing.paymentStatus, paymentTo: body.paymentStatus } : {}),
          ...(body.mnoStatus && body.mnoStatus !== existing.mnoStatus ? { mnoFrom: existing.mnoStatus, mnoTo: body.mnoStatus } : {}),
        }),
      },
    })

    return success({ subscription })
  } catch (err) {
    console.error('Update subscription error:', err)
    return error('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.subscription.findUnique({ where: { id } })
    if (!existing) {
      return error('Subscription not found', 404)
    }

    // Soft cancel - set status to CANCELLED
    await db.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'STATUS_CHANGE',
        entityType: 'SUBSCRIPTION',
        entityId: id,
        details: JSON.stringify({ from: existing.status, to: 'CANCELLED' }),
      },
    })

    return success({ message: 'Subscription cancelled' })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return error('Internal server error', 500)
  }
}
