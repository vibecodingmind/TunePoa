import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple token generation for demo purposes
function generateToken(userId: string): string {
  return `tp_${Buffer.from(`${userId}:${Date.now()}`).toString('base64')}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Simple password check (demo - plain text comparison)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 })
    }

    const token = generateToken(user.id)

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email }),
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
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
