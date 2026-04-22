export type PaymentGateway = 'pesapal' | 'stripe' | 'paypal'

export interface GatewayConfig {
  pesapal: {
    consumerKey: string
    consumerSecret: string
    baseUrl: string  // 'https://pay.pesapal.com/v3' for production, 'https://cybqa.pesapal.com/pesapalv3' for sandbox
    isEnabled: boolean
  }
  stripe: {
    secretKey: string
    publishableKey: string
    webhookSecret: string
    isEnabled: boolean
  }
  paypal: {
    clientId: string
    clientSecret: string
    baseUrl: string  // 'https://api-m.paypal.com' for production
    mode: 'live' | 'sandbox'
    isEnabled: boolean
  }
}

export function getGatewayConfig(): GatewayConfig {
  return {
    pesapal: {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
      baseUrl: process.env.PESAPAL_ENV === 'production'
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/pesapalv3',
      isEnabled: !!(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET),
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      isEnabled: !!process.env.STRIPE_SECRET_KEY,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      baseUrl: process.env.PAYPAL_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com',
      mode: process.env.PAYPAL_ENV === 'production' ? 'live' : 'sandbox',
      isEnabled: !!process.env.PAYPAL_CLIENT_ID,
    },
  }
}

export interface InitPaymentParams {
  gateway: PaymentGateway
  amount: number
  currency: string
  subscriptionId: string
  userId: string
  userEmail: string
  userName: string
  description: string
  returnUrl: string
  cancellationUrl?: string
}

export interface GatewayPaymentResult {
  success: boolean
  reference?: string
  redirectUrl?: string
  checkoutUrl?: string
  error?: string
}

// Pesapal - Get access token
export async function pesapalGetToken(): Promise<string | null> {
  const config = getGatewayConfig().pesapal
  if (!config.isEnabled) return null

  try {
    const res = await fetch(`${config.baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: config.consumerKey,
        consumer_secret: config.consumerSecret,
      }),
    })
    const data = await res.json()
    return data.token
  } catch {
    return null
  }
}

// Pesapal - Initiate payment
export async function pesapalInitPayment(params: InitPaymentParams): Promise<GatewayPaymentResult> {
  const config = getGatewayConfig().pesapal
  const token = await pesapalGetToken()
  if (!token) return { success: false, error: 'Failed to get Pesapal token' }

  try {
    const res = await fetch(`${config.baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: params.subscriptionId,
        currency: params.currency,
        amount: params.amount,
        description: params.description,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/pesapal/callback`,
        notification_id: `tunepoa_${params.subscriptionId}`,
        billing_address: {
          email_address: params.userEmail,
          phone_number: '',
          country_code: 'TZ',
          first_name: params.userName.split(' ')[0] || '',
          last_name: params.userName.split(' ').slice(1).join(' ') || '',
        },
      }),
    })
    const data = await res.json()
    if (data.redirect_url) {
      return { success: true, reference: data.order_tracking_id, redirectUrl: data.redirect_url }
    }
    return { success: false, error: data.error?.message || 'Failed to initiate Pesapal payment' }
  } catch {
    return { success: false, error: 'Pesapal payment initiation failed' }
  }
}

// Stripe - Create checkout session
export async function stripeInitPayment(params: InitPaymentParams): Promise<GatewayPaymentResult> {
  const config = getGatewayConfig().stripe
  if (!config.isEnabled) return { success: false, error: 'Stripe not configured' }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': params.currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': params.description,
        'line_items[0][price_data][unit_amount]': String(Math.round(params.amount)), // Stripe uses cents
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${params.returnUrl}?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': params.cancellationUrl || `${params.returnUrl}?cancelled=true`,
        'client_reference_id': params.subscriptionId,
        'metadata[subscription_id]': params.subscriptionId,
        'metadata[user_id]': params.userId,
      }),
    })
    const data = await res.json()
    if (data.url) {
      return { success: true, reference: data.id, checkoutUrl: data.url }
    }
    return { success: false, error: data.error?.message || 'Failed to create Stripe session' }
  } catch {
    return { success: false, error: 'Stripe payment initiation failed' }
  }
}

// PayPal - Create order
export async function paypalInitPayment(params: InitPaymentParams): Promise<GatewayPaymentResult> {
  const config = getGatewayConfig().paypal
  if (!config.isEnabled) return { success: false, error: 'PayPal not configured' }

  try {
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
      return { success: false, error: 'Failed to get PayPal access token' }
    }

    // Create order
    const orderRes = await fetch(`${config.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: params.subscriptionId,
          description: params.description,
          amount: {
            currency_code: params.currency,
            value: String(params.amount),
          },
        }],
        application_context: {
          brand_name: 'TunePoa',
          return_url: `${params.returnUrl}?gateway=paypal`,
          cancel_url: params.cancellationUrl || `${params.returnUrl}?cancelled=true`,
        },
      }),
    })
    const orderData = await orderRes.json()
    if (orderData.links) {
      const approveLink = orderData.links.find((l: { rel: string }) => l.rel === 'approve')
      if (approveLink) {
        return { success: true, reference: orderData.id, checkoutUrl: approveLink.href }
      }
    }
    return { success: false, error: orderData.message || 'Failed to create PayPal order' }
  } catch {
    return { success: false, error: 'PayPal payment initiation failed' }
  }
}

// Unified init payment
export async function initiatePayment(params: InitPaymentParams): Promise<GatewayPaymentResult> {
  switch (params.gateway) {
    case 'pesapal': return pesapalInitPayment(params)
    case 'stripe': return stripeInitPayment(params)
    case 'paypal': return paypalInitPayment(params)
    default: return { success: false, error: `Unknown gateway: ${params.gateway}` }
  }
}
