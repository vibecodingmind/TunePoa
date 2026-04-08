import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, businessName, password } = await request.json()

    if (!name || !email || !phone || !businessName || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Check if phone already exists
    const existingPhone = await db.user.findUnique({ where: { phone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        businessName,
        password, // demo: store plain text
        role: 'BUSINESS_OWNER',
        status: 'ACTIVE',
      },
    })

    // Generate simple token
    const token = `tp_${Buffer.from(`${user.id}:${Date.now()}`).toString('base64')}`

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ name, email }),
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
