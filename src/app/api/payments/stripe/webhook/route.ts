import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sig = request.headers.get('stripe-signature')

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

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
