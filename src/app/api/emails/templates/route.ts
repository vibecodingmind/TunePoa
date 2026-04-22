import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

// ---------------------------------------------------------------------------
// GET  –  list email templates
// POST –  create / update email template (admin only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const templates = await db.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return success({ templates })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user || !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const { key, subject, body: htmlBody, description, isActive } = body

    if (!key || !subject || !htmlBody) {
      return error('key, subject, and body are required')
    }

    // Upsert by key
    const template = await db.emailTemplate.upsert({
      where: { key },
      update: {
        subject,
        body: htmlBody,
        description: description || null,
        isActive: isActive ?? true,
      },
      create: {
        key,
        subject,
        body: htmlBody,
        description: description || null,
        isActive: isActive ?? true,
      },
    })

    return success({ template }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
