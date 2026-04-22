export const VALID_STATUSES = {
  SERVICE_REQUEST: ['PENDING', 'APPROVED', 'REJECTED'],
  SUBSCRIPTION: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
  PAYMENT: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], // method: PESAPAL, STRIPE, PAYPAL, BANK, CASH
  PAYMENT_STATUS: ['UNPAID', 'PAID', 'OVERDUE', 'REFUNDED'],
} as const

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  SUSPENDED: 'Suspended',
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  REFUNDED: 'Refunded',
  DRAFT: 'Draft',
  SENT: 'Sent',
  PROCESSING: 'Processing',
  INACTIVE: 'Inactive',
  INFO: 'Info',
  WARNING: 'Warning',
  ERROR: 'Error',
  SUCCESS: 'Success',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/25',
  ACTIVE: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  EXPIRED: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
  SUSPENDED: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  UNPAID: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  PAID: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  OVERDUE: 'bg-red-500/15 text-red-400 border-red-500/25',
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  SENT: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  PROCESSING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  INACTIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  INFO: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  WARNING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  ERROR: 'bg-red-500/15 text-red-400 border-red-500/25',
  SUCCESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

// Starter subscription packages with fixed pricing
export const STARTER_PACKAGES = [
  {
    key: 'starter_package_basic',
    name: 'Starter Basic',
    price: 50000,
    description: 'Perfect for small businesses just getting started with ringback tone advertising.',
    features: ['1 phone number', '1 month subscription', 'Audio recording included', '15-second ad duration', 'Email support', 'Basic analytics'],
    icon: 'Sparkles' as const,
    color: 'emerald' as const,
    popular: false,
    userCount: 1,
    durationMonths: 1,
    includesAudio: true,
  },
  {
    key: 'starter_package_standard',
    name: 'Starter Standard',
    price: 120000,
    description: 'Great for growing businesses wanting to reach more customers through ringback tones.',
    features: ['5 phone numbers', '3 months subscription', 'Audio recording included', '30-second ad duration', 'Priority support', 'Weekly analytics', 'Multi-network support'],
    icon: 'Zap' as const,
    color: 'blue' as const,
    popular: true,
    userCount: 5,
    durationMonths: 3,
    includesAudio: true,
  },
  {
    key: 'starter_package_premium',
    name: 'Starter Premium',
    price: 250000,
    description: 'Best value for businesses serious about maximizing brand awareness and reach.',
    features: ['10 phone numbers', '6 months subscription', 'Audio recording included', '45-second ad duration', 'Dedicated support manager', 'Daily analytics', 'All networks supported', 'A/B testing', 'Priority activation'],
    icon: 'Crown' as const,
    color: 'violet' as const,
    popular: false,
    userCount: 10,
    durationMonths: 6,
    includesAudio: true,
  },
] as const

export const PACKAGE_FEATURES: Record<string, string[]> = {
  Bronze: ['15-second ad duration', 'Single phone number', 'Basic ad script', 'WhatsApp verification', 'Email support', 'Monthly report'],
  Silver: ['30-second ad duration', 'Up to 2 phone numbers', 'Custom ad script', 'Professional voice-over', 'WhatsApp verification', 'Priority support', 'Monthly report'],
  Gold: ['45-second ad duration', 'Up to 5 phone numbers', 'Premium ad script', 'Professional voice-over', 'Sound effects & music', 'WhatsApp verification', 'Dedicated support', 'Weekly reports'],
  Platinum: ['60-second ad duration', 'Up to 10 phone numbers', 'Premium ad script', 'Celebrity voice-over option', 'Full sound production', 'WhatsApp verification', '24/7 dedicated support', 'Daily reports', 'A/B testing'],
}

// Valid status transitions for service requests
// Simplified flow: PENDING → APPROVED/REJECTED, REJECTED → PENDING (re-submit)
export const SR_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: ['PENDING'], // allow re-submission
}

// Valid status transitions for subscriptions
export const SUB_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['SUSPENDED', 'EXPIRED', 'CANCELLED'],
  EXPIRED: ['ACTIVE'], // allow renewal
  CANCELLED: [],
  SUSPENDED: ['ACTIVE', 'CANCELLED'],
}

// Admin roles
export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const
