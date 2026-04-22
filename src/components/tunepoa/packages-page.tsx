'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { PricingCalculator } from './pricing-calculator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  CheckCircle2,
  Star,
  Zap,
  Crown,
  Shield,
  Headphones,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
  XCircle,
  TrendingDown,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PricingTier {
  id: string
  name: string
  minUsers: number
  maxUsers: number
  price1Month: number
  price3Month: number
  price6Month: number
  price12Month: number
  isActive: boolean
  displayOrder: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTZS = (amount: number) =>
  new Intl.NumberFormat('en-TZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function getMonthlyRate(tier: PricingTier): number {
  // Use the 1-month price as the baseline monthly rate
  return tier.price1Month
}

function getSavings(tier: PricingTier): { months: number; savings: number }[] {
  const base = tier.price1Month
  return [
    { months: 3, savings: Math.round((1 - tier.price3Month / (base * 3)) * 100) },
    { months: 6, savings: Math.round((1 - tier.price6Month / (base * 6)) * 100) },
    { months: 12, savings: Math.round((1 - tier.price12Month / (base * 12)) * 100) },
  ]
}

const DURATION_CONFIG: { months: number; label: string; shortLabel: string }[] = [
  { months: 1, label: '1 Month', shortLabel: '1 Mo' },
  { months: 3, label: '3 Months', shortLabel: '3 Mo' },
  { months: 6, label: '6 Months', shortLabel: '6 Mo' },
  { months: 12, label: '12 Months', shortLabel: '12 Mo' },
]

function getPriceForDuration(tier: PricingTier, months: number): number {
  switch (months) {
    case 1: return tier.price1Month
    case 3: return tier.price3Month
    case 6: return tier.price6Month
    case 12: return tier.price12Month
    default: return tier.price1Month
  }
}

// Unique gradient + icon combos per tier index
const TIER_STYLES = [
  {
    gradient: 'from-tp-500 to-ts-400',
    shadow: 'shadow-tp-500/20',
    ring: 'ring-tp-500/30',
    bgLight: 'bg-tp-50',
    bgDark: 'dark:bg-tp-950/40',
    borderLight: 'border-tp-200',
    borderDark: 'dark:border-tp-800/50',
    icon: Crown,
    iconBg: 'bg-tp-500',
    label: 'Starter',
  },
  {
    gradient: 'from-amber-500 to-orange-400',
    shadow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/30',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/50',
    icon: Star,
    iconBg: 'bg-amber-500',
    label: 'Growth',
  },
  {
    gradient: 'from-violet-500 to-purple-400',
    shadow: 'shadow-violet-500/20',
    ring: 'ring-violet-500/30',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800/50',
    icon: Zap,
    iconBg: 'bg-violet-500',
    label: 'Pro',
  },
  {
    gradient: 'from-rose-500 to-pink-400',
    shadow: 'shadow-rose-500/20',
    ring: 'ring-rose-500/30',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-800/50',
    icon: Shield,
    iconBg: 'bg-rose-500',
    label: 'Enterprise',
  },
]

// Features per tier for visual richness
const TIER_FEATURES: string[][] = [
  ['Up to 10 users', 'Basic ringback tones', 'Email support', '1 month min. commitment'],
  ['Up to 25 users', 'Custom audio uploads', 'Priority support', 'Multi-duration plans'],
  ['Up to 50 users', 'Studio recording', 'Dedicated manager', 'Bulk discount pricing'],
  ['50+ users', 'White-label option', '24/7 phone support', 'Custom contracts'],
]

function getStyleForTier(index: number) {
  return TIER_STYLES[index % TIER_STYLES.length]
}

function getFeaturesForTier(index: number) {
  return TIER_FEATURES[index % TIER_FEATURES.length]
}

// Determine the "most popular" tier — pick the first active tier that isn't
// the smallest or largest, otherwise fall back to the first active tier.
function pickPopularTier(tiers: PricingTier[]): string | null {
  const active = tiers.filter((t) => t.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  if (active.length <= 1) return active[0]?.id ?? null
  // Prefer the middle tier
  const mid = Math.floor(active.length / 2)
  return active[mid].id
}

// ---------------------------------------------------------------------------
// TierCard — individual premium card
// ---------------------------------------------------------------------------

function TierCard({
  tier,
  index,
  isPopular,
  onSubscribe,
}: {
  tier: PricingTier
  index: number
  isPopular: boolean
  onSubscribe: (tier: PricingTier) => void
}) {
  const style = getStyleForTier(index)
  const features = getFeaturesForTier(index)
  const Icon = style.icon
  const userRange =
    tier.maxUsers >= 999 ? `${tier.minUsers}+` : `${tier.minUsers} – ${tier.maxUsers}`

  const activeTiers = [1, 3, 6, 12].map((m) => ({
    months: m,
    price: getPriceForDuration(tier, m),
  }))

  return (
    <Card
      className={`
        relative overflow-hidden rounded-2xl transition-all duration-500 ease-out
        hover:-translate-y-2 hover:shadow-2xl group
        ${isPopular ? `ring-2 ${style.ring} shadow-xl ${style.shadow}` : 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50'}
        ${!tier.isActive ? 'opacity-60 grayscale pointer-events-none' : ''}
        bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60
      `}
    >
      {/* Most Popular ribbon */}
      {isPopular && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg shadow-amber-500/30">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-10">
        {tier.isActive ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tp-50 dark:bg-tp-900/40 border border-tp-200 dark:border-tp-700/50">
            <div className="h-1.5 w-1.5 rounded-full bg-tp-500 animate-pulse" />
            <span className="text-[10px] font-bold text-tp-700 dark:text-tp-300 uppercase tracking-wider">
              Active
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <XCircle className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Inactive
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-0">
        {/* Gradient top accent */}
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />

        <div className="p-6 pt-5 space-y-5">
          {/* Icon + name */}
          <div className="flex items-start gap-3 pt-4">
            <div
              className={`h-12 w-12 rounded-xl ${style.iconBg} text-white flex items-center justify-center shadow-lg ${style.shadow} shrink-0`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {tier.name} Users
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {userRange} users
              </p>
              <Badge
                variant="outline"
                className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${style.bgLight} ${style.borderLight} dark:border-slate-600 text-slate-600 dark:text-slate-300`}
              >
                {style.label}
              </Badge>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Starting price */}
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Starting from
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatTZS(tier.price1Month)}
              </span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                TZS/user/mo
              </span>
            </div>
          </div>

          {/* Duration pricing table */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Duration Pricing
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_CONFIG.map((d) => {
                const price = getPriceForDuration(tier, d.months)
                const perMonth = Math.round(price / d.months)
                return (
                  <div
                    key={d.months}
                    className={`
                      relative p-3 rounded-xl border transition-all duration-300
                      ${
                        d.months === 6
                          ? `${style.bgLight} ${style.borderLight} dark:bg-slate-800 dark:border-slate-600`
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
                      }
                    `}
                  >
                    {d.months === 6 && (
                      <span className="absolute -top-1.5 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-bold uppercase shadow-sm">
                        Best
                      </span>
                    )}
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      d.months === 6 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {d.label}
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {formatTZS(price)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {formatTZS(perMonth)} TZS/mo
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Features */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              What&apos;s included
            </p>
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-tp-500 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          {tier.isActive && (
            <Button
              className={`
                w-full h-12 rounded-xl font-bold text-sm transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-lg group/btn
                ${
                  isPopular
                    ? `bg-gradient-to-r ${style.gradient} text-white shadow-lg ${style.shadow} hover:shadow-xl hover:shadow-tp-500/30`
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md hover:shadow-lg'
                }
              `}
              onClick={() => onSubscribe(tier)}
            >
              <Crown className="h-4 w-4 mr-2" />
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Skeleton loader for tier cards
// ---------------------------------------------------------------------------

function TierCardSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900">
      <Skeleton className="h-2 w-full rounded-none" />
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start gap-3 pt-4">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main PackagesPage
// ---------------------------------------------------------------------------

export function PackagesPage() {
  const { user, token, isAuthenticated, navigate } = useAppStore()
  const { toast } = useToast()

  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  // Fetch pricing tiers
  useEffect(() => {
    let cancelled = false

    async function fetchTiers() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/pricing-tiers')
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load pricing tiers')
        }

        if (!cancelled) {
          const sorted = (data.data?.tiers ?? []).sort(
            (a: PricingTier, b: PricingTier) => a.displayOrder - b.displayOrder
          )
          setTiers(sorted)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pricing tiers')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTiers()
    return () => {
      cancelled = true
    }
  }, [])

  const popularTierId = pickPopularTier(tiers)

  // Subscribe handler — navigates to subscriptions page or shows calculator
  const handleTierSubscribe = useCallback(
    (tier: PricingTier) => {
      // Scroll to the calculator section if authenticated
      if (isAuthenticated) {
        const calcEl = document.getElementById('pricing-calculator-section')
        if (calcEl) {
          calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        toast({
          title: `${tier.name} Tier Selected`,
          description: `Configure your subscription for ${tier.minUsers}–${tier.maxUsers === 999 ? '50+' : tier.maxUsers} users below.`,
        })
      } else {
        navigate('landing')
      }
    },
    [isAuthenticated, navigate, toast]
  )

  // Full subscribe handler for the PricingCalculator
  const handleSubscribe = useCallback(
    async (data: {
      pricingTierId: string
      userCount: number
      durationMonths: number
      unitPrice: number
      totalAmount: number
      includesAudio: boolean
      requestId: string
      phoneNumber: string
    }) => {
      if (!user || !token) {
        navigate('landing')
        return
      }

      setSubscribing(true)
      try {
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pricingTierId: data.pricingTierId,
            userCount: data.userCount,
            durationMonths: data.durationMonths,
            unitPrice: data.unitPrice,
            totalAmount: data.totalAmount,
            includesAudio: data.includesAudio,
            requestId: data.requestId,
            phoneNumber: data.phoneNumber,
          }),
        })

        const result = await res.json()

        if (!res.ok || !result.success) {
          toast({
            title: 'Error',
            description: result.error || 'Subscription failed',
            variant: 'destructive',
          })
          return
        }

        toast({
          title: 'Subscription Created!',
          description: `You have subscribed for TZS ${data.totalAmount.toLocaleString()}. Please complete your payment.`,
        })
        navigate('subscriptions')
      } catch {
        toast({
          title: 'Network Error',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        })
      } finally {
        setSubscribing(false)
      }
    },
    [user, token, navigate, toast]
  )

  return (
    <div className="space-y-10">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tp-50 dark:bg-tp-900/30 border border-tp-200 dark:border-tp-700/40">
          <Sparkles className="h-4 w-4 text-tp-600 dark:text-tp-400" />
          <span className="text-xs font-bold text-tp-700 dark:text-tp-300 uppercase tracking-wider">
            Flexible Plans
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Packages & Pricing
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
          Choose the right plan for your business. All plans include ringback tone
          hosting, real-time analytics, and dedicated support.
        </p>
      </div>

      {/* ── Trust badges row ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {[
          { icon: Shield, label: 'Secure Payment', color: 'text-tp-500' },
          { icon: Headphones, label: '24/7 Support', color: 'text-violet-500' },
          { icon: Clock, label: 'Instant Setup', color: 'text-amber-500' },
        ].map(({ icon: TrustIcon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 text-center"
          >
            <TrustIcon className={`h-5 w-5 ${color}`} />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tier Cards Grid ────────────────────────────────────────── */}
      <section>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <TierCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Couldn&apos;t load pricing
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              className="mx-auto"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && tiers.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Pricing Tiers Available
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pricing tiers are being configured. Please check back soon.
            </p>
          </div>
        )}

        {!loading && !error && tiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <TierCard
                key={tier.id}
                tier={tier}
                index={index}
                isPopular={tier.id === popularTierId}
                onSubscribe={handleTierSubscribe}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Pricing Calculator (authenticated only) ────────────────── */}
      {isAuthenticated && (
        <section id="pricing-calculator-section" className="scroll-mt-8">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Calculate & Subscribe
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Select your exact number of users, preferred duration, and optional
              audio recording to get an instant price.
            </p>
          </div>
          <PricingCalculator
            mode="subscribe"
            onSubscribe={handleSubscribe}
            isAuthenticated={true}
          />
        </section>
      )}

      {/* ── Subscribe loading overlay ──────────────────────────────── */}
      {subscribing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="p-8 flex flex-col items-center gap-4 shadow-2xl border-0 bg-white dark:bg-slate-900">
            <Loader2 className="h-8 w-8 text-tp-600 dark:text-tp-400 animate-spin" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Processing subscription...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Please wait while we create your subscription.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
