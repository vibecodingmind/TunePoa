import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// ---------------------------------------------------------------------------
// CSV helper
// ---------------------------------------------------------------------------

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2)
}

function isoDate(d: Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toISOString()
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    // Export is admin-only
    if (!isAdmin(auth.user.role)) {
      return forbidden('Only admins can export data')
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filters
    const dateFilter: Record<string, unknown> = {}
    if (startDate || endDate) {
      const dateWhere: Record<string, unknown> = {}
      if (startDate) dateWhere.gte = new Date(startDate)
      if (endDate) dateWhere.lte = new Date(endDate)
      dateFilter.createdAt = dateWhere
    }

    const statusFilter = status ? { status } : {}

    let csv = ''
    let filename = `export-${type}-${Date.now()}.csv`

    switch (type) {
      // ──────────────── USERS ────────────────
      case 'users': {
        const users = await db.user.findMany({
          where: { ...statusFilter, ...dateFilter },
          orderBy: { createdAt: 'desc' },
        })
        csv = buildCsv(
          ['id', 'name', 'email', 'phone', 'businessName', 'role', 'status', 'createdAt'],
          users.map(u => [u.id, u.name, u.email, u.phone, u.businessName, u.role, u.status, isoDate(u.createdAt)])
        )
        filename = `users-export-${Date.now()}.csv`
        break
      }

      // ──────────────── SUBSCRIPTIONS ────────────────
      case 'subscriptions': {
        const subs = await db.subscription.findMany({
          where: { ...statusFilter, ...dateFilter },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        })
        csv = buildCsv(
          ['id', 'userId', 'userName', 'tier', 'status', 'amount', 'currency', 'startDate', 'endDate', 'paymentStatus'],
          subs.map(s => [
            s.id,
            s.userId,
            s.user.name,
            s.pricingTierId || 'legacy',
            s.status,
            formatNumber(s.amount),
            s.currency,
            isoDate(s.startDate),
            isoDate(s.endDate),
            s.paymentStatus,
          ])
        )
        filename = `subscriptions-export-${Date.now()}.csv`
        break
      }

      // ──────────────── PAYMENTS ────────────────
      case 'payments': {
        const payments = await db.payment.findMany({
          where: { ...statusFilter, ...dateFilter },
          orderBy: { createdAt: 'desc' },
        })
        csv = buildCsv(
          ['id', 'subscriptionId', 'amount', 'method', 'status', 'reference', 'paidAt'],
          payments.map(p => [
            p.id,
            p.subscriptionId,
            formatNumber(p.amount),
            p.method,
            p.status,
            p.reference || '',
            isoDate(p.paidAt),
          ])
        )
        filename = `payments-export-${Date.now()}.csv`
        break
      }

      // ──────────────── REQUESTS ────────────────
      case 'requests': {
        const reqs = await db.serviceRequest.findMany({
          where: { ...statusFilter, ...dateFilter },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        })
        csv = buildCsv(
          ['id', 'userId', 'userName', 'businessName', 'status', 'adType', 'createdAt'],
          reqs.map(r => [
            r.id,
            r.userId,
            r.user.name,
            r.businessName,
            r.status,
            r.adType,
            isoDate(r.createdAt),
          ])
        )
        filename = `requests-export-${Date.now()}.csv`
        break
      }

      // ──────────────── INVOICES ────────────────
      case 'invoices': {
        const invoices = await db.invoice.findMany({
          where: { ...statusFilter, ...dateFilter },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        })
        csv = buildCsv(
          ['id', 'invoiceNumber', 'userId', 'userName', 'amount', 'status', 'issuedAt', 'dueDate', 'paidAt'],
          invoices.map(inv => [
            inv.id,
            inv.invoiceNumber,
            inv.userId,
            inv.user.name,
            formatNumber(inv.amount),
            inv.status,
            isoDate(inv.issuedAt),
            isoDate(inv.dueDate),
            isoDate(inv.paidAt),
          ])
        )
        filename = `invoices-export-${Date.now()}.csv`
        break
      }

      default:
        return error(`Invalid export type: ${type}. Use users, subscriptions, payments, requests, or invoices.`)
    }

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return error('Internal server error', 500)
  }
}
