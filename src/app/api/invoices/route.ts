import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// Generate sequential invoice number: INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getDate().toString().padStart(2, '0')
  const prefix = `INV-${dateStr}-`

  // Find the last invoice for today
  const lastInvoice = await db.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  })

  let sequence = 1
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.slice(prefix.length), 10)
    sequence = lastSequence + 1
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const subscriptionId = searchParams.get('subscriptionId')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}

    // Non-admin users can only see their own invoices
    if (!isAdmin(auth.user.role)) {
      where.userId = auth.user.id
    }

    if (status) where.status = status
    if (subscriptionId) where.subscriptionId = subscriptionId

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, businessName: true },
          },
          subscription: {
            select: { id: true, status: true, package: { select: { name: true } } },
          },
        },
      }),
      db.invoice.count({ where }),
    ])

    return success({ invoices, total })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const body = await request.json()
    const { userId, subscriptionId, items, notes } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one invoice item is required')
    }

    for (const item of items) {
      if (!item.description || item.quantity === undefined || item.unitPrice === undefined) {
        return error('Each item must have description, quantity, and unitPrice')
      }
      if (item.quantity <= 0 || item.unitPrice <= 0) {
        return error('Quantity and unit price must be positive')
      }
    }

    // Determine userId: admin can specify, otherwise use their own
    const targetUserId = isAdmin(auth.user.role) ? userId || auth.user.id : auth.user.id

    // Verify target user exists
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) return error('Target user not found', 404)

    // Calculate total
    const total = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Set due date to 30 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = await db.invoice.create({
      data: {
        userId: targetUserId,
        subscriptionId: subscriptionId || null,
        invoiceNumber,
        amount: total,
        status: isAdmin(auth.user.role) ? 'SENT' : 'DRAFT',
        issuedAt: new Date(),
        dueDate,
        items: JSON.stringify(items),
        notes: notes || null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    return success({ invoice }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
