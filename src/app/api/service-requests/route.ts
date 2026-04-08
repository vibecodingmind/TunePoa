import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (userId) where.userId = userId

    const requests = await db.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
        recordings: true,
        subscriptions: {
          include: {
            package: true,
          },
        },
        _count: {
          select: { whatsappVerifications: true },
        },
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get service requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, businessName, businessCategory, adType, targetAudience, adScript, preferredLanguage, specialInstructions } = body

    if (!userId || !businessName || !adScript) {
      return NextResponse.json({ error: 'userId, businessName, and adScript are required' }, { status: 400 })
    }

    const serviceRequest = await db.serviceRequest.create({
      data: {
        userId,
        businessName: businessName,
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

    await db.activityLog.create({
      data: {
        userId,
        action: 'CREATED',
        entityType: 'SERVICE_REQUEST',
        entityId: serviceRequest.id,
        details: JSON.stringify({ adType, businessName }),
      },
    })

    return NextResponse.json({ request: serviceRequest }, { status: 201 })
  } catch (error) {
    console.error('Create service request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
