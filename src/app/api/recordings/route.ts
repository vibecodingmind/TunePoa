import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { VALID_STATUSES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // Auth required
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    const where: Record<string, unknown> = {}
    if (requestId) where.requestId = requestId

    const recordings = await db.recording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: { id: true, businessName: true, adType: true, userId: true },
        },
      },
    })

    // Non-admin: filter to only their own service requests' recordings
    let filtered = recordings
    if (!isAdmin(auth.user.role)) {
      filtered = recordings.filter(r => r.request.userId === auth.user!.id)
    }

    return success({ recordings: filtered })
  } catch (err) {
    console.error('Get recordings error:', err)
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth required - only managers/admins can create recordings
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()
    const { requestId, title, fileName, filePath, fileSize, duration, format, notes } = body

    if (!requestId || !title) {
      return error('requestId and title are required')
    }

    // Verify service request exists
    const serviceRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!serviceRequest) {
      return error('Service request not found', 404)
    }

    const recording = await db.recording.create({
      data: {
        requestId,
        title,
        fileName: fileName || `${title.replace(/\s+/g, '_').toLowerCase()}.mp3`,
        filePath: filePath || `/uploads/${title.replace(/\s+/g, '_').toLowerCase()}.mp3`,
        fileSize: fileSize || 0,
        duration: duration || 30,
        format: format || 'MP3',
        status: 'DRAFT',
        recordedBy: auth.user.id,
        notes,
      },
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
        action: 'CREATED',
        entityType: 'RECORDING',
        entityId: recording.id,
        details: JSON.stringify({ title, requestId }),
      },
    })

    return success({ recording }, 201)
  } catch (err) {
    console.error('Create recording error:', err)
    return error('Internal server error', 500)
  }
}
