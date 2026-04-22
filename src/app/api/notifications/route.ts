import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// GET /api/notifications — List notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = { userId: auth.user.id }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where }),
    ])

    return success({ notifications, total, limit, offset })
  } catch {
    return error('Internal server error', 500)
  }
}

// POST /api/notifications — Create a notification (admin only or system-generated)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    if (!isAdmin(auth.user.role)) {
      return error('Only admins can create notifications', 403)
    }

    const body = await request.json()
    const { userId, title, message, type, actionUrl } = body

    if (!userId || !title || !message) {
      return error('userId, title, and message are required')
    }

    const validTypes = ['INFO', 'SUCCESS', 'WARNING', 'ERROR']
    const notifType = validTypes.includes(type) ? type : 'INFO'

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: notifType,
        actionUrl: actionUrl || null,
      },
    })

    return success(notification, 201)
  } catch {
    return error('Internal server error', 500)
  }
}

// PATCH /api/notifications — Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()

    if (body.all) {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: auth.user.id, isRead: false },
        data: { isRead: true },
      })
      return success({ marked: 'all' })
    }

    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      const result = await db.notification.updateMany({
        where: {
          id: { in: body.ids },
          userId: auth.user.id,
        },
        data: { isRead: true },
      })
      return success({ marked: result.count })
    }

    return error('Provide { ids: string[] } or { all: true }')
  } catch {
    return error('Internal server error', 500)
  }
}
