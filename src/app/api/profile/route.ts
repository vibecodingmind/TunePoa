import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate, excludePassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const user = await db.user.findUnique({
      where: { id: auth.user.id },
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
        preferredLanguage: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            serviceRequests: true,
            subscriptions: true,
            audioTracks: true,
            invoices: true,
          },
        },
      },
    })

    if (!user) return error('User not found', 404)

    return success({ user })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const body = await request.json()
    const { name, email, phone, businessName, businessCategory, preferredLanguage } = body

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (!name.trim()) return error('Name is required')
      updateData.name = name.trim()
    }

    if (email !== undefined) {
      if (!email.trim()) return error('Email is required')
      // Check uniqueness (exclude current user)
      const existingEmail = await db.user.findFirst({
        where: { email: email.trim(), NOT: { id: auth.user.id } },
      })
      if (existingEmail) return error('Email already in use', 409)
      updateData.email = email.trim()
    }

    if (phone !== undefined) {
      if (!phone.trim()) return error('Phone is required')
      // Check uniqueness (exclude current user)
      const existingPhone = await db.user.findFirst({
        where: { phone: phone.trim(), NOT: { id: auth.user.id } },
      })
      if (existingPhone) return error('Phone number already in use', 409)
      updateData.phone = phone.trim()
    }

    if (businessName !== undefined) updateData.businessName = businessName
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage

    const user = await db.user.update({
      where: { id: auth.user.id },
      data: updateData,
    })

    const safeUser = excludePassword(user)

    return success({ user: safeUser })
  } catch {
    return error('Internal server error', 500)
  }
}
