import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { verifyPassword, createToken, excludePassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return error('Email and password are required')
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return error('Invalid credentials', 401)
    }

    // Compare password using the same hash method
    if (!verifyPassword(password, user.password || '')) {
      return error('Invalid credentials', 401)
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return forbidden()
    }
    if (user.status === 'INACTIVE') {
      return error('Account is inactive. Contact support.', 403)
    }

    // Create token with 24h expiry
    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    // Log login activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email }),
      },
    })

    // Return user WITHOUT password
    const safeUser = excludePassword(user)

    return success({ token, user: safeUser })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Login error:', err)
    return error(`Internal server error: ${message}`, 500)
  }
}
