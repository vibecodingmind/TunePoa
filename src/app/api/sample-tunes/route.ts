import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

// GET /api/sample-tunes — Public, returns all active tunes
export async function GET() {
  try {
    const tunes = await db.sampleTune.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ success: true, data: tunes })
  } catch (error) {
    console.error('[GET /api/sample-tunes]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sample tunes' }, { status: 500 })
  }
}

// POST /api/sample-tunes — Admin only, create new tune
export async function POST(request: NextRequest) {
  try {
    const { user } = await authenticate(request)
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, audioUrl, description, duration, displayOrder } = body

    if (!title || !audioUrl) {
      return NextResponse.json({ success: false, error: 'Title and audio URL are required' }, { status: 400 })
    }

    const tune = await db.sampleTune.create({
      data: {
        title,
        category: category || 'promo',
        audioUrl,
        description: description || null,
        duration: duration ? parseInt(duration) : null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    })

    return NextResponse.json({ success: true, data: tune }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sample-tunes]', error)
    return NextResponse.json({ success: false, error: 'Failed to create sample tune' }, { status: 500 })
  }
}

// Helper to authenticate request
async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return { user: null }

  const token = authHeader.slice(7)
  const { decodeToken } = await import('@/lib/auth')
  const payload = decodeToken(token)
  if (!payload) return { user: null }

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, status: true },
    })
    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') return { user: null }
    return { user }
  } catch {
    return { user: null }
  }
}
