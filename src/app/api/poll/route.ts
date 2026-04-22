import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// ---------------------------------------------------------------------------
// GET  –  return a summary of changes since a given timestamp
// Used by the client to poll every ~30s and update UI indicators.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const since = parseInt(searchParams.get('since') || '0', 10)
    const sinceDate = new Date(since || Date.now() - 60_000)

    const whereDate = { createdAt: { gte: sinceDate } }

    const [newNotifications, updatedRequests, subscriptionChanges] = await Promise.all([
      // Unread notifications for the current user
      db.notification.count({
        where: {
          userId: auth.user.id,
          isRead: false,
          ...whereDate,
        },
      }),
      // Requests that changed status
      db.serviceRequest.count({
        where: {
          ...(isAdmin(auth.user.role) ? {} : { userId: auth.user.id }),
          updatedAt: { gte: sinceDate },
        },
      }),
      // Subscriptions that changed
      db.subscription.count({
        where: {
          ...(isAdmin(auth.user.role) ? {} : { userId: auth.user.id }),
          updatedAt: { gte: sinceDate },
        },
      }),
    ])

    return success({
      newNotifications,
      updatedRequests,
      subscriptionChanges,
      serverTime: Date.now(),
    })
  } catch {
    return error('Internal server error', 500)
  }
}
