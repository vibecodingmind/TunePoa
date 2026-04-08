export const VALID_STATUSES = {
  SERVICE_REQUEST: ['PENDING', 'IN_PROGRESS', 'RECORDING', 'AWAITING_VERIFICATION', 'APPROVED', 'REJECTED', 'COMPLETED'],
  SUBSCRIPTION: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
  PAYMENT: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
  MNO_STATUS: ['NOT_SUBMITTED', 'PENDING_MNO', 'ACTIVE_MNO', 'FAILED_MNO', 'REMOVED_MNO'],
  RECORDING: ['DRAFT', 'FINAL', 'APPROVED', 'REJECTED'],
  PAYMENT_STATUS: ['UNPAID', 'PAID', 'OVERDUE', 'REFUNDED'],
} as const

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RECORDING: 'Recording',
  AWAITING_VERIFICATION: 'Awaiting Verification',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  SUSPENDED: 'Suspended',
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  REFUNDED: 'Refunded',
  NOT_SUBMITTED: 'Not Submitted',
  PENDING_MNO: 'Pending at MNO',
  ACTIVE_MNO: 'Active on MNO',
  FAILED_MNO: 'Failed at MNO',
  REMOVED_MNO: 'Removed from MNO',
  DRAFT: 'Draft',
  FINAL: 'Final',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RECORDING: 'bg-purple-100 text-purple-800 border-purple-200',
  AWAITING_VERIFICATION: 'bg-orange-100 text-orange-800 border-orange-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  UNPAID: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  NOT_SUBMITTED: 'bg-gray-100 text-gray-800 border-gray-200',
  PENDING_MNO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE_MNO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FAILED_MNO: 'bg-red-100 text-red-800 border-red-200',
  REMOVED_MNO: 'bg-gray-100 text-gray-800 border-gray-200',
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  FINAL: 'bg-blue-100 text-blue-800 border-blue-200',
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
export const SR_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RECORDING', 'REJECTED'],
  RECORDING: ['AWAITING_VERIFICATION', 'REJECTED'],
  AWAITING_VERIFICATION: ['APPROVED', 'REJECTED'],
  APPROVED: ['COMPLETED'],
  REJECTED: ['PENDING'], // allow re-submission
  COMPLETED: [],
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
export const MANAGER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STUDIO_MANAGER'] as const
