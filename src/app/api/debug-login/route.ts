import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createToken, excludePassword, hashPassword } from '@/lib/auth'
import { success, error } from '@/lib/api-response'

/**
 * Debug endpoint to test login step by step.
 * GET /api/debug-login?email=admin@tunepoa.co.tz&password=TunePoa@Admin2025!
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'admin@tunepoa.co.tz'
    const password = searchParams.get('password') || 'TunePoa@Admin2025!'

    const steps: { step: string; ok: boolean; detail?: string }[] = []

    // Step 1: Find user
    try {
      const user = await db.user.findUnique({ where: { email } })
      if (user) {
        steps.push({ step: 'find_user', ok: true, detail: `Found user: ${user.id}, role: ${user.role}` })
        steps.push({ step: 'password_field', ok: true, detail: `Password starts with: ${user.password?.substring(0, 15)}...` })
        steps.push({ step: 'password_length', ok: true, detail: `Password hash length: ${user.password?.length}` })

        // Step 2: Test password verification
        try {
          const result = verifyPassword(password, user.password || '')
          steps.push({ step: 'verify_password', ok: true, detail: `Password valid: ${result}` })
        } catch (err: any) {
          steps.push({ step: 'verify_password', ok: false, detail: `${err?.message}` })
        }

        // Step 3: Test excludePassword
        try {
          const safeUser = excludePassword(user)
          steps.push({ step: 'exclude_password', ok: true, detail: `Keys: ${Object.keys(safeUser).join(', ')}` })
        } catch (err: any) {
          steps.push({ step: 'exclude_password', ok: false, detail: `${err?.message}` })
        }

        // Step 4: Test createToken
        try {
          const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name })
          steps.push({ step: 'create_token', ok: true, detail: `Token starts with: ${token.substring(0, 20)}...` })
        } catch (err: any) {
          steps.push({ step: 'create_token', ok: false, detail: `${err?.message}` })
        }

        // Step 5: Test activityLog.create
        try {
          const log = await db.activityLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN_DEBUG',
              entityType: 'USER',
              entityId: user.id,
              details: JSON.stringify({ debug: true }),
            },
          })
          steps.push({ step: 'create_activity_log', ok: true, detail: `Log ID: ${log.id}` })
        } catch (err: any) {
          steps.push({ step: 'create_activity_log', ok: false, detail: `${err?.message}` })
        }

      } else {
        steps.push({ step: 'find_user', ok: false, detail: `No user found with email: ${email}` })
      }
    } catch (err: any) {
      steps.push({ step: 'find_user', ok: false, detail: `${err?.message}` })
    }

    // Step 6: Test hashPassword
    try {
      const hash = hashPassword('test123')
      steps.push({ step: 'hash_password', ok: true, detail: `Hash starts with: ${hash.substring(0, 20)}...` })
    } catch (err: any) {
      steps.push({ step: 'hash_password', ok: false, detail: `${err?.message}` })
    }

    return success({ steps, env: { nodeEnv: process.env.NODE_ENV, hasDbUrl: !!process.env.DATABASE_URL, hasTokenSecret: !!process.env.TOKEN_SECRET } })
  } catch (err: any) {
    return error(`Debug failed: ${err?.message} — ${err?.stack}`, 500)
  }
}
