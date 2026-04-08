import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const provider = await db.mnoProvider.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
        subscriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, businessName: true } },
            package: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!provider) {
      return error('MNO provider not found', 404)
    }

    return success({ provider })
  } catch (err) {
    console.error('Get MNO provider error:', err)
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

    const existing = await db.mnoProvider.findUnique({ where: { id } })
    if (!existing) {
      return error('MNO provider not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'country', 'code', 'apiEndpoint', 'apiKey', 'isActive', 'notes']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'code') {
          updateData[field] = (body[field] as string).toUpperCase()
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Check for code uniqueness if changing code
    if (updateData.code && updateData.code !== existing.code) {
      const codeExists = await db.mnoProvider.findUnique({ where: { code: updateData.code as string } })
      if (codeExists) {
        return error('MNO provider with this code already exists', 409)
      }
    }

    // Check for name uniqueness if changing name
    if (updateData.name && updateData.name !== existing.name) {
      const nameExists = await db.mnoProvider.findUnique({ where: { name: updateData.name as string } })
      if (nameExists) {
        return error('MNO provider with this name already exists', 409)
      }
    }

    const provider = await db.mnoProvider.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'MNO_PROVIDER',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData), name: existing.name }),
      },
    })

    return success({ provider })
  } catch (err) {
    console.error('Update MNO provider error:', err)
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

    const existing = await db.mnoProvider.findUnique({ where: { id } })
    if (!existing) {
      return error('MNO provider not found', 404)
    }

    // Soft delete - set isActive to false
    await db.mnoProvider.update({
      where: { id },
      data: { isActive: false },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'MNO_PROVIDER',
        entityId: id,
        details: JSON.stringify({ action: 'deactivated', name: existing.name }),
      },
    })

    return success({ message: 'MNO provider deactivated' })
  } catch (err) {
    console.error('Delete MNO provider error:', err)
    return error('Internal server error', 500)
  }
}
