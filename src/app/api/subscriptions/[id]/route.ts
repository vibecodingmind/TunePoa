import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true },
        },
        package: true,
        request: {
          include: {
            recordings: true,
          },
        },
        mnoProvider: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.subscription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'paymentStatus', 'mnoProviderId', 'mnoReference', 'mnoStatus', 'mnoSubmittedAt', 'mnoActivatedAt', 'phoneNumber', 'autoRenew', 'notes', 'startDate', 'endDate']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field.includes('At') && typeof body[field] === 'string' ? new Date(body[field]) : body[field]
      }
    }

    // Handle MNO activation
    if (body.mnoStatus === 'ACTIVE_MNO') {
      updateData.mnoActivatedAt = new Date()
      updateData.status = 'ACTIVE'
    }

    // Handle MNO submission
    if (body.mnoStatus === 'PENDING_MNO' && !updateData.mnoSubmittedAt) {
      updateData.mnoSubmittedAt = new Date()
    }

    // Handle cancellation
    if (body.status === 'CANCELLED') {
      updateData.mnoStatus = 'REMOVED_MNO'
    }

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, businessName: true } },
        package: true,
        mnoProvider: true,
        payments: true,
      },
    })

    await db.activityLog.create({
      data: {
        userId: existing.userId,
        action: body.status ? 'STATUS_CHANGE' : 'UPDATED',
        entityType: 'SUBSCRIPTION',
        entityId: id,
        details: JSON.stringify(updateData),
      },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.subscription.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    await db.subscription.update({
      where: { id },
      data: { status: 'CANCELLED', mnoStatus: 'REMOVED_MNO' },
    })

    return NextResponse.json({ message: 'Subscription cancelled' })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
