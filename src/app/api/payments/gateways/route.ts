import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { getGatewayConfig } from '@/lib/payment-gateways'
import { authenticate, isAdmin } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Config file path for runtime gateway toggles
// ---------------------------------------------------------------------------
const CONFIG_PATH = '/tmp/gateway-config.json'

async function readGatewayOverrides(): Promise<Record<string, boolean>> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeGatewayOverrides(overrides: Record<string, boolean>): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(overrides, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// GET  –  return gateway list with current status
// ---------------------------------------------------------------------------
export async function GET() {
  const envConfig = getGatewayConfig()
  const overrides = await readGatewayOverrides()

  // Merged status: override wins if present, otherwise use env-var check
  const gateways = [
    {
      id: 'pesapal',
      name: 'Pesapal',
      description: 'Mobile Money & Cards',
      enabled: overrides['pesapal'] ?? envConfig.pesapal.isEnabled,
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Credit & Debit Cards',
      enabled: overrides['stripe'] ?? envConfig.stripe.isEnabled,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'PayPal Account',
      enabled: overrides['paypal'] ?? envConfig.paypal.isEnabled,
    },
  ]

  return success({ gateways })
}

// ---------------------------------------------------------------------------
// POST  –  toggle a gateway on/off (admin only)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }
    if (!isAdmin(auth.user.role)) {
      return forbidden('Admin access required')
    }

    const body = await request.json()
    const { gatewayId, enabled } = body

    if (!gatewayId || typeof enabled !== 'boolean') {
      return error('gatewayId (string) and enabled (boolean) are required')
    }

    const validGateways = ['pesapal', 'stripe', 'paypal']
    if (!validGateways.includes(gatewayId)) {
      return error(`Invalid gateway: ${gatewayId}. Must be one of: ${validGateways.join(', ')}`)
    }

    // Persist override
    const overrides = await readGatewayOverrides()
    overrides[gatewayId] = enabled
    await writeGatewayOverrides(overrides)

    return success({ gatewayId, enabled, message: `Gateway ${gatewayId} ${enabled ? 'enabled' : 'disabled'}` })
  } catch {
    return error('Internal server error', 500)
  }
}
