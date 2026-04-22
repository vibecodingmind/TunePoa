import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'

/**
 * GET /api/mno-providers — Read-only (public)
 * Returns the list of MNO providers. Kept for subscription management
 * where admin needs to look up Vodacom provider ID.
 * Note: MNO management has been removed - Vodacom is the only provider.
 */
export async function GET() {
  try {
    const providers = await db.mnoProvider.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return success({ providers })
  } catch (err) {
    console.error('Get MNO providers error:', err)
    return error('Internal server error', 500)
  }
}
