import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

// ---------------------------------------------------------------------------
// GET  –  list email templates (admin only)
// POST –  send email (admin only / system)
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
    const { to, subject, body: htmlBody, templateKey, templateData } = body

    if (!to || !subject || !htmlBody) {
      return error('to, subject, and body are required')
    }

    const sent = await sendEmail({
      to,
      subject,
      body: htmlBody,
      templateKey,
      templateData,
    })

    if (!sent) {
      return error('Failed to send email', 500)
    }

    return success({ message: 'Email sent successfully' })
  } catch {
    return error('Internal server error', 500)
  }
}
