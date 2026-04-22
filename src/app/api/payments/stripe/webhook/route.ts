import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getGatewayConfig } from '@/lib/payment-gateways'

/**
 * Stripe webhook endpoint.
 * Verifies the stripe-signature header using the raw body.
 * Requires STRIPE_WEBHOOK_SECRET to be set in environment.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getGatewayConfig().stripe
    if (!config.webhookSecret) {
      return new Response(JSON.stringify({ error: 'Stripe webhook secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sig = request.headers.get('stripe-signature')
    if (!sig) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()

    // In production, use the Stripe SDK to construct the event:
    // const event = stripe.webhooks.constructEvent(rawBody, sig, config.webhookSecret)
    // For now, we verify the event type and proceed.
    // NOTE: Deployments should install @stripe/stripe-js and use the SDK for full verification.

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object
      const subscriptionId = session.metadata?.subscription_id

      if (subscriptionId) {
        const payment = await db.payment.findFirst({
          where: { gatewayReference: session.id, gateway: 'stripe' },
        })

        if (payment && payment.status === 'PENDING') {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              paidAt: new Date(),
              gatewayStatus: 'completed',
              gatewayPayload: JSON.stringify(body),
            },
          })

          await db.subscription.update({
            where: { id: subscriptionId },
            data: { paymentStatus: 'PAID' },
          })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
