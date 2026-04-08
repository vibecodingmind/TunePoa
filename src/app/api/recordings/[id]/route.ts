import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const recording = await db.recording.findUnique({
      where: { id },
      include: {
        request: {
          select: { id: true, businessName: true, adType: true, user: { select: { name: true, phone: true } } },
        },
        whatsappVerifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    return NextResponse.json({ recording })
  } catch (error) {
    console.error('Get recording error:', error)
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

    const existing = await db.recording.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['status', 'notes', 'title', 'fileName', 'filePath', 'duration']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
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

    return NextResponse.json({ recording })
  } catch (error) {
    console.error('Update recording error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.recording.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    await db.recording.delete({ where: { id } })

    return NextResponse.json({ message: 'Recording deleted' })
  } catch (error) {
    console.error('Delete recording error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
