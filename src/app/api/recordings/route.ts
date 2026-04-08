import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    const where: Record<string, unknown> = {}
    if (requestId) where.requestId = requestId

    const recordings = await db.recording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: { id: true, businessName: true, adType: true },
        },
      },
    })

    return NextResponse.json({ recordings })
  } catch (error) {
    console.error('Get recordings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, title, fileName, filePath, fileSize, duration, format, recordedBy, notes } = body

    if (!requestId || !title) {
      return NextResponse.json({ error: 'requestId and title are required' }, { status: 400 })
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
        recordedBy,
        notes,
      },
      include: {
        request: {
          select: { id: true, businessName: true },
        },
      },
    })

    return NextResponse.json({ recording }, { status: 201 })
  } catch (error) {
    console.error('Create recording error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
