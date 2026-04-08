import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    // Non-admin users can only see their own requests
    if (!isAdmin(auth.user.role)) {
      where.userId = auth.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) where.status = status

    if (search && isAdmin(auth.user.role)) {
      where.OR = [
        { businessName: { contains: search } },
        { adScript: { contains: search } },
        { adType: { contains: search } },
      ]
    }

    const requests = await db.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true, phone: true },
        },
        recordings: {
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          include: {
            package: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { whatsappVerifications: true },
        },
      },
    })

    return success({ requests })
  } catch (err) {
    console.error('Get service requests error:', err)
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()
    const { businessName, businessCategory, adType, targetAudience, adScript, preferredLanguage, specialInstructions } = body

    // Validate required fields
    if (!businessName || !adScript) {
      return error('businessName and adScript are required')
    }

    const serviceRequest = await db.serviceRequest.create({
      data: {
        userId: auth.user.id,
        businessName,
        businessCategory: businessCategory || 'general',
        adType: adType || 'PROMO',
        targetAudience,
        adScript,
        preferredLanguage: preferredLanguage || 'swahili',
        specialInstructions,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'SERVICE_REQUEST',
        entityId: serviceRequest.id,
        details: JSON.stringify({ adType: serviceRequest.adType, businessName }),
      },
    })

    return success({ request: serviceRequest }, 201)
  } catch (err) {
    console.error('Create service request error:', err)
    return error('Internal server error', 500)
  }
}
