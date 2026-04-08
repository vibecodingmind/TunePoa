import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isManager } from '@/lib/auth'
import { VALID_STATUSES } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const recording = await db.recording.findUnique({
      where: { id },
      include: {
        request: {
          select: {
            id: true,
            businessName: true,
            adType: true,
            userId: true,
            user: { select: { name: true, phone: true } },
          },
        },
        whatsappVerifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!recording) {
      return error('Recording not found', 404)
    }

    return success({ recording })
  } catch (err) {
    console.error('Get recording error:', err)
    return error('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Auth required - managers/admins only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isManager(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.recording.findUnique({ where: { id } })
    if (!existing) {
      return error('Recording not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'notes', 'title', 'fileName', 'filePath', 'duration', 'fileSize']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Validate recording status
    if (body.status && !(VALID_STATUSES.RECORDING as readonly string[]).includes(body.status)) {
      return error(`Invalid recording status: ${body.status}`, 400)
    }

    const recording = await db.recording.update({
      where: { id },
      data: updateData,
      include: {
        request: {
          select: { id: true, businessName: true },
        },
      },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: body.status && body.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATED',
        entityType: 'RECORDING',
        entityId: id,
        details: JSON.stringify({
          updatedFields: Object.keys(updateData),
          ...(body.status && body.status !== existing.status ? { from: existing.status, to: body.status } : {}),
        }),
      },
    })

    return success({ recording })
  } catch (err) {
    console.error('Update recording error:', err)
    return error('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth required - managers/admins only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isManager(auth.user.role)) {
      return forbidden()
    }

    const existing = await db.recording.findUnique({ where: { id } })
    if (!existing) {
      return error('Recording not found', 404)
    }

    await db.recording.delete({ where: { id } })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'DELETED',
        entityType: 'RECORDING',
        entityId: id,
        details: JSON.stringify({ title: existing.title }),
      },
    })

    return success({ message: 'Recording deleted' })
  } catch (err) {
    console.error('Delete recording error:', err)
    return error('Internal server error', 500)
  }
}
