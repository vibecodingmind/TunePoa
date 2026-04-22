import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, hashPassword, createToken } from '@/lib/auth'
import { PACKAGE_FEATURES } from '@/lib/constants'

// Shared seed logic
async function runSeed() {
  // Clear existing data in correct order (respecting foreign keys)
  // Ignore tables that may exist in DB but not in current Prisma schema
  try { await db.$executeRawUnsafe(`DELETE FROM "Recording" WHERE 1=1`) } catch { /* table may not exist */ }
  await db.payment.deleteMany({})
  await db.subscription.deleteMany({})
  await db.serviceRequest.deleteMany({})
  await db.activityLog.deleteMany({})
  await db.notification.deleteMany({})
  await db.invoice.deleteMany({})
  await db.emailTemplate.deleteMany({})
  await db.package.deleteMany({})
  await db.pricingTier.deleteMany({})
  await db.pricingSettings.deleteMany({})
  await db.user.deleteMany({})

  // ─── Create Admin Users ───
  const superAdmin = await db.user.create({
    data: {
      name: 'TunePoa Super Admin',
      email: 'admin@tunepoa.co.tz',
      phone: '+255700000001',
      businessName: 'TunePoa Ltd',
      businessCategory: 'technology',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      password: hashPassword('TunePoa@Admin2025!'),
    },
  })

  const admin = await db.user.create({
    data: {
      name: 'TunePoa Operations Manager',
      email: 'manager@tunepoa.co.tz',
      phone: '+255700000002',
      businessName: 'TunePoa Ltd',
      businessCategory: 'technology',
      role: 'ADMIN',
      status: 'ACTIVE',
      password: hashPassword('TunePoa@Manager2025!'),
    },
  })

  // ─── Create Business Owner Users (production sample) ───
  const customer1 = await db.user.create({
    data: {
      name: 'Kijani Bora Restaurant',
      email: 'info@kijanibora.co.tz',
      phone: '+255712345678',
      businessName: 'Kijani Bora Restaurant',
      businessCategory: 'restaurant',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      password: hashPassword('Customer@2025'),
    },
  })

  const customer2 = await db.user.create({
    data: {
      name: 'TechHub Solutions',
      email: 'contact@techhubtz.com',
      phone: '+255723456789',
      businessName: 'TechHub Solutions',
      businessCategory: 'technology',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      password: hashPassword('Customer@2025'),
    },
  })

  // ─── Create Pricing Tiers ───
  const tier1_10 = await db.pricingTier.create({
    data: { name: 'Starter', minUsers: 1, maxUsers: 10, price1Month: 15000, price3Month: 14000, price6Month: 13000, price12Month: 12000, isActive: true, displayOrder: 1 },
  })
  const tier11_25 = await db.pricingTier.create({
    data: { name: 'Growth', minUsers: 11, maxUsers: 25, price1Month: 14000, price3Month: 13000, price6Month: 12000, price12Month: 11000, isActive: true, displayOrder: 2 },
  })
  const tier25_50 = await db.pricingTier.create({
    data: { name: 'Business', minUsers: 26, maxUsers: 50, price1Month: 13000, price3Month: 12000, price6Month: 11000, price12Month: 10000, isActive: true, displayOrder: 3 },
  })
  const tier50plus = await db.pricingTier.create({
    data: { name: 'Enterprise', minUsers: 51, maxUsers: 999, price1Month: 12000, price3Month: 11000, price6Month: 10000, price12Month: 9000, isActive: true, displayOrder: 4 },
  })

  // ─── Create Pricing Settings ───
  await db.pricingSettings.createMany({
    data: [
      { key: 'audio_recording_price', value: '15000', label: 'Audio Recording Price (TZS)' },
      { key: 'starter_package_basic', value: '50000', label: 'Starter Basic Package (TZS)' },
      { key: 'starter_package_standard', value: '120000', label: 'Starter Standard Package (TZS)' },
      { key: 'starter_package_premium', value: '250000', label: 'Starter Premium Package (TZS)' },
    ],
  })

  // ─── Create Legacy Packages ───
  const bronzePkg = await db.package.create({
    data: { name: 'Bronze', description: 'Perfect for small businesses getting started with ringback tone advertising.', price: 10000, currency: 'TZS', durationMonths: 1, features: JSON.stringify(PACKAGE_FEATURES.Bronze), maxAdDuration: 15, isActive: true, displayOrder: 1 },
  })
  const silverPkg = await db.package.create({
    data: { name: 'Silver', description: 'Great for growing businesses that want more from their ringback tone marketing.', price: 25000, currency: 'TZS', durationMonths: 3, features: JSON.stringify(PACKAGE_FEATURES.Silver), maxAdDuration: 30, isActive: true, displayOrder: 2 },
  })
  const goldPkg = await db.package.create({
    data: { name: 'Gold', description: 'Ideal for established businesses seeking maximum brand exposure.', price: 50000, currency: 'TZS', durationMonths: 6, features: JSON.stringify(PACKAGE_FEATURES.Gold), maxAdDuration: 45, isActive: true, displayOrder: 3 },
  })
  const platinumPkg = await db.package.create({
    data: { name: 'Platinum', description: 'The ultimate package for businesses that demand the best ringback tone experience.', price: 100000, currency: 'TZS', durationMonths: 12, features: JSON.stringify(PACKAGE_FEATURES.Platinum), maxAdDuration: 60, isActive: true, displayOrder: 4 },
  })

  // ─── Create Service Requests ───
  const sr1 = await db.serviceRequest.create({
    data: {
      userId: customer1.id, businessName: 'Kijani Bora Restaurant', businessCategory: 'restaurant',
      adType: 'PROMO', targetAudience: 'All customers aged 18-60',
      adScript: 'Karibu Kijani Bora! Where fresh meets flavour. Come enjoy our special nyama choma this weekend at an unbeatable price. Visit us at city centre, opposite the clock tower. Kijani Bora - Chakula kitamu kila wakati!',
      preferredLanguage: 'swahili', specialInstructions: 'Make it energetic and welcoming. Use a friendly voice.', status: 'PENDING',
    },
  })
  const sr2 = await db.serviceRequest.create({
    data: {
      userId: customer2.id, businessName: 'TechHub Solutions', businessCategory: 'technology',
      adType: 'BRANDING', targetAudience: 'Business professionals and tech enthusiasts',
      adScript: 'You are calling TechHub Solutions - your trusted technology partner in Dar es Salaam. We provide cutting-edge IT solutions, laptop repairs, and networking services. Visit us at Samora Avenue or call us today.',
      preferredLanguage: 'english', specialInstructions: 'Professional tone, not too fast.', status: 'APPROVED',
    },
  })

  // ─── Create Subscription ───
  const sub1 = await db.subscription.create({
    data: {
      userId: customer2.id, packageId: silverPkg.id, requestId: sr2.id,
      startDate: new Date('2025-02-15'), endDate: new Date('2025-05-15'),
      status: 'ACTIVE', amount: silverPkg.price, currency: 'TZS', paymentStatus: 'PAID',
      vodacomReference: 'VOD-RBT-2025-00456', vodacomStatus: 'ACTIVE',
      vodacomSubmittedAt: new Date('2025-02-10'), vodacomActivatedAt: new Date('2025-02-15'),
      phoneNumber: '+255723456789', autoRenew: false,
    },
  })

  // ─── Create Payment ───
  await db.payment.create({
    data: {
      subscriptionId: sub1.id, amount: silverPkg.price, currency: 'TZS',
      method: 'PESAPAL', status: 'COMPLETED', reference: 'PESAPAL-PR8N2K5J1',
      paidAt: new Date('2025-02-12'), verifiedBy: admin.id,
      notes: 'Full payment for Silver package - 3 months',
    },
  })

  // ─── Create Activity Logs ───
  await db.activityLog.createMany({
    data: [
      { userId: superAdmin.id, action: 'LOGIN', entityType: 'USER', entityId: superAdmin.id, details: JSON.stringify({ message: 'System initialized' }) },
      { userId: customer1.id, action: 'CREATED', entityType: 'SERVICE_REQUEST', entityId: sr1.id, details: JSON.stringify({ adType: 'PROMO', businessName: 'Kijani Bora Restaurant' }) },
      { userId: customer2.id, action: 'CREATED', entityType: 'SERVICE_REQUEST', entityId: sr2.id, details: JSON.stringify({ adType: 'BRANDING', businessName: 'TechHub Solutions' }) },
      { userId: admin.id, action: 'STATUS_CHANGE', entityType: 'SERVICE_REQUEST', entityId: sr2.id, details: JSON.stringify({ from: 'PENDING', to: 'APPROVED' }) },
      { userId: admin.id, action: 'LOGIN', entityType: 'USER', entityId: admin.id, details: JSON.stringify({ message: 'Admin logged in', ipAddress: '192.168.1.100' }) },
      { userId: customer1.id, action: 'LOGIN', entityType: 'USER', entityId: customer1.id, details: JSON.stringify({ message: 'User logged in', ipAddress: '196.43.200.50' }) },
      { userId: admin.id, action: 'UPDATED', entityType: 'PRICING_SETTINGS', entityId: tier1_10.id, details: JSON.stringify({ field: 'price1Month', oldValue: 16000, newValue: 15000 }) },
      { userId: superAdmin.id, action: 'CREATED', entityType: 'USER', entityId: admin.id, details: JSON.stringify({ role: 'ADMIN', name: admin.name }) },
    ],
  })

  // ─── Create Notifications ───
  await db.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        title: 'Welcome to TunePoa',
        message: 'Your super admin account has been set up successfully. You have full access to all platform features.',
        type: 'SUCCESS',
        isRead: true,
      },
      {
        userId: admin.id,
        title: 'Welcome to TunePoa',
        message: 'Your admin account is ready. You can manage requests, subscriptions, and users from the admin dashboard.',
        type: 'SUCCESS',
        isRead: true,
      },
      {
        userId: customer1.id,
        title: 'Welcome to TunePoa!',
        message: 'Karibu! Your account has been created. Start by browsing our packages or submitting your first ringback tone request.',
        type: 'INFO',
        isRead: false,
      },
      {
        userId: customer1.id,
        title: 'Request Submitted',
        message: 'Your ringback tone request for Kijani Bora Restaurant has been submitted and is pending review.',
        type: 'INFO',
        actionUrl: '/my-requests',
        isRead: false,
      },
      {
        userId: customer2.id,
        title: 'Welcome to TunePoa!',
        message: 'Your business account is ready. Explore our packages or submit a ringback tone request to get started.',
        type: 'INFO',
        isRead: true,
      },
      {
        userId: customer2.id,
        title: 'Request Approved',
        message: 'Great news! Your ringback tone request for TechHub Solutions has been approved. Your subscription is now active.',
        type: 'SUCCESS',
        actionUrl: '/my-requests',
        isRead: true,
      },
      {
        userId: customer2.id,
        title: 'Payment Confirmed',
        message: 'Your payment of TZS 25,000 for the Silver package has been confirmed via Pesapal.',
        type: 'SUCCESS',
        actionUrl: '/subscriptions',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'New Request Pending',
        message: 'A new service request from Kijani Bora Restaurant is awaiting your review.',
        type: 'WARNING',
        actionUrl: '/admin-requests',
        isRead: false,
      },
    ],
  })

  // ─── Create Email Templates ───
  await db.emailTemplate.createMany({
    data: [
      {
        key: 'welcome',
        subject: 'Welcome to TunePoa — Your Ringback Tone Platform',
        body: `<html><body style="font-family: Arial, sans-serif; background: #0a1628; color: #e2e8f0; padding: 40px;"><div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;"><h1 style="color: #14b8a6;">Karibu, {{name}}!</h1><p>Welcome to TunePoa — Tanzania\'s premier ringback tone advertising platform.</p><p>Your account is ready to go. Here\'s what you can do:</p><ul><li>Browse our packages</li><li>Submit a ringback tone request</li><li>Track your subscriptions</li></ul><p style="margin-top: 24px;">If you have any questions, reply to this email or contact support.</p><p style="color: #64748b; margin-top: 32px;">— The TunePoa Team</p></div></body></html>`,
        description: 'Welcome email sent to new users after registration',
        isActive: true,
      },
      {
        key: 'payment_confirmation',
        subject: 'Payment Confirmed — Invoice #{{invoiceNumber}}',
        body: `<html><body style="font-family: Arial, sans-serif; background: #0a1628; color: #e2e8f0; padding: 40px;"><div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;"><h1 style="color: #14b8a6;">Payment Confirmed!</h1><p>Hi {{name}},</p><p>Your payment has been confirmed successfully.</p><table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0;">Amount</td><td style="text-align: right; padding: 8px 0;">{{currency}} {{amount}}</td></tr><tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0;">Package</td><td style="text-align: right; padding: 8px 0;">{{packageName}}</td></tr><tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0;">Reference</td><td style="text-align: right; padding: 8px 0;">{{reference}}</td></tr><tr><td style="padding: 8px 0; font-weight: bold;">Duration</td><td style="text-align: right; padding: 8px 0; font-weight: bold;">{{duration}}</td></tr></table><p>Thank you for choosing TunePoa!</p><p style="color: #64748b; margin-top: 32px;">— The TunePoa Team</p></div></body></html>`,
        description: 'Payment confirmation email after successful payment',
        isActive: true,
      },
      {
        key: 'subscription_expiry',
        subject: 'Your TunePoa Subscription Expires Soon',
        body: `<html><body style="font-family: Arial, sans-serif; background: #0a1628; color: #e2e8f0; padding: 40px;"><div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;"><h1 style="color: #f59e0b;">Subscription Expiring Soon</h1><p>Hi {{name}},</p><p>Your <strong>{{packageName}}</strong> subscription will expire on <strong>{{expiryDate}}</strong>.</p><p>To avoid any interruption in your ringback tone service, please renew your subscription before it expires.</p><p style="text-align: center; margin: 24px 0;"><a href="{{renewalUrl}}" style="background: #14b8a6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Renew Now</a></p><p>Need help? Contact our support team anytime.</p><p style="color: #64748b; margin-top: 32px;">— The TunePoa Team</p></div></body></html>`,
        description: 'Subscription expiry reminder sent before expiration',
        isActive: true,
      },
      {
        key: 'request_approved',
        subject: 'Your Ringback Tone Request Has Been Approved! 🎉',
        body: `<html><body style="font-family: Arial, sans-serif; background: #0a1628; color: #e2e8f0; padding: 40px;"><div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;"><h1 style="color: #10b981;">Request Approved!</h1><p>Hi {{name}},</p><p>Great news! Your ringback tone request for <strong>{{businessName}}</strong> has been approved.</p><p>Our production team will now begin creating your custom ringback tone. You\'ll receive another notification once it\'s ready.</p><p style="background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.2); border-radius: 8px; padding: 16px; margin: 16px 0;">Next steps: Complete your payment to activate the subscription and get your ringback tone live.</p><p>Thank you for choosing TunePoa!</p><p style="color: #64748b; margin-top: 32px;">— The TunePoa Team</p></div></body></html>`,
        description: 'Email sent when a service request is approved',
        isActive: true,
      },
      {
        key: 'request_rejected',
        subject: 'Update on Your Ringback Tone Request',
        body: `<html><body style="font-family: Arial, sans-serif; background: #0a1628; color: #e2e8f0; padding: 40px;"><div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;"><h1 style="color: #ef4444;">Request Update</h1><p>Hi {{name}},</p><p>After careful review, we were unable to approve your ringback tone request for <strong>{{businessName}}</strong> at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p style="background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.2); border-radius: 8px; padding: 16px; margin: 16px 0;">Don\'t worry — you can update your request and resubmit it for review. We\'re here to help you get the perfect ringback tone.</p><p>If you have questions about the feedback, please contact our support team.</p><p style="color: #64748b; margin-top: 32px;">— The TunePoa Team</p></div></body></html>`,
        description: 'Email sent when a service request is rejected with feedback',
        isActive: true,
      },
    ],
  })

  // ─── Generate tokens ───
  const tokens = {
    superAdmin: createToken({ id: superAdmin.id, email: superAdmin.email, role: superAdmin.role, name: superAdmin.name }),
    admin: createToken({ id: admin.id, email: admin.email, role: admin.role, name: admin.name }),
    businessOwner: createToken({ id: customer2.id, email: customer2.email, role: customer2.role, name: customer2.name }),
  }

  return success({
    message: 'Database seeded successfully! Platform is ready for production use.',
    data: {
      users: {
        superAdmin: { email: superAdmin.email, role: superAdmin.role },
        admin: { email: admin.email, role: admin.role },
        customers: [
          { email: customer1.email, role: customer1.role, status: customer1.status },
          { email: customer2.email, role: customer2.role, status: customer2.status },
        ],
      },
      packages: [bronzePkg.name, silverPkg.name, goldPkg.name, platinumPkg.name],
      serviceRequests: 2,
      subscriptions: 1,
      payments: 1,
      notifications: 8,
      activityLogs: 8,
      emailTemplates: ['welcome', 'payment_confirmation', 'subscription_expiry', 'request_approved', 'request_rejected'],
      pricingTiers: [tier1_10, tier11_25, tier25_50, tier50plus].map(t => t.name),
      tokens,
    },
  })
}

// POST /api/seed — requires SUPER_ADMIN auth if database is already fully seeded
export async function POST(request: NextRequest) {
  try {
    const userCount = await db.user.count()
    const tierCount = await db.pricingTier.count()

    // Allow unauthenticated seed if data is incomplete (e.g. users exist but no tiers)
    if (userCount > 0 && tierCount > 0) {
      const auth = await authenticate(request)
      if (!auth.authenticated || !auth.user || auth.user.role !== 'SUPER_ADMIN') {
        return forbidden('Only Super Admin can re-seed the database')
      }
    }

    return await runSeed()
  } catch (err: any) {
    console.error('[SEED ERROR]', err?.message || err)
    return error(`Failed to seed database: ${err?.message || 'Unknown error'}`, 500)
  }
}

// GET /api/seed — allows unauthenticated re-seed when data is incomplete
// (e.g., users exist but pricing tiers are missing after partial init)
export async function GET() {
  try {
    const tierCount = await db.pricingTier.count()
    const userCount = await db.user.count()

    if (tierCount > 0 && userCount > 0) {
      return success({
        message: 'Database already seeded',
        data: { pricingTiers: tierCount, users: userCount, needsSeed: false },
      })
    }

    // Data is incomplete — run full seed
    return await runSeed()
  } catch (err: any) {
    console.error('[SEED ERROR]', err?.message || err)
    return error(`Failed to seed database: ${err?.message || 'Unknown error'}`, 500)
  }
}
