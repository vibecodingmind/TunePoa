import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'

// GET /api/pricing/calculate?userCount=20&durationMonths=6&includesAudio=true
// Returns: matching tier, unit price, subtotal, audio cost, total
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userCount = parseInt(searchParams.get('userCount') || '1', 10)
    const durationMonths = parseInt(searchParams.get('durationMonths') || '1', 10)
    const includesAudio = searchParams.get('includesAudio') === 'true'

    if (!userCount || userCount < 1) {
      return error('userCount must be at least 1')
    }

    const validDurations = [1, 3, 6, 12]
    if (!validDurations.includes(durationMonths)) {
      return error('durationMonths must be 1, 3, 6, or 12')
    }

    // Find the matching tier
    const allTiers = await db.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    const matchedTier = allTiers.find(
      (t) => userCount >= t.minUsers && userCount <= t.maxUsers
    )

    if (!matchedTier) {
      return error(`No pricing tier found for ${userCount} users. Please contact support.`, 404)
    }

    // Get the price per user based on duration
    let unitPrice = 0
    switch (durationMonths) {
      case 1:  unitPrice = matchedTier.price1Month; break
      case 3:  unitPrice = matchedTier.price3Month; break
      case 6:  unitPrice = matchedTier.price6Month; break
      case 12: unitPrice = matchedTier.price12Month; break
    }

    // Calculate totals
    const subtotal = unitPrice * userCount * durationMonths

    // Get audio recording price from settings
    let audioCost = 0
    const audioSetting = await db.pricingSettings.findUnique({
      where: { key: 'audio_recording_price' },
    })
    if (includesAudio && audioSetting) {
      audioCost = parseFloat(audioSetting.value) || 0
    } else if (includesAudio && !audioSetting) {
      audioCost = 15000 // default fallback
    }

    const total = subtotal + audioCost

    return success({
      tier: matchedTier,
      userCount,
      durationMonths,
      unitPrice,
      subtotal,
      includesAudio,
      audioCost,
      total,
    })
  } catch {
    return error('Internal server error', 500)
  }
}
