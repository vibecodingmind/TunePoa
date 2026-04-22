import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getGatewayConfig } from '@/lib/payment-gateways'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // PayPal webhook: capture order on COMPLETED event
    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource?.id
      const subscriptionId = body.resource?.purchase_units?.[0]?.reference_id

      if (orderId && subscriptionId) {
        const config = getGatewayConfig().paypal

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

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('PayPal webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
