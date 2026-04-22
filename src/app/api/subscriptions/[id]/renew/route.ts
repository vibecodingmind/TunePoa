import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { authenticate } from '@/lib/auth'
import { success, error, unauthorized } from '@/lib/api-response'

/**
 * Generate an invoice number in the format INV-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit number.
 */
function generateInvoiceNumber(): string {
  const today = new Date()
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getDate().toString().padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000) // 4-digit random
  return `INV-${dateStr}-${random}`
}

/**
 * POST /api/subscriptions/[id]/renew
 *
 * Renew a subscription. Accepts optional tier change and audio add-on.
 *
 * Body: { durationMonths?: number, includesAudio?: boolean, tierId?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ── 1. Authenticate ──
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    // ── 2. Parse body ──
    const body = await request.json()
    const { durationMonths, includesAudio, tierId } = body as {
      durationMonths?: number
      includesAudio?: boolean
      tierId?: string
    }

    const duration = durationMonths ?? 1

    if (duration < 1 || duration > 24) {
      return error('durationMonths must be between 1 and 24')
    }

    // ── 3. Find subscription with user and pricingTier ──
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
        pricingTier: true,
      },
    })

    if (!subscription) {
      return error('Subscription not found', 404)
    }

    // ── 4. Validate status ──
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'EXPIRED') {
      return error('Subscription must be ACTIVE or EXPIRED to renew')
    }

    // ── 5. Determine pricing tier and per-user price ──
    let tier = subscription.pricingTier
    let unitPrice = subscription.unitPrice

    if (tierId) {
      const newTier = await db.pricingTier.findUnique({ where: { id: tierId } })
      if (!newTier || !newTier.isActive) {
        return error('Pricing tier not found or inactive', 404)
      }
      tier = newTier
    }

    if (tier) {
      // Pick the price column that best matches the requested duration
      if (duration <= 1) unitPrice = tier.price1Month
      else if (duration <= 3) unitPrice = tier.price3Month
      else if (duration <= 6) unitPrice = tier.price6Month
      else unitPrice = tier.price12Month
    }

    // ── 6. Calculate renewal amount ──
    const userCount = subscription.userCount || 1
    const renewalAmount = unitPrice * userCount * duration

    // Audio add-on cost (from PricingSettings)
    const audioSettings = await db.pricingSettings.findUnique({
      where: { key: 'audio_recording_price' },
    })
    const audioCost = includesAudio && audioSettings ? Number(audioSettings.value) : 0
    const totalAmount = renewalAmount + audioCost

    // ── 7. Calculate new end date ──
    //   new endDate = max(currentEndDate, now) + durationMonths
    const now = new Date()
    const baseDate =
      subscription.endDate && new Date(subscription.endDate) > now
        ? new Date(subscription.endDate)
        : now
    const newEndDate = new Date(baseDate)
    newEndDate.setMonth(newEndDate.getMonth() + duration)

    // ── 8. Update subscription ──
    const renewed = await db.subscription.update({
      where: { id },
      data: {
        endDate: newEndDate,
        amount: totalAmount,
        unitPrice,
        durationMonths: duration,
        includesAudio: includesAudio ?? subscription.includesAudio,
        paymentStatus: 'UNPAID',
        pricingTierId: tierId || subscription.pricingTierId,
        // If expired, reactivate
        ...(subscription.status === 'EXPIRED' ? { status: 'ACTIVE' } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
        pricingTier: true,
        package: true,
      },
    })

    // ── 9. Create invoice ──
    const invoiceNumber = generateInvoiceNumber()

    const invoiceLineItems = [
      {
        description: `Subscription renewal – ${duration} month(s)`,
        quantity: userCount,
        unitPrice,
        amount: renewalAmount,
      },
    ]

    if (audioCost > 0) {
      invoiceLineItems.push({
        description: 'Audio recording add-on',
        quantity: 1,
        unitPrice: audioCost,
        amount: audioCost,
      })
    }

    const invoice = await db.invoice.create({
      data: {
        userId: subscription.userId,
        subscriptionId: id,
        invoiceNumber,
        amount: totalAmount,
        currency: subscription.currency || 'TZS',
        status: 'SENT',
        issuedAt: new Date(),
        dueDate: newEndDate,
        items: JSON.stringify(invoiceLineItems),
      },
    })

    // ── 10. Create notification ──
    await db.notification.create({
      data: {
        userId: subscription.userId,
        title: 'Subscription Renewed',
        message: `Your subscription has been renewed for ${duration} month(s). Invoice ${invoiceNumber} for ${new Intl.NumberFormat('en-TZ').format(totalAmount)} TZS is now due.`,
        type: 'SUCCESS',
        actionUrl: '/subscriptions',
      },
    })

    // ── 11. Create activity log ──
    await db.activityLog.create({
      data: {
        userId: auth.user.id,
        action: 'UPDATED',
        entityType: 'SUBSCRIPTION',
        entityId: id,
        details: JSON.stringify({
          action: 'RENEWAL',
          durationMonths: duration,
          newEndDate: newEndDate.toISOString(),
          amount: totalAmount,
          includesAudio: includesAudio ?? subscription.includesAudio,
          tierId: tierId || subscription.pricingTierId,
          invoiceNumber,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    })

    // ── 12. Return ──
    return success(
      {
        subscription: renewed,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          status: invoice.status,
        },
      },
      200
    )
  } catch (err) {
    console.error('[RENEW] Error:', err)
    return error('Internal server error', 500)
  }
}
