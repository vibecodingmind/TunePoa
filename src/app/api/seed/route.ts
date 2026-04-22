import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin, hashPassword, createToken } from '@/lib/auth'
import { PACKAGE_FEATURES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    // Auth required - admin only (or allow unauthenticated for initial setup)
    const auth = await authenticate(request)
    if (auth.authenticated && auth.user && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    // Clear existing data in correct order (respecting foreign keys)
    await db.payment.deleteMany({})
    await db.subscription.deleteMany({})
    await db.serviceRequest.deleteMany({})
    await db.activityLog.deleteMany({})
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
        name: 'TunePoa Operations',
        email: 'ops@tunepoa.co.tz',
        phone: '+255700000002',
        businessName: 'TunePoa Ltd',
        businessCategory: 'technology',
        role: 'ADMIN',
        status: 'ACTIVE',
        password: hashPassword('TunePoa@Ops2025!'),
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
      data: {
        name: 'Starter',
        minUsers: 1,
        maxUsers: 10,
        price1Month: 15000,
        price3Month: 14000,
        price6Month: 13000,
        price12Month: 12000,
        isActive: true,
        displayOrder: 1,
      },
    })

    const tier11_25 = await db.pricingTier.create({
      data: {
        name: 'Growth',
        minUsers: 11,
        maxUsers: 25,
        price1Month: 14000,
        price3Month: 13000,
        price6Month: 12000,
        price12Month: 11000,
        isActive: true,
        displayOrder: 2,
      },
    })

    const tier25_50 = await db.pricingTier.create({
      data: {
        name: 'Business',
        minUsers: 26,
        maxUsers: 50,
        price1Month: 13000,
        price3Month: 12000,
        price6Month: 11000,
        price12Month: 10000,
        isActive: true,
        displayOrder: 3,
      },
    })

    const tier50plus = await db.pricingTier.create({
      data: {
        name: 'Enterprise',
        minUsers: 51,
        maxUsers: 999,
        price1Month: 12000,
        price3Month: 11000,
        price6Month: 10000,
        price12Month: 9000,
        isActive: true,
        displayOrder: 4,
      },
    })

    // ─── Create Pricing Settings (add-on prices) ───
    await db.pricingSettings.createMany({
      data: [
        {
          key: 'audio_recording_price',
          value: '15000',
          label: 'Audio Recording Price (TZS)',
        },
        {
          key: 'starter_package_basic',
          value: '50000',
          label: 'Starter Basic Package (TZS) - 1 number, 1 month, includes audio recording',
        },
        {
          key: 'starter_package_standard',
          value: '120000',
          label: 'Starter Standard Package (TZS) - 5 numbers, 3 months, includes audio recording',
        },
        {
          key: 'starter_package_premium',
          value: '250000',
          label: 'Starter Premium Package (TZS) - 10 numbers, 6 months, includes audio recording, dedicated support',
        },
      ],
    })

    // ─── Create Legacy Packages ───
    const bronzePkg = await db.package.create({
      data: {
        name: 'Bronze',
        description: 'Perfect for small businesses getting started with ringback tone advertising.',
        price: 10000,
        currency: 'TZS',
        durationMonths: 1,
        features: JSON.stringify(PACKAGE_FEATURES.Bronze),
        maxAdDuration: 15,
        isActive: true,
        displayOrder: 1,
      },
    })

    const silverPkg = await db.package.create({
      data: {
        name: 'Silver',
        description: 'Great for growing businesses that want more from their ringback tone marketing.',
        price: 25000,
        currency: 'TZS',
        durationMonths: 3,
        features: JSON.stringify(PACKAGE_FEATURES.Silver),
        maxAdDuration: 30,
        isActive: true,
        displayOrder: 2,
      },
    })

    const goldPkg = await db.package.create({
      data: {
        name: 'Gold',
        description: 'Ideal for established businesses seeking maximum brand exposure.',
        price: 50000,
        currency: 'TZS',
        durationMonths: 6,
        features: JSON.stringify(PACKAGE_FEATURES.Gold),
        maxAdDuration: 45,
        isActive: true,
        displayOrder: 3,
      },
    })

    const platinumPkg = await db.package.create({
      data: {
        name: 'Platinum',
        description: 'The ultimate package for businesses that demand the best ringback tone experience.',
        price: 100000,
        currency: 'TZS',
        durationMonths: 12,
        features: JSON.stringify(PACKAGE_FEATURES.Platinum),
        maxAdDuration: 60,
        isActive: true,
        displayOrder: 4,
      },
    })

    // ─── Create Service Requests ───
    const sr1 = await db.serviceRequest.create({
      data: {
        userId: customer1.id,
        businessName: 'Kijani Bora Restaurant',
        businessCategory: 'restaurant',
        adType: 'PROMO',
        targetAudience: 'All customers aged 18-60',
        adScript: 'Karibu Kijani Bora! Where fresh meets flavour. Come enjoy our special nyama choma this weekend at an unbeatable price. Visit us at city centre, opposite the clock tower. Kijani Bora - Chakula kitamu kila wakati!',
        preferredLanguage: 'swahili',
        specialInstructions: 'Make it energetic and welcoming. Use a friendly voice.',
        status: 'PENDING',
      },
    })

    const sr2 = await db.serviceRequest.create({
      data: {
        userId: customer2.id,
        businessName: 'TechHub Solutions',
        businessCategory: 'technology',
        adType: 'BRANDING',
        targetAudience: 'Business professionals and tech enthusiasts',
        adScript: 'You are calling TechHub Solutions - your trusted technology partner in Dar es Salaam. We provide cutting-edge IT solutions, laptop repairs, and networking services. Visit us at Samora Avenue or call us today.',
        preferredLanguage: 'english',
        specialInstructions: 'Professional tone, not too fast.',
        status: 'APPROVED',
      },
    })

    // ─── Create Subscription (only for approved request) ───
    const sub1 = await db.subscription.create({
      data: {
        userId: customer2.id,
        packageId: silverPkg.id,
        requestId: sr2.id,
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-05-15'),
        status: 'ACTIVE',
        amount: silverPkg.price,
        currency: 'TZS',
        paymentStatus: 'PAID',
        vodacomReference: 'VOD-RBT-2025-00456',
        vodacomStatus: 'ACTIVE',
        vodacomSubmittedAt: new Date('2025-02-10'),
        vodacomActivatedAt: new Date('2025-02-15'),
        phoneNumber: '+255723456789',
        autoRenew: false,
      },
    })

    // ─── Create Payment ───
    await db.payment.create({
      data: {
        subscriptionId: sub1.id,
        amount: silverPkg.price,
        currency: 'TZS',
        method: 'PESAPAL',
        status: 'COMPLETED',
        reference: 'PESAPAL-PR8N2K5J1',
        paidAt: new Date('2025-02-12'),
        verifiedBy: admin.id,
        notes: 'Full payment for Silver package - 3 months',
      },
    })

    // ─── Create Activity Logs ───
    await db.activityLog.createMany({
      data: [
        {
          userId: superAdmin.id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: superAdmin.id,
          details: JSON.stringify({ message: 'System initialized' }),
        },
        {
          userId: customer1.id,
          action: 'CREATED',
          entityType: 'SERVICE_REQUEST',
          entityId: sr1.id,
          details: JSON.stringify({ adType: 'PROMO', businessName: 'Kijani Bora Restaurant' }),
        },
        {
          userId: customer2.id,
          action: 'CREATED',
          entityType: 'SERVICE_REQUEST',
          entityId: sr2.id,
          details: JSON.stringify({ adType: 'BRANDING', businessName: 'TechHub Solutions' }),
        },
        {
          userId: admin.id,
          action: 'STATUS_CHANGE',
          entityType: 'SERVICE_REQUEST',
          entityId: sr2.id,
          details: JSON.stringify({ from: 'PENDING', to: 'APPROVED' }),
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
          superAdmin: { email: superAdmin.email, password: 'TunePoa@Admin2025!', role: superAdmin.role },
          admin: { email: admin.email, password: 'TunePoa@Ops2025!', role: admin.role },
          customers: [
            { email: customer1.email, password: 'Customer@2025', role: customer1.role, status: customer1.status },
            { email: customer2.email, password: 'Customer@2025', role: customer2.role, status: customer2.status },
          ],
        },
        packages: [bronzePkg.name, silverPkg.name, goldPkg.name, platinumPkg.name],
        serviceRequests: 2,
        subscriptions: 1,
        payments: 1,
        pricingTiers: [tier1_10, tier11_25, tier25_50, tier50plus].map(t => t.name),
        tokens,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Seed error:', err)
    return error(`Failed to seed database: ${message}`, 500)
  }
}
