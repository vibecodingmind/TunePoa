import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { hashPassword, createToken, excludePassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per minute per IP
  const rateLimit = checkRateLimit(request, { maxRequests: 5, windowMs: 60_000 })
  if (rateLimit.limited) return rateLimit.response!

  try {
    const body = await request.json()
    const { name, email, phone, businessName, password } = body

    // Validate required fields
    if (!name || !email || !phone || !businessName || !password) {
      return error('All fields are required: name, email, phone, businessName, password')
    }

    if (password.length < 6) {
      return error('Password must be at least 6 characters')
    }

    // Check email uniqueness
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return error('Email already registered', 409)
    }

    // Check phone uniqueness
    const existingPhone = await db.user.findUnique({ where: { phone } })
    if (existingPhone) {
      return error('Phone number already registered', 409)
    }

    // Hash password using scrypt
    const hashedPassword = hashPassword(password)

    // Create user with BUSINESS_OWNER role and ACTIVE status
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        businessName,
        password: hashedPassword,
        role: 'BUSINESS_OWNER',
        status: 'ACTIVE',
      },
    })

    // Create auth token
    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    // Log registration activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ name, email, action: 'registration' }),
      },
    })

    // Return user WITHOUT password
    const safeUser = excludePassword(user)

    return success({ user: safeUser, token }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
