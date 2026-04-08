import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, durationMonths, features, maxAdDuration, displayOrder, isActive } = body

    if (!name || !description || price === undefined || !durationMonths || !features) {
      return NextResponse.json({ error: 'name, description, price, durationMonths, and features are required' }, { status: 400 })
    }

    const pkg = await db.package.create({
      data: {
        name,
        description,
        price,
        durationMonths,
        features: typeof features === 'string' ? features : JSON.stringify(features),
        maxAdDuration: maxAdDuration || 30,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
