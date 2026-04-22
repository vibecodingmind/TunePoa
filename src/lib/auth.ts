import { scrypt, randomBytes, createHmac, timingSafeEqual, scryptSync } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ADMIN_ROLES } from './constants'

// ---------------------------------------------------------------------------
// Token payload structure
// ---------------------------------------------------------------------------

interface TokenPayload {
  userId: string
  email: string
  role: string
  name: string
  exp: number
}

interface AuthResult {
  authenticated: boolean
  user?: {
    id: string
    email: string
    role: string
    name: string
  }
}

// ---------------------------------------------------------------------------
// Token secret
// ---------------------------------------------------------------------------

function getTokenSecret(): Buffer {
  const secret = process.env.TOKEN_SECRET
  if (secret) return Buffer.from(secret, 'utf-8')
  // Deterministic fallback so the server can restart without losing sessions.
  // NOT ideal for production — set TOKEN_SECRET in your .env file.
  return Buffer.from('tunepoa-ringback-platform-token-secret-key-2025')
}

// ---------------------------------------------------------------------------
// Password hashing (scrypt)
// ---------------------------------------------------------------------------

const SCRYPT_KEYLEN = 64
const SCRYPT_COST = 16384   // N
const SCRYPT_BLOCK = 8      // r
const SCRYPT_PARALLEL = 1   // p

/**
 * Hash a password using Node.js scrypt.
 * Output format: `scrypt$<hex_salt>$<hex_hash>`
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK,
    p: SCRYPT_PARALLEL,
  })
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

/**
 * Verify a plaintext password against a scrypt hash.
 * Handles both the new `scrypt$...` format and the legacy reverse-base64 format
 * so existing seeded passwords continue to work until they are re-hashed.
 */
export function verifyPassword(password: string, hashed: string): boolean {
  // --- New scrypt format ---
  if (hashed.startsWith('scrypt$')) {
    const parts = hashed.split('$')
    if (parts.length !== 3) return false
    const salt = Buffer.from(parts[1], 'hex')
    const expected = Buffer.from(parts[2], 'hex')
    const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_COST,
      r: SCRYPT_BLOCK,
      p: SCRYPT_PARALLEL,
    })
    // timingSafeEqual requires equal-length buffers
    if (hash.length !== expected.length) return false
    return timingSafeEqual(hash, expected)
  }

  // --- Legacy reverse-base64 format (for existing seeded passwords) ---
  // This will be removed after a one-time migration re-hashes all passwords.
  const legacy = Buffer.from(password.split('').reverse().join('')).toString('base64')
  return legacy === hashed
}

// ---------------------------------------------------------------------------
// Token creation / verification (HMAC-signed)
// ---------------------------------------------------------------------------

/**
 * Create a signed token with expiry.
 * Format: `tp_<base64url_payload>.<hex_hmac>`
 *
 * The payload is base64-encoded JSON so the client can still decode role/name
 * for routing. The HMAC prevents tampering.
 */
export function createToken(user: { id: string; email: string; role: string; name: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const hmac = createHmac('sha256', getTokenSecret()).update(encoded).digest('hex')
  return `tp_${encoded}.${hmac}`
}

/**
 * Decode and validate an HMAC-signed token.
 * Returns null if missing, expired, tampered, or malformed.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    if (!token.startsWith('tp_')) return null
    const rest = token.slice(3)
    const dotIndex = rest.lastIndexOf('.')
    if (dotIndex === -1) return null

    const encoded = rest.slice(0, dotIndex)
    const providedHmac = rest.slice(dotIndex + 1)

    // Verify HMAC
    const expectedHmac = createHmac('sha256', getTokenSecret()).update(encoded).digest('hex')
    if (!timingSafeEqualStrings(providedHmac, expectedHmac)) return null

    // Decode payload
    const json = Buffer.from(encoded, 'base64url').toString('utf-8')
    const payload: TokenPayload = JSON.parse(json)

    // Check expiry
    if (payload.exp && payload.exp < Date.now()) return null

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Timing-safe string comparison for HMAC verification.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a, 'utf-8')
  const bufB = Buffer.from(b, 'utf-8')
  return timingSafeEqual(bufA, bufB)
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

/**
 * Extract token from request (Authorization header or ?token query param)
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const parts = authHeader.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1]
    }
  }

  // Check query params
  const { searchParams } = new URL(request.url)
  const queryToken = searchParams.get('token')
  if (queryToken) return queryToken

  return null
}

/**
 * Authenticate a request and return the user info.
 * Returns { authenticated: false } if not authenticated.
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request)
  if (!token) {
    return { authenticated: false }
  }

  const payload = decodeToken(token)
  if (!payload) {
    return { authenticated: false }
  }

  // Verify user still exists and is active
  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, status: true },
    })

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return { authenticated: false }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    }
  } catch {
    return { authenticated: false }
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role)
}

/**
 * Helper to exclude password from user objects
 */
export function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  const { password: _pwd, ...rest } = user as T & { password?: unknown }
  return rest
}
