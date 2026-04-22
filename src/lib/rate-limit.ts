import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter for API routes.
 * Limits requests per IP address within a time window.
 *
 * Usage in route handlers:
 *   const rateLimit = checkRateLimit(request, { maxRequests: 5, windowMs: 60_000 })
 *   if (rateLimit.limited) return rateLimit.response
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  limited: boolean
  response: NextResponse | null
  remaining: number
}

export function checkRateLimit(
  request: NextRequest,
  options: { maxRequests?: number; windowMs?: number } = {}
): RateLimitResult {
  const { maxRequests = 10, windowMs = 60_000 } = options

  // Get client IP (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, response: null, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return {
      limited: true,
      response: NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(entry.resetAt),
          },
        }
      ),
      remaining: 0,
    }
  }

  entry.count++
  return { limited: false, response: null, remaining: maxRequests - entry.count }
}
