import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const providers = await db.mnoProvider.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Get MNO providers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, country, code, apiEndpoint, apiKey, isActive, notes } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 })
    }

    const provider = await db.mnoProvider.create({
      data: {
        name,
        country: country || 'Tanzania',
        code: code.toUpperCase(),
        apiEndpoint,
        apiKey,
        isActive: isActive !== undefined ? isActive : true,
        notes,
      },
    })

    return NextResponse.json({ provider }, { status: 201 })
  } catch (error) {
    console.error('Create MNO provider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
