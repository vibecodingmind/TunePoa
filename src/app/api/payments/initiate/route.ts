import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate } from '@/lib/auth'
import { initiatePayment, getGatewayConfig, type PaymentGateway } from '@/lib/payment-gateways'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const body = await request.json()
    const { subscriptionId, gateway } = body as { subscriptionId: string; gateway: PaymentGateway }

    if (!subscriptionId || !gateway) {
      return error('subscriptionId and gateway are required')
    }

    const validGateways: PaymentGateway[] = ['pesapal', 'stripe', 'paypal']
    if (!validGateways.includes(gateway)) {
      return error(`Invalid gateway. Must be: ${validGateways.join(', ')}`)
    }

    // Check gateway is configured
    const config = getGatewayConfig()
    if (!config[gateway].isEnabled) {
      return error(`${gateway} payment gateway is not configured. Please contact support.`, 503)
    }

    // Get subscription
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        request: { select: { businessName: true, adType: true } },
      },
    })
    if (!subscription) return error('Subscription not found', 404)

    // Verify ownership (non-admin)
    if (auth.user.role !== 'SUPER_ADMIN' && auth.user.role !== 'ADMIN' && subscription.userId !== auth.user.id) {
      return error('Subscription not found', 404)
    }

    if (subscription.paymentStatus === 'PAID') {
      return error('This subscription is already paid for')
    }

    // Initiate payment
    const result = await initiatePayment({
      gateway,
      amount: subscription.amount,
      currency: subscription.currency,
      subscriptionId: subscription.id,
      userId: subscription.user.id,
      userEmail: subscription.user.email,
      userName: subscription.user.name,
      description: `TunePoa - ${subscription.request.businessName} Ringback Tone Subscription`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}`,
      cancellationUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}`,
    })

    if (!result.success || !result.reference) {
      return error(result.error || 'Failed to initiate payment')
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        subscriptionId,
        amount: subscription.amount,
        currency: subscription.currency,
        method: gateway.toUpperCase(),
        status: 'PENDING',
        reference: result.reference,
        gateway,
        gatewayReference: result.reference,
        gatewayStatus: 'PENDING',
      },
    })

    return success({
      payment,
      redirectUrl: result.redirectUrl || result.checkoutUrl,
    }, 201)
  } catch {
    return error('Failed to initiate payment', 500)
  }
}
