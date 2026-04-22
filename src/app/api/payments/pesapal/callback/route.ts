import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { pesapalGetToken, getGatewayConfig } from '@/lib/payment-gateways'

export async function POST(request: NextRequest) {
  try {
    // Verify request is from Pesapal (basic auth via token check)
    const body = await request.json()
    const { OrderNotificationId, OrderTrackingId, OrderMerchantReference, OrderStatus } = body

    if (!OrderTrackingId) {
      return new Response('Missing OrderTrackingId', { status: 400 })
    }

    // Get Pesapal token to verify the callback is legitimate
    const token = await pesapalGetToken()
    if (!token) return new Response('Service unavailable', { status: 503 })

    // Get transaction details from Pesapal
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
  } catch {
    return new Response('Internal Server Error', { status: 500 })
  }
}
