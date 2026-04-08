import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
        subscriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, businessName: true } },
          },
        },
      },
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Get package error:', error)
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

    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'price', 'durationMonths', 'features', 'maxAdDuration', 'displayOrder', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'features' && typeof body[field] !== 'string') {
          updateData[field] = JSON.stringify(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const pkg = await db.package.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check for active subscriptions
    const activeSubs = await db.subscription.count({
      where: { packageId: id, status: 'ACTIVE' },
    })

    if (activeSubs > 0) {
      return NextResponse.json({ error: 'Cannot delete package with active subscriptions' }, { status: 400 })
    }

    await db.package.delete({ where: { id } })

    return NextResponse.json({ message: 'Package deleted' })
  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
