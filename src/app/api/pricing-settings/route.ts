import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// GET /api/pricing-settings — Get all pricing settings (public read)
export async function GET() {
  try {
    const settings = await db.pricingSettings.findMany()
    // Return as key-value map
    const map: Record<string, { value: string; label: string }> = {}
    for (const s of settings) {
      map[s.key] = { value: s.value, label: s.label }
    }
    return success({ settings: map })
  } catch {
    return error('Internal server error', 500)
  }
}

// POST /api/pricing-settings — Create or update a setting (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { key, value, label } = body

    if (!key || value === undefined || !label) {
      return error('key, value, and label are required')
    }

    const setting = await db.pricingSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), label },
    })

    return success({ setting })
  } catch {
    return error('Internal server error', 500)
  }
}
