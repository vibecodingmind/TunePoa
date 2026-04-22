import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true, businessCategory: true },
        },
        subscription: {
          select: { id: true, status: true, package: { select: { name: true } } },
        },
      },
    })

    if (!invoice) return error('Invoice not found', 404)

    // Users can only view their own invoices, admins can view all
    if (invoice.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    return success({ invoice })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    // Only admins can update invoices
    if (!isAdmin(auth.user.role)) return forbidden()

    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) return error('Invoice not found', 404)

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'PAID') {
        updateData.paidAt = new Date()
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    return success({ invoice })
  } catch {
    return error('Internal server error', 500)
  }
}
