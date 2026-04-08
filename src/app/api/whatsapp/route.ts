import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordingId, requestId, phoneNumber } = body

    if (!recordingId || !requestId || !phoneNumber) {
      return NextResponse.json({ error: 'recordingId, requestId, and phoneNumber are required' }, { status: 400 })
    }

    // Verify recording and request exist
    const recording = await db.recording.findUnique({ where: { id: recordingId } })
    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    const serviceRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 })
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

    return NextResponse.json({ verification }, { status: 201 })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, response, responseNotes, messageStatus } = body

    if (!id) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 })
    }

    const existing = await db.whatsAppVerification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
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

    return NextResponse.json({ verification })
  } catch (error) {
    console.error('WhatsApp update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
