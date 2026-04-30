import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken, isAdmin } from '@/lib/auth'

// PATCH /api/sample-tunes/[id] — Admin only, update a tune
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = decodeToken(authHeader.slice(7))
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, status: true },
    })
    if (!user || user.status !== 'ACTIVE' || !isAdmin(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.category !== undefined) updateData.category = body.category
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.duration !== undefined) updateData.duration = body.duration ? parseInt(body.duration) : null
    if (body.displayOrder !== undefined) updateData.displayOrder = parseInt(body.displayOrder)
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const tune = await db.sampleTune.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: tune })
  } catch (error) {
    console.error('[PATCH /api/sample-tunes]', error)
    return NextResponse.json({ success: false, error: 'Failed to update sample tune' }, { status: 500 })
  }
}

// DELETE /api/sample-tunes/[id] — Admin only, soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = decodeToken(authHeader.slice(7))
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, status: true },
    })
    if (!user || user.status !== 'ACTIVE' || !isAdmin(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tune = await db.sampleTune.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, data: tune })
  } catch (error) {
    console.error('[DELETE /api/sample-tunes]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete sample tune' }, { status: 500 })
  }
}
