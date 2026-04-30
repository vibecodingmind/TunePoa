import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { decodeToken, isAdmin } from '@/lib/auth'

// POST /api/sample-tunes/reorder — Admin only, update display order
export async function POST(request: NextRequest) {
  try {
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
    const { orders } = body as { orders: { id: string; displayOrder: number }[] }

    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'Invalid orders array' }, { status: 400 })
    }

    // Update each tune's display order
    await Promise.all(
      orders.map((item: { id: string; displayOrder: number }) =>
        db.sampleTune.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/sample-tunes/reorder]', error)
    return NextResponse.json({ success: false, error: 'Failed to reorder sample tunes' }, { status: 500 })
  }
}
