import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate, verifyPassword, hashPassword } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return error('Current password and new password are required')
    }

    if (newPassword.length < 6) {
      return error('New password must be at least 6 characters')
    }

    // Fetch user with password
    const user = await db.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, password: true, twoFactorEnabled: true },
    })

    if (!user) return error('User not found', 404)

    // If user has 2FA enabled, skip password check
    if (user.twoFactorEnabled) {
      // Just set new password without verifying current
      await db.user.update({
        where: { id: auth.user.id },
        data: { password: hashPassword(newPassword) },
      })
      return success({ message: 'Password updated successfully' })
    }

    // Verify current password
    if (!user.password) {
      return error('No password set for this account. Contact support.')
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return error('Current password is incorrect', 401)
    }

    // Update password
    await db.user.update({
      where: { id: auth.user.id },
      data: { password: hashPassword(newPassword) },
    })

    return success({ message: 'Password updated successfully' })
  } catch {
    return error('Internal server error', 500)
  }
}
