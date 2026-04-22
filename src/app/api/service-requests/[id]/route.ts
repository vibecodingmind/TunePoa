import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { SR_TRANSITIONS, VALID_STATUSES } from '@/lib/constants'

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

    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true },
        },
        subscriptions: {
          include: {
            package: true,
            payments: true,
          },
        },
      },
    })

    if (!serviceRequest) {
      return error('Service request not found', 404)
    }

    // Non-admin users can only view their own requests
    if (!isAdmin(auth.user.role) && serviceRequest.userId !== auth.user.id) {
      return forbidden()
    }

    return success({ request: serviceRequest })
  } catch (err) {
    console.error('Get service request error:', err)
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

    // Auth required - admins only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.serviceRequest.findUnique({
      where: { id },
      include: { subscriptions: true },
    })
    if (!existing) {
      return error('Service request not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'rejectionReason', 'adScript', 'targetAudience', 'specialInstructions', 'preferredLanguage', 'businessName', 'businessCategory', 'adType']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Validate status transitions
    if (body.status && body.status !== existing.status) {
      const validTransitions = SR_TRANSITIONS[existing.status]
      if (!validTransitions || !validTransitions.includes(body.status)) {
        return error(
          `Invalid status transition from ${existing.status} to ${body.status}. Allowed: ${validTransitions?.join(', ') || 'none'}`,
          400
        )
      }

      // Validate status is a valid value
      if (!(VALID_STATUSES.SERVICE_REQUEST as readonly string[]).includes(body.status)) {
        return error(`Invalid status: ${body.status}`, 400)
      }

      // If rejecting, require a reason
      if (body.status === 'REJECTED' && !body.rejectionReason && !existing.rejectionReason) {
        return error('Rejection reason is required when rejecting a request')
      }
    }

    const serviceRequest = await db.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    // ── AUTO-SUBSCRIBE ON APPROVAL ──
    // When admin approves a request, automatically create a subscription
    if (body.status === 'APPROVED' && existing.status !== 'APPROVED') {
      // Check if a subscription already exists for this request
      const existingSub = existing.subscriptions && existing.subscriptions.length > 0
      if (!existingSub) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1) // default 1-month subscription

        const subscription = await db.subscription.create({
          data: {
            userId: existing.userId,
            requestId: existing.id,
            startDate,
            endDate,
            status: 'ACTIVE',
            amount: 0,
            unitPrice: 0,
            userCount: 1,
            durationMonths: 1,
            currency: 'TZS',
            paymentStatus: 'UNPAID',
            vodacomStatus: 'NOT_SUBMITTED',
            autoRenew: false,
          },
          include: {
            user: { select: { id: true, name: true, businessName: true } },
          },
        })

        // Log auto-subscription
        await db.activityLog.create({
          data: {
            userId: auth.user.id,
            action: 'CREATED',
            entityType: 'SUBSCRIPTION',
            entityId: subscription.id,
            details: JSON.stringify({
              autoCreated: true,
              reason: 'Auto-created on service request approval',
              requestId: existing.id,
            }),
          },
        })
      }
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: body.status && body.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATED',
        entityType: 'SERVICE_REQUEST',
        entityId: id,
        details: JSON.stringify({
          updatedFields: Object.keys(updateData),
          ...(body.status && body.status !== existing.status ? { from: existing.status, to: body.status } : {}),
          updatedBy: auth.user.name,
        }),
      },
    })

    return success({ request: serviceRequest })
  } catch (err) {
    console.error('Update service request error:', err)
    return error('Internal server error', 500)
  }
}

export async function DELETE(
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

    const existing = await db.serviceRequest.findUnique({ where: { id } })
    if (!existing) {
      return error('Service request not found', 404)
    }

    // Only own requests (BUSINESS_OWNER) or any (ADMIN) can delete
    if (auth.user.role === 'BUSINESS_OWNER' && existing.userId !== auth.user.id) {
      return forbidden()
    }

    // Only allow deletion of PENDING or REJECTED requests
    if (!['PENDING', 'REJECTED'].includes(existing.status)) {
      return error('Can only delete PENDING or REJECTED requests')
    }

    await db.serviceRequest.delete({ where: { id } })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'DELETED',
        entityType: 'SERVICE_REQUEST',
        entityId: id,
        details: JSON.stringify({ businessName: existing.businessName, deletedBy: auth.user.name }),
      },
    })

    return success({ message: 'Service request deleted' })
  } catch (err) {
    console.error('Delete service request error:', err)
    return error('Internal server error', 500)
  }
}
