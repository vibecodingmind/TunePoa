import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// GET /api/pricing-tiers — List all pricing tiers (public)
export async function GET() {
  try {
    const tiers = await db.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })
    return success({ tiers })
  } catch {
    return error('Internal server error', 500)
  }
}

// POST /api/pricing-tiers — Create a pricing tier (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { name, minUsers, maxUsers, price1Month, price3Month, price6Month, price12Month, displayOrder } = body

    if (!name || minUsers == null || maxUsers == null || price1Month == null || price3Month == null || price6Month == null || price12Month == null) {
      return error('All fields are required: name, minUsers, maxUsers, price1Month, price3Month, price6Month, price12Month')
    }

    const tier = await db.pricingTier.create({
      data: {
        name,
        minUsers,
        maxUsers,
        price1Month,
        price3Month,
        price6Month,
        price12Month,
        displayOrder: displayOrder ?? 0,
        isActive: true,
      },
    })

    return success({ tier }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
