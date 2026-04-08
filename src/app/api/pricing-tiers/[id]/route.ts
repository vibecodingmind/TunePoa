import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// GET /api/pricing-tiers/[id] — Get single tier (public)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tier = await db.pricingTier.findUnique({ where: { id } })
    if (!tier) return error('Pricing tier not found', 404)
    return success({ tier })
  } catch (err) {
    console.error('Get pricing tier error:', err)
    return error('Internal server error', 500)
  }
}

// PATCH /api/pricing-tiers/[id] — Update tier (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const { id } = await params
    const body = await request.json()
    const { name, minUsers, maxUsers, price1Month, price3Month, price6Month, price12Month, isActive, displayOrder } = body

    const tier = await db.pricingTier.findUnique({ where: { id } })
    if (!tier) return error('Pricing tier not found', 404)

    const updated = await db.pricingTier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(minUsers !== undefined && { minUsers }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(price1Month !== undefined && { price1Month }),
        ...(price3Month !== undefined && { price3Month }),
        ...(price6Month !== undefined && { price6Month }),
        ...(price12Month !== undefined && { price12Month }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    })

    return success({ tier: updated })
  } catch (err) {
    console.error('Update pricing tier error:', err)
    return error('Internal server error', 500)
  }
}

// DELETE /api/pricing-tiers/[id] — Soft-delete tier (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const { id } = await params
    const tier = await db.pricingTier.findUnique({ where: { id } })
    if (!tier) return error('Pricing tier not found', 404)

    await db.pricingTier.update({
      where: { id },
      data: { isActive: false },
    })

    return success({ message: 'Pricing tier deactivated' })
  } catch (err) {
    console.error('Delete pricing tier error:', err)
    return error('Internal server error', 500)
  }
}
