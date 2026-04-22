import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin, hashPassword, excludePassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (role) where.role = role
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return success({ users })
  } catch (err) {
    console.error('Get users error:', err)
    return error('Internal server error', 500)
  }
}

/**
 * POST /api/users - Create a new user
 * - SUPER_ADMIN can create SUPER_ADMIN, ADMIN, or BUSINESS_OWNER users
 * - ADMIN can create ADMIN or BUSINESS_OWNER users (but NOT SUPER_ADMIN)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth required - admin only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { name, email, phone, businessName, businessCategory, password, role } = body

    // Validate required fields
    if (!name || !email || !phone || !businessName || !password) {
      return error('name, email, phone, businessName, and password are required')
    }

    if (password.length < 6) {
      return error('Password must be at least 6 characters')
    }

    // Determine allowed role
    let assignedRole = 'BUSINESS_OWNER'
    if (role) {
      if (role === 'SUPER_ADMIN') {
        // Only SUPER_ADMIN can create SUPER_ADMIN
        if (auth.user.role !== 'SUPER_ADMIN') {
          return forbidden('Only Super Admin can create Super Admin users')
        }
        assignedRole = 'SUPER_ADMIN'
      } else if (role === 'ADMIN') {
        // Both SUPER_ADMIN and ADMIN can create ADMIN
        if (!['SUPER_ADMIN', 'ADMIN'].includes(auth.user.role)) {
          return forbidden('Only Admin or Super Admin can create Admin users')
        }
        assignedRole = 'ADMIN'
      } else if (role === 'BUSINESS_OWNER') {
        assignedRole = 'BUSINESS_OWNER'
      } else {
        return error(`Invalid role: ${role}. Must be SUPER_ADMIN, ADMIN, or BUSINESS_OWNER`)
      }
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

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        businessName,
        businessCategory: businessCategory || 'general',
        password: hashedPassword,
        role: assignedRole,
        status: 'ACTIVE',
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({
          name,
          email,
          role: assignedRole,
          action: 'admin_created_user',
          createdBy: auth.user.name,
        }),
      },
    })

    const safeUser = excludePassword(user)

    return success({ user: safeUser }, 201)
  } catch (err) {
    console.error('Create user error:', err)
    return error('Internal server error', 500)
  }
}
