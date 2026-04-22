import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getGatewayConfig } from '@/lib/payment-gateways'

/**
 * PayPal webhook endpoint.
 * NOTE: In production, verify webhook signatures using the PayPal SDK
 * or manual verification to prevent spoofed webhook calls.
 * Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment.
 */
export async function POST(request: NextRequest) {
  try {
    const config = getGatewayConfig().paypal
    if (!config.isEnabled) {
      return new Response(JSON.stringify({ error: 'PayPal not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()

    // PayPal webhook: capture order on APPROVED event
    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource?.id
      const subscriptionId = body.resource?.purchase_units?.[0]?.reference_id

      if (orderId && subscriptionId) {
        // Get access token
        const authRes = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
          },
          body: 'grant_type=client_credentials',
        })
        const authData = await authRes.json()

        if (!authData.access_token) {
          return new Response(JSON.stringify({ error: 'PayPal auth failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Capture the order
        const captureRes = await fetch(`${config.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.access_token}`,
          },
        })
        const captureData = await captureRes.json()

        if (captureData.status === 'COMPLETED') {
          const payment = await db.payment.findFirst({
            where: { gatewayReference: orderId, gateway: 'paypal' },
          })

          if (payment && payment.status === 'PENDING') {
            await db.payment.update({
              where: { id: payment.id },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
                gatewayStatus: 'COMPLETED',
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
