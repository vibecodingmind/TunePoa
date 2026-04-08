import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Check if already seeded
    const userCount = await db.user.count()
    if (userCount > 0) {
      return NextResponse.json({ message: 'Database already seeded. Use a fresh database to reseed.' }, { status: 400 })
    }

    // Create users
    const superAdmin = await db.user.create({
      data: {
        name: 'TunePoa Super Admin',
        email: 'admin@tunepoa.co.tz',
        phone: '+255700000001',
        businessName: 'TunePoa Ltd',
        businessCategory: 'technology',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        password: 'admin123',
      },
    })

    const admin = await db.user.create({
      data: {
        name: 'TunePoa Admin',
        email: 'admin2@tunepoa.co.tz',
        phone: '+255700000002',
        businessName: 'TunePoa Ltd',
        businessCategory: 'technology',
        role: 'ADMIN',
        status: 'ACTIVE',
        password: 'admin123',
      },
    })

    const studioManager = await db.user.create({
      data: {
        name: 'Juma Msonge',
        email: 'studio@tunepoa.co.tz',
        phone: '+255700000003',
        businessName: 'TunePoa Studio',
        businessCategory: 'media',
        role: 'STUDIO_MANAGER',
        status: 'ACTIVE',
        password: 'studio123',
      },
    })

    // Business owners
    const businessOwners = await Promise.all([
      db.user.create({
        data: {
          name: 'Fatima Hassan',
          email: 'fatima@kijanibora.tz',
          phone: '+255712345678',
          businessName: 'Kijani Bora Restaurant',
          businessCategory: 'restaurant',
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
          password: 'password123',
        },
      }),
      db.user.create({
        data: {
          name: 'Peter Kimaro',
          email: 'peter@techsolutions.tz',
          phone: '+255723456789',
          businessName: 'Tech Solutions Hub',
          businessCategory: 'technology',
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
          password: 'password123',
        },
      }),
      db.user.create({
        data: {
          name: 'Asha Mwenda',
          email: 'asha@fashionspot.tz',
          phone: '+255734567890',
          businessName: 'Fashion Spot Tanzania',
          businessCategory: 'fashion',
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
          password: 'password123',
        },
      }),
      db.user.create({
        data: {
          name: 'Joseph Mwangi',
          email: 'joseph@pembeje.tz',
          phone: '+255745678901',
          businessName: 'Pembeje Electronics',
          businessCategory: 'electronics',
          role: 'BUSINESS_OWNER',
          status: 'ACTIVE',
          password: 'password123',
        },
      }),
      db.user.create({
        data: {
          name: 'Grace Mwakyusa',
          email: 'grace@salonbeauty.tz',
          phone: '+255756789012',
          businessName: 'Salon Beauty Pro',
          businessCategory: 'beauty',
          role: 'BUSINESS_OWNER',
          status: 'SUSPENDED',
          password: 'password123',
        },
      }),
    ])

    // Create packages
    const bronzePkg = await db.package.create({
      data: {
        name: 'Bronze',
        description: 'Perfect for small businesses getting started with ringback tone advertising.',
        price: 10000,
        currency: 'TZS',
        durationMonths: 1,
        features: JSON.stringify(['One ringback tone ad', 'Basic ad script writing', '15-second max duration', 'Email support', 'Basic analytics']),
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
        features: JSON.stringify(['Two ringback tone ads', 'Professional script writing', '25-second max duration', 'Priority email & phone support', 'Detailed analytics', 'WhatsApp verification']),
        maxAdDuration: 25,
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
        features: JSON.stringify(['Three ringback tone ads', 'Premium script writing', '30-second max duration', '24/7 priority support', 'Advanced analytics', 'WhatsApp verification', 'Multi-language support', 'A/B testing']),
        maxAdDuration: 30,
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
        features: JSON.stringify(['Unlimited ringback tone ads', 'Premium script writing & voice actors', '45-second max duration', 'Dedicated account manager', 'Enterprise analytics dashboard', 'WhatsApp & SMS verification', 'Multi-language support', 'A/B testing', 'Priority studio time', 'Custom branding options']),
        maxAdDuration: 45,
        isActive: true,
        displayOrder: 4,
      },
    })

    // Create MNO providers
    const vodacom = await db.mnoProvider.create({
      data: {
        name: 'Vodacom Tanzania',
        country: 'Tanzania',
        code: 'VODACOM',
        apiEndpoint: 'https://api.vodacom.co.tz/rbt',
        isActive: true,
        notes: 'Largest MNO in Tanzania with 40%+ market share',
      },
    })

    const airtel = await db.mnoProvider.create({
      data: {
        name: 'Airtel Tanzania',
        country: 'Tanzania',
        code: 'AIRTEL',
        apiEndpoint: 'https://api.airtel.co.tz/rbt',
        isActive: true,
        notes: 'Second largest MNO with growing subscriber base',
      },
    })

    const tigo = await db.mnoProvider.create({
      data: {
        name: 'Tigo Tanzania',
        country: 'Tanzania',
        code: 'TIGO',
        apiEndpoint: 'https://api.tigo.co.tz/rbt',
        isActive: true,
        notes: 'Third largest MNO, popular among younger demographics',
      },
    })

    // Create service requests
    const sr1 = await db.serviceRequest.create({
      data: {
        userId: businessOwners[0].id,
        businessName: 'Kijani Bora Restaurant',
        businessCategory: 'restaurant',
        adType: 'PROMO',
        targetAudience: 'All customers aged 18-60',
        adScript: 'Karibu Kijani Bora! Where fresh meets flavour. Come enjoy our special nyama choma this weekend at an unbeatable price. Visit us at city centre, opposite the clock tower. Kijani Bora - Chakula kitamu kila wakati!',
        preferredLanguage: 'swahili',
        specialInstructions: 'Make it energetic and welcoming. Use a friendly voice.',
        status: 'COMPLETED',
        assignedTo: studioManager.id,
      },
    })

    const sr2 = await db.serviceRequest.create({
      data: {
        userId: businessOwners[1].id,
        businessName: 'Tech Solutions Hub',
        businessCategory: 'technology',
        adType: 'BRANDING',
        targetAudience: 'Business professionals and tech enthusiasts',
        adScript: 'You are calling Tech Solutions Hub - your trusted technology partner in Dar es Salaam. We provide cutting-edge IT solutions, laptop repairs, and networking services. Visit us at Samora Avenue or call us today.',
        preferredLanguage: 'english',
        specialInstructions: 'Professional tone, not too fast.',
        status: 'APPROVED',
        assignedTo: studioManager.id,
      },
    })

    const sr3 = await db.serviceRequest.create({
      data: {
        userId: businessOwners[2].id,
        businessName: 'Fashion Spot Tanzania',
        businessCategory: 'fashion',
        adType: 'OFFER',
        targetAudience: 'Young women aged 18-35',
        adScript: 'Pata discount ya 30% kwenye mavazi mapya ya Fashion Spot! Bidhaa za hali ya juu kwa bei nafuu. Tupo Kariakoo, Ghorofa ya 2. Fashion Spot - Urembo wako, mtindo wetu!',
        preferredLanguage: 'swahili',
        specialInstructions: 'Fashionable, upbeat tone with background music feel.',
        status: 'IN_PROGRESS',
        assignedTo: studioManager.id,
      },
    })

    const sr4 = await db.serviceRequest.create({
      data: {
        userId: businessOwners[3].id,
        businessName: 'Pembeje Electronics',
        businessCategory: 'electronics',
        adType: 'ANNOUNCEMENT',
        targetAudience: 'General public',
        adScript: 'Pembeje Electronics inatangaza ofa maalum ya simu na laptop mpya! Pata bei za kushangaza kwenye bidhaa za mkononi. Tunapatikana Kijitonyama, barabara ya Msimbazi.',
        preferredLanguage: 'both',
        specialInstructions: 'Both Swahili and English sections wanted.',
        status: 'PENDING',
      },
    })

    const sr5 = await db.serviceRequest.create({
      data: {
        userId: businessOwners[4].id,
        businessName: 'Salon Beauty Pro',
        businessCategory: 'beauty',
        adType: 'PROMO',
        targetAudience: 'Women aged 20-45',
        adScript: 'Salon Beauty Pro - mahali pazuri pa urembo wako! Tunafanya nywele, manikyua, na makeup kwa ubora. Tupo Kimara, karibu na stendi ya mabasi.',
        preferredLanguage: 'swahili',
        specialInstructions: 'Gentle and elegant voice.',
        status: 'REJECTED',
        rejectionReason: 'Ad script too long for the selected package. Please shorten to under 20 seconds.',
      },
    })

    // Create recordings for completed request
    const rec1 = await db.recording.create({
      data: {
        requestId: sr1.id,
        title: 'Kijani Bora - Weekend Nyama Choma Promo',
        fileName: 'kijani_bora_nyama_choma.mp3',
        filePath: '/uploads/kijani_bora_nyama_choma.mp3',
        fileSize: 524288,
        duration: 22,
        format: 'MP3',
        status: 'APPROVED',
        recordedBy: studioManager.id,
        notes: 'Recorded with energetic Swahili voice. Client approved.',
      },
    })

    const rec2 = await db.recording.create({
      data: {
        requestId: sr2.id,
        title: 'Tech Solutions Hub - Branding Ad',
        fileName: 'tech_solutions_branding.mp3',
        filePath: '/uploads/tech_solutions_branding.mp3',
        fileSize: 393216,
        duration: 18,
        format: 'MP3',
        status: 'APPROVED',
        recordedBy: studioManager.id,
        notes: 'Professional English voice over, client approved on first take.',
      },
    })

    const rec3 = await db.recording.create({
      data: {
        requestId: sr3.id,
        title: 'Fashion Spot - 30% Discount Offer',
        fileName: 'fashion_spot_discount.mp3',
        filePath: '/uploads/fashion_spot_discount.mp3',
        fileSize: 471859,
        duration: 20,
        format: 'MP3',
        status: 'DRAFT',
        recordedBy: studioManager.id,
        notes: 'First draft, needs background music mixing.',
      },
    })

    // Create subscriptions
    const sub1 = await db.subscription.create({
      data: {
        userId: businessOwners[0].id,
        packageId: goldPkg.id,
        requestId: sr1.id,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-07-01'),
        status: 'ACTIVE',
        amount: goldPkg.price,
        currency: 'TZS',
        paymentStatus: 'PAID',
        mnoProviderId: vodacom.id,
        mnoReference: 'VOD-RBT-2025-00123',
        mnoStatus: 'ACTIVE_MNO',
        mnoSubmittedAt: new Date('2024-12-28'),
        mnoActivatedAt: new Date('2025-01-01'),
        phoneNumber: '+255712345678',
        autoRenew: true,
      },
    })

    const sub2 = await db.subscription.create({
      data: {
        userId: businessOwners[1].id,
        packageId: silverPkg.id,
        requestId: sr2.id,
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-05-15'),
        status: 'ACTIVE',
        amount: silverPkg.price,
        currency: 'TZS',
        paymentStatus: 'PAID',
        mnoProviderId: airtel.id,
        mnoReference: 'AIR-RBT-2025-00456',
        mnoStatus: 'ACTIVE_MNO',
        mnoSubmittedAt: new Date('2025-02-10'),
        mnoActivatedAt: new Date('2025-02-15'),
        phoneNumber: '+255723456789',
        autoRenew: false,
      },
    })

    const sub3 = await db.subscription.create({
      data: {
        userId: businessOwners[2].id,
        packageId: bronzePkg.id,
        requestId: sr3.id,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'PENDING',
        amount: bronzePkg.price,
        currency: 'TZS',
        paymentStatus: 'UNPAID',
        mnoStatus: 'NOT_SUBMITTED',
        phoneNumber: '+255734567890',
        autoRenew: false,
      },
    })

    // Create payments
    await db.payment.create({
      data: {
        subscriptionId: sub1.id,
        amount: goldPkg.price,
        currency: 'TZS',
        method: 'M_PESA',
        status: 'COMPLETED',
        reference: 'MPESA-QR3K7L9M2',
        paidAt: new Date('2024-12-30'),
        verifiedBy: superAdmin.id,
        notes: 'Full payment for Gold package - 6 months',
      },
    })

    await db.payment.create({
      data: {
        subscriptionId: sub2.id,
        amount: silverPkg.price,
        currency: 'TZS',
        method: 'TIGO_PESA',
        status: 'COMPLETED',
        reference: 'TIGO-PR8N2K5J1',
        paidAt: new Date('2025-02-12'),
        verifiedBy: admin.id,
        notes: 'Full payment for Silver package - 3 months',
      },
    })

    await db.payment.create({
      data: {
        subscriptionId: sub2.id,
        amount: silverPkg.price,
        currency: 'TZS',
        method: 'M_PESA',
        status: 'PENDING',
        reference: 'MPESA-PENDING-001',
        notes: 'Renewal payment initiated but not confirmed',
      },
    })

    // Create activity logs
    await db.activityLog.createMany({
      data: [
        {
          userId: superAdmin.id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: superAdmin.id,
          details: JSON.stringify({ message: 'First admin login' }),
        },
        {
          userId: superAdmin.id,
          action: 'CREATED',
          entityType: 'PACKAGE',
          entityId: goldPkg.id,
          details: JSON.stringify({ name: 'Gold Package' }),
        },
        {
          userId: studioManager.id,
          action: 'STATUS_CHANGE',
          entityType: 'SERVICE_REQUEST',
          entityId: sr1.id,
          details: JSON.stringify({ from: 'RECORDING', to: 'AWAITING_VERIFICATION' }),
        },
        {
          userId: superAdmin.id,
          action: 'STATUS_CHANGE',
          entityType: 'SUBSCRIPTION',
          entityId: sub1.id,
          details: JSON.stringify({ mnoStatus: 'ACTIVE_MNO' }),
        },
        {
          userId: businessOwners[0].id,
          action: 'CREATED',
          entityType: 'SERVICE_REQUEST',
          entityId: sr1.id,
          details: JSON.stringify({ adType: 'PROMO' }),
        },
      ],
    })

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        users: { superAdmin: superAdmin.email, admin: admin.email, studioManager: studioManager.email },
        businessOwners: businessOwners.map(u => u.email),
        packages: [bronzePkg.name, silverPkg.name, goldPkg.name, platinumPkg.name],
        serviceRequests: 5,
        subscriptions: 3,
        payments: 3,
        mnoProviders: [vodacom.name, airtel.name, tigo.name],
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}
