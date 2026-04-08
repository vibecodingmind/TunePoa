import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ADMIN_ROLES, MANAGER_ROLES } from './constants'

// Token payload structure
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

/**
 * Demo-only password hashing.
 * Uses a simple approach: reverses the password and base64 encodes it.
 * NOT SECURE - for demo purposes only.
 * In production, use bcrypt or argon2.
 */
export function hashPassword(password: string): string {
  return Buffer.from(password.split('').reverse().join('')).toString('base64')
}

export function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed
}

/**
 * Create a token with expiry
 * Format: "tp_" + base64(JSON { userId, email, role, name, exp })
 */
export function createToken(user: { id: string; email: string; role: string; name: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `tp_${encoded}`
}

/**
 * Decode and validate a token
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    // Remove "tp_" prefix
    if (!token.startsWith('tp_')) return null
    const base64 = token.slice(3)
    const json = Buffer.from(base64, 'base64').toString('utf-8')
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
 * Extract token from request (Authorization header or body/token query param)
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
 * Authenticate a request and return the user info
 * Returns { authenticated: false } if not authenticated
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

  // Optionally verify user still exists and is active
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
 * Check if user has manager or admin role
 */
export function isManager(role: string): boolean {
  return (MANAGER_ROLES as readonly string[]).includes(role)
}

/**
 * Helper to exclude password from user objects
 */
export function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  const { password: _pwd, ...rest } = user as T & { password?: unknown }
  return rest
}
