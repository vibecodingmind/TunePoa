import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// DELETE /api/notifications/:id — Delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { id } = await params

    // Find notification
    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return error('Notification not found', 404)
    }

    // Only the owner or admin can delete
    if (notification.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    await db.notification.delete({
      where: { id },
    })

    return success({ deleted: true })
  } catch {
    return error('Internal server error', 500)
  }
}

// PATCH /api/notifications/:id — Mark single notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { id } = await params

    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return error('Notification not found', 404)
    }

    if (notification.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return success(updated)
  } catch {
    return error('Internal server error', 500)
  }
}
