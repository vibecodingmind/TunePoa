import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isManager } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Auth required - managers/admins only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isManager(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { recordingId, requestId, phoneNumber } = body

    if (!recordingId || !requestId || !phoneNumber) {
      return error('recordingId, requestId, and phoneNumber are required')
    }

    // Verify recording exists
    const recording = await db.recording.findUnique({ where: { id: recordingId } })
    if (!recording) {
      return error('Recording not found', 404)
    }

    // Verify service request exists
    const serviceRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!serviceRequest) {
      return error('Service request not found', 404)
    }

    // Create WhatsApp verification entry (simulating send)
    const verification = await db.whatsAppVerification.create({
      data: {
        recordingId,
        requestId,
        phoneNumber,
        messageStatus: 'SENT',
        sentAt: new Date(),
      },
      include: {
        recording: true,
        request: {
          select: { id: true, businessName: true },
        },
      },
    })

    // Update service request status
    await db.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'AWAITING_VERIFICATION' },
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'CREATED',
        entityType: 'WHATSAPP_VERIFICATION',
        entityId: verification.id,
        details: JSON.stringify({ recordingId, requestId, phoneNumber }),
      },
    })

    return success({ verification }, 201)
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return error('Internal server error', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Auth required - managers/admins only
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isManager(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { id, response, responseNotes, messageStatus } = body

    if (!id) {
      return error('Verification ID is required')
    }

    const existing = await db.whatsAppVerification.findUnique({ where: { id } })
    if (!existing) {
      return error('Verification not found', 404)
    }

    const updateData: Record<string, unknown> = {
      respondedAt: new Date(),
    }

    if (response) updateData.response = response
    if (responseNotes) updateData.responseNotes = responseNotes
    if (messageStatus) updateData.messageStatus = messageStatus

    const verification = await db.whatsAppVerification.update({
      where: { id },
      data: updateData,
    })

    // If approved/rejected, update service request status
    if (response === 'APPROVED') {
      await db.serviceRequest.update({
        where: { id: existing.requestId },
        data: { status: 'APPROVED' },
      })
    } else if (response === 'REJECTED') {
      await db.serviceRequest.update({
        where: { id: existing.requestId },
        data: { status: 'REJECTED', rejectionReason: responseNotes || 'Rejected via WhatsApp' },
      })
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'WHATSAPP_VERIFICATION',
        entityId: id,
        details: JSON.stringify({ response, messageStatus }),
      },
    })

    return success({ verification })
  } catch (err) {
    console.error('WhatsApp update error:', err)
    return error('Internal server error', 500)
  }
}
