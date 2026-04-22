import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
        subscriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, businessName: true } },
          },
        },
      },
    })

    if (!pkg) {
      return error('Package not found', 404)
    }

    return success({ package: pkg })
  } catch {
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

    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) {
      return error('Package not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'price', 'durationMonths', 'features', 'maxAdDuration', 'displayOrder', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Ensure features is stored as JSON.stringify(array)
        if (field === 'features' && typeof body[field] !== 'string') {
          updateData[field] = JSON.stringify(body[field])
        } else if (field === 'price' || field === 'durationMonths' || field === 'maxAdDuration' || field === 'displayOrder') {
          updateData[field] = Number(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const pkg = await db.package.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'PACKAGE',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData), name: existing.name }),
      },
    })

    return success({ package: pkg })
  } catch {
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

    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) {
      return error('Package not found', 404)
    }

    // Check for active subscriptions
    const activeSubs = await db.subscription.count({
      where: { packageId: id, status: 'ACTIVE' },
    })

    if (activeSubs > 0) {
      return error('Cannot deactivate package with active subscriptions')
    }

    // Soft delete - set isActive to false
    await db.package.update({
      where: { id },
      data: { isActive: false },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'PACKAGE',
        entityId: id,
        details: JSON.stringify({ action: 'deactivated', name: existing.name }),
      },
    })

    return success({ message: 'Package deactivated' })
  } catch {
    return error('Internal server error', 500)
  }
}
