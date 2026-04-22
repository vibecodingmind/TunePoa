import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { pesapalGetToken, getGatewayConfig } from '@/lib/payment-gateways'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { OrderNotificationId, OrderTrackingId, OrderMerchantReference, OrderStatus } = body

    // Get Pesapal token
    const token = await pesapalGetToken()
    if (!token) return new Response('Invalid token', { status: 401 })

    // Get transaction details
    const config = getGatewayConfig().pesapal
    const res = await fetch(`${config.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })
    const data = await res.json()

    if (data.status_code === 1 && data.payment_status === 'COMPLETED') {
      // Find payment by gateway reference
      const payment = await db.payment.findFirst({
        where: { gatewayReference: OrderTrackingId, gateway: 'pesapal' },
      })

      if (payment && payment.status === 'PENDING') {
        // Update payment
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            gatewayStatus: data.payment_status,
            gatewayPayload: JSON.stringify(body),
          },
        })

        // Update subscription
        await db.subscription.update({
          where: { id: payment.subscriptionId },
          data: { paymentStatus: 'PAID' },
        })
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Pesapal callback error:', err)
    return new Response('Error', { status: 500 })
  }
}
