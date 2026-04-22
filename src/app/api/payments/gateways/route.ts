import { success } from '@/lib/api-response'
import { getGatewayConfig } from '@/lib/payment-gateways'

export async function GET() {
  const config = getGatewayConfig()
  return success({
    gateways: [
      { id: 'pesapal', name: 'Pesapal', description: 'Mobile Money & Cards', enabled: config.pesapal.isEnabled },
      { id: 'stripe', name: 'Stripe', description: 'Credit & Debit Cards', enabled: config.stripe.isEnabled },
      { id: 'paypal', name: 'PayPal', description: 'PayPal Account', enabled: config.paypal.isEnabled },
    ],
  })
}
