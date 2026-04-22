import { NextRequest } from 'next/server'
import { randomInt } from 'node:crypto'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate } from '@/lib/auth'

// ---------------------------------------------------------------------------
// GET  –  return 2FA status for current user
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const user = await db.user.findUnique({
      where: { id: auth.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    })

    if (!user) {
      return unauthorized()
    }

    return success({
      enabled: user.twoFactorEnabled,
      // never expose the secret code in the status response
    })
  } catch {
    return error('Internal server error', 500)
  }
}

// ---------------------------------------------------------------------------
// POST  –  enable 2FA (generate 6-digit code, return backup code once)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()
    const action = body.action as string | undefined

    // ── Disable 2FA ──
    if (action === 'disable') {
      await db.user.update({
        where: { id: auth.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      })

      await db.activityLog.create({
        data: {
          userId: auth.user.id,
          action: 'UPDATED',
          entityType: 'USER',
          entityId: auth.user.id,
          details: JSON.stringify({ action: '2FA_DISABLED' }),
        },
      })

      return success({ enabled: false, message: 'Two-factor authentication disabled' })
    }

    // ── Enable 2FA ──
    const code = String(randomInt(100000, 1000000))
    const backupCode = String(randomInt(100000, 1000000))

    await db.user.update({
      where: { id: auth.user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: code,
      },
    })

    await db.notification.create({
      data: {
        userId: auth.user.id,
        title: 'Two-Factor Authentication Enabled',
        message: '2FA has been enabled on your account. Save your backup code: ' + backupCode,
        type: 'INFO',
      },
    })

    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'USER',
        entityId: auth.user.id,
        details: JSON.stringify({ action: '2FA_ENABLED' }),
      },
    })

    return success({
      enabled: true,
      backupCode,
      message: 'Two-factor authentication enabled. Save your backup code — it will not be shown again.',
    })
  } catch {
    return error('Internal server error', 500)
  }
}

// ---------------------------------------------------------------------------
// DELETE  –  disable 2FA (alias for POST action=disable)
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    await db.user.update({
      where: { id: auth.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'USER',
        entityId: auth.user.id,
        details: JSON.stringify({ action: '2FA_DISABLED' }),
      },
    })

    return success({ enabled: false, message: 'Two-factor authentication disabled' })
  } catch {
    return error('Internal server error', 500)
  }
}
