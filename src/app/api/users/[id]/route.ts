import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin, excludePassword, verifyPassword, hashPassword } from '@/lib/auth'

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

    // Users can view their own profile, admins can view anyone
    if (auth.user.id !== id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessName: true,
        businessCategory: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            serviceRequests: true,
            subscriptions: true,
          },
        },
      },
    })

    if (!user) {
      return error('User not found', 404)
    }

    return success({ user })
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

    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const existing = await db.user.findUnique({ where: { id }, select: { id: true, password: true, email: true, phone: true } })
    if (!existing) {
      return error('User not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'email', 'phone', 'businessName', 'businessCategory', 'status', 'role', 'avatar']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Role and status changes require admin
        if ((field === 'role' || field === 'status') && !isAdmin(auth.user.role)) {
          return forbidden()
        }

        // Users can only update their own profile (unless admin)
        if (auth.user.id !== id && !isAdmin(auth.user.role)) {
          return forbidden()
        }

        updateData[field] = body[field]
      }
    }

    // If changing email, check uniqueness
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await db.user.findUnique({ where: { email: updateData.email as string } })
      if (emailExists) {
        return error('Email already in use', 409)
      }
    }

    // If changing phone, check uniqueness
    if (updateData.phone && updateData.phone !== existing.phone) {
      const phoneExists = await db.user.findUnique({ where: { phone: updateData.phone as string } })
      if (phoneExists) {
        return error('Phone number already in use', 409)
      }
    }

    // Handle password change
    if (body.currentPassword && body.newPassword) {
      if (auth.user.id !== id) {
        return forbidden('You can only change your own password')
      }
      if (!existing.password) {
        return error('No password set for this account. Contact support.', 400)
      }
      if (body.newPassword.length < 6) {
        return error('New password must be at least 6 characters')
      }
      if (!verifyPassword(body.currentPassword, existing.password)) {
        return error('Current password is incorrect', 401)
      }
      updateData['password'] = hashPassword(body.newPassword)
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData), updatedBy: auth.user.name }),
      },
    })

    const safeUser = excludePassword(user)

    return success({ user: safeUser })
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

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return error('User not found', 404)
    }

    // Prevent admin from deactivating themselves
    if (auth.user.id === id) {
      return error('Cannot deactivate your own account')
    }

    // Soft delete - set status to INACTIVE
    await db.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'STATUS_CHANGE',
        entityType: 'USER',
        entityId: id,
        details: JSON.stringify({ from: existing.status, to: 'INACTIVE', deactivatedBy: auth.user.name }),
      },
    })

    return success({ message: 'User deactivated successfully' })
  } catch {
    return error('Internal server error', 500)
  }
}
