import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'

export async function GET() {
  try {
    // No auth required for viewing MNO providers (public data)
    const providers = await db.mnoProvider.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return success({ providers })
  } catch (err) {
    console.error('Get MNO providers error:', err)
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, country, code, apiEndpoint, apiKey, isActive, notes } = body

    if (!name || !code) {
      return error('name and code are required')
    }

    // Check for duplicate code
    const existingCode = await db.mnoProvider.findUnique({ where: { code: code.toUpperCase() } })
    if (existingCode) {
      return error('MNO provider with this code already exists', 409)
    }

    // Check for duplicate name
    const existingName = await db.mnoProvider.findUnique({ where: { name } })
    if (existingName) {
      return error('MNO provider with this name already exists', 409)
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

    return success({ provider }, 201)
  } catch (err) {
    console.error('Create MNO provider error:', err)
    return error('Internal server error', 500)
  }
}
