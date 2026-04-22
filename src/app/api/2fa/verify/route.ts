import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { timingSafeEqual } from 'node:crypto'

// ---------------------------------------------------------------------------
// POST  –  verify a 2FA code during login
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code } = body as { userId: string; code: string }

    if (!userId || !code) {
      return error('userId and code are required')
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, twoFactorEnabled: true, twoFactorSecret: true, name: true, email: true, role: true },
    })

    if (!user) {
      return error('User not found', 404)
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return error('Two-factor authentication is not enabled for this account')
    }

    // Timing-safe comparison
    const provided = Buffer.from(code, 'utf-8')
    const expected = Buffer.from(user.twoFactorSecret, 'utf-8')

    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return error('Invalid verification code', 401)
    }

    // Clear the 2FA secret (one-time use in this simplified version)
    await db.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null },
    })

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ action: '2FA_VERIFIED' }),
      },
    })

    return success({
      verified: true,
      message: 'Two-factor authentication verified successfully',
    })
  } catch {
    return error('Internal server error', 500)
  }
}
