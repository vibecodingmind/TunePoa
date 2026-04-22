// TunePoa – Email Helper
// ────────────────────────────────────────────────────────────────
// For now, emails are logged to the console.
// In production, swap the implementation for Resend / SendGrid / etc.

import { db } from './db'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmailOptions {
  to: string
  subject: string
  body: string
  templateKey?: string
  templateData?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Core send (console logger for now)
// ---------------------------------------------------------------------------

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log(`[EMAIL] To: ${options.to}`)
  console.log(`[EMAIL] Subject: ${options.subject}`)
  console.log(`[EMAIL] Body (first 200 chars): ${options.body.slice(0, 200)}`)

  // Store sent email in activity log
  try {
    // Find user by email for activity log
    const user = await db.user.findUnique({
      where: { email: options.to },
      select: { id: true },
    })

    await db.activityLog.create({
      data: {
        userId: user?.id || null,
        action: 'EMAIL_SENT',
        entityType: 'SYSTEM',
        entityId: null,
        details: JSON.stringify({
          to: options.to,
          subject: options.subject,
          templateKey: options.templateKey || null,
        }),
      },
    })
  } catch {
    // Activity log failure should not block email sending
  }

  return true
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to TunePoa! 🎉',
    body: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0d9488;">Welcome to TunePoa, ${user.name}!</h1>
        <p>Thank you for joining TunePoa — your ringback tone marketing platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Create service requests</li>
          <li>Manage subscriptions</li>
          <li>Track your campaigns</li>
        </ul>
        <p>Get started by visiting your dashboard.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">— The TunePoa Team</p>
      </div>
    `,
    templateKey: 'welcome',
    templateData: { name: user.name },
  })
}

export async function sendPaymentConfirmation(
  user: { name: string; email: string },
  amount: number,
  invoiceNumber: string,
) {
  return sendEmail({
    to: user.email,
    subject: `Payment Confirmed — ${invoiceNumber}`,
    body: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0d9488;">Payment Confirmed ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Your payment of <strong>${amount.toLocaleString()} TZS</strong> has been confirmed.</p>
        <p>Invoice: <strong>${invoiceNumber}</strong></p>
        <p>Thank you for your business!</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">— The TunePoa Team</p>
      </div>
    `,
    templateKey: 'payment_confirmation',
    templateData: { name: user.name, amount: String(amount), invoiceNumber },
  })
}

export async function sendSubscriptionExpiryReminder(
  user: { name: string; email: string },
  daysLeft: number,
) {
  return sendEmail({
    to: user.email,
    subject: `Your Subscription Expires in ${daysLeft} Days`,
    body: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #f59e0b;">Subscription Expiring Soon ⚠️</h1>
        <p>Hi ${user.name},</p>
        <p>Your TunePoa subscription will expire in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
        <p>Renew now to avoid any disruption to your ringback tone campaigns.</p>
        <p>Visit your dashboard to renew.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">— The TunePoa Team</p>
      </div>
    `,
    templateKey: 'subscription_expiry',
    templateData: { name: user.name, daysLeft: String(daysLeft) },
  })
}

export async function sendRequestStatusUpdate(
  user: { name: string; email: string },
  status: string,
  requestTitle: string,
) {
  const isSuccess = status === 'APPROVED'
  const color = isSuccess ? '#10b981' : '#ef4444'
  const icon = isSuccess ? '✅' : '❌'

  return sendEmail({
    to: user.email,
    subject: `Service Request ${status}: ${requestTitle}`,
    body: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: ${color};">Request ${status} ${icon}</h1>
        <p>Hi ${user.name},</p>
        <p>Your service request "<strong>${requestTitle}</strong>" has been <strong>${status.toLowerCase()}</strong>.</p>
        ${isSuccess
          ? '<p>Your subscription will be set up shortly. Check your dashboard for updates.</p>'
          : '<p>Please review the feedback and submit a new request if needed.</p>'}
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">— The TunePoa Team</p>
      </div>
    `,
    templateKey: 'request_status_update',
    templateData: { name: user.name, status, requestTitle },
  })
}
