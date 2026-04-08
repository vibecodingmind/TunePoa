import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true },
        },
        recordings: {
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          include: {
            package: true,
            payments: true,
            mnoProvider: true,
          },
        },
        whatsappVerifications: {
          include: {
            recording: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: serviceRequest })
  } catch (error) {
    console.error('Get service request error:', error)
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

    const existing = await db.serviceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'assignedTo', 'rejectionReason', 'adScript', 'targetAudience', 'specialInstructions', 'preferredLanguage', 'businessName', 'businessCategory', 'adType']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const serviceRequest = await db.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
        recordings: true,
      },
    })

    await db.activityLog.create({
      data: {
        userId: existing.userId,
        action: body.status ? 'STATUS_CHANGE' : 'UPDATED',
        entityType: 'SERVICE_REQUEST',
        entityId: id,
        details: JSON.stringify(updateData),
      },
    })

    return NextResponse.json({ request: serviceRequest })
  } catch (error) {
    console.error('Update service request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.serviceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
    }

    await db.serviceRequest.delete({ where: { id } })

    await db.activityLog.create({
      data: {
        userId: existing.userId,
        action: 'DELETED',
        entityType: 'SERVICE_REQUEST',
        entityId: id,
        details: JSON.stringify({ businessName: existing.businessName }),
      },
    })

    return NextResponse.json({ message: 'Service request deleted' })
  } catch (error) {
    console.error('Delete service request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
