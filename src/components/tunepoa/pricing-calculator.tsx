'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Users,
  Calendar,
  Music,
  Calculator,
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
  Minus,
  Plus,
  Zap,
  Crown,
  Shield,
  Headphones,
  Gift,
} from 'lucide-react'

interface PricingResult {
  tier: {
    id: string
    name: string
    minUsers: number
    maxUsers: number
  }
  userCount: number
  durationMonths: number
  unitPrice: number
  subtotal: number
  includesAudio: boolean
  audioCost: number
  total: number
}

interface ServiceRequest {
  id: string
  businessName: string
  adType: string
  status: string
}

interface PricingCalculatorProps {
  mode?: 'landing' | 'subscribe'
  onSubscribe?: (data: {
    pricingTierId: string
    userCount: number
    durationMonths: number
    unitPrice: number
    totalAmount: number
    includesAudio: boolean
    requestId: string
    phoneNumber: string
  }) => void
  isAuthenticated?: boolean
}

const DURATIONS = [
  { value: 1, label: '1', unit: 'Month', badge: '', popular: false },
  { value: 3, label: '3', unit: 'Months', badge: 'Save 5%', popular: false },
  { value: 6, label: '6', unit: 'Months', badge: 'Save 15%', popular: true },
  { value: 12, label: '12', unit: 'Months', badge: 'Best Value', popular: false },
]

export function PricingCalculator({ mode = 'landing', onSubscribe, isAuthenticated }: PricingCalculatorProps) {
  const [userCount, setUserCount] = useState(10)
  const [duration, setDuration] = useState(6)
  const [includesAudio, setIncludesAudio] = useState(false)
  const [result, setResult] = useState<PricingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For subscribe mode
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const calculatePrice = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/pricing/calculate?userCount=${userCount}&durationMonths=${duration}&includesAudio=${includesAudio}`
      )
      const data = await res.json()
      if (data.success && data.data) {
        setResult(data.data)
      } else {
        setError(data.error || 'An error occurred')
        setResult(null)
      }
    } catch {
      setError('Network error')
      setResult(null)
    }
    setLoading(false)
  }, [userCount, duration, includesAudio])

  useEffect(() => {
    if (userCount >= 1) {
      calculatePrice()
    }
  }, [userCount, duration, includesAudio, calculatePrice])

  // Fetch eligible requests for subscribe mode
  const fetchRequests = useCallback(async () => {
    if (mode !== 'subscribe') return
    try {
      const token = localStorage.getItem('tunepoa_token')
      if (!token) return
      const res = await fetch('/api/service-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.requests) {
        const eligible = data.data.requests.filter(
          (r: ServiceRequest) => r.status === 'APPROVED' || r.status === 'COMPLETED'
        )
        setRequests(eligible)
        if (eligible.length > 0) {
          setSelectedRequest(eligible[0].id)
        }
      }
    } catch (err) {
      console.error('Fetch requests error:', err)
    }
  }, [mode])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleSubscribe = () => {
    if (!result || !selectedRequest) return
    onSubscribe?.({
      pricingTierId: result.tier.id,
      userCount: result.userCount,
      durationMonths: result.durationMonths,
      unitPrice: result.unitPrice,
      totalAmount: result.total,
      includesAudio: result.includesAudio,
      requestId: selectedRequest,
      phoneNumber: phoneNumber,
    })
  }

  const formatTZS = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isSubscribeMode = mode === 'subscribe'

  return (
    <div className="w-full max-w-5xl mx-auto">
      {mode === 'landing' ? (
        /* ═══════════════════════════════════════════════════════
           LANDING MODE — Premium split layout
           ═══════════════════════════════════════════════════════ */
        <div className="relative grid lg:grid-cols-5 gap-6 items-start">
          {/* Left: Calculator Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* User Count Card */}
            <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-shadow duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-tp-500 to-ts-400 text-white flex items-center justify-center shadow-md shadow-tp-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Number of Users</h4>
                  <p className="text-xs text-slate-400">How many phone numbers need ringback tones?</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setUserCount(Math.max(1, userCount - 1))}
                    className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-tp-600 hover:bg-tp-50 transition-colors duration-200 active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={userCount}
                    onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-12 text-center text-xl font-bold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setUserCount(userCount + 1)}
                    className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-tp-600 hover:bg-tp-50 transition-colors duration-200 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">
                  {result && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-tp-50 border border-tp-100 animate-fade-in">
                      <div className="h-2 w-2 rounded-full bg-tp-500 animate-pulse" />
                      <span className="text-xs font-bold text-tp-700 uppercase tracking-wider">
                        Tier: {result.tier.name}
                      </span>
                      <span className="text-[10px] text-tp-500 font-medium">
                        ({result.tier.minUsers}–{result.tier.maxUsers === 999 ? '50+' : result.tier.maxUsers} users)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick select chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[5, 10, 25, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => setUserCount(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                      userCount === num
                        ? 'bg-tp-500 text-white shadow-md shadow-tp-500/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-tp-50 hover:text-tp-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Card */}
            <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-shadow duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Subscription Duration</h4>
                  <p className="text-xs text-slate-400">Longer plans save you more per month</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`relative py-4 px-2 rounded-xl text-center transition-all duration-300 group ${
                      duration === d.value
                        ? 'bg-gradient-to-br from-tp-500 to-ts-500 text-white shadow-lg shadow-tp-500/30 scale-[1.02]'
                        : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-tp-300 hover:bg-tp-50/50'
                    }`}
                  >
                    {d.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
                        Popular
                      </span>
                    )}
                    <div className={`text-xl sm:text-2xl font-extrabold ${duration === d.value ? 'text-white' : 'text-slate-900'}`}>
                      {d.label}
                    </div>
                    <div className={`text-[10px] font-medium mt-0.5 ${duration === d.value ? 'text-tp-100' : 'text-slate-400'}`}>
                      {d.unit}
                    </div>
                    {d.badge && duration !== d.value && (
                      <div className="text-[9px] font-bold text-tp-600 mt-1">{d.badge}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Recording Card */}
            <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-shadow duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Audio Recording</h4>
                    <p className="text-xs text-slate-400">
                      {result
                        ? `Add professional ad recording for ${formatTZS(result.audioCost)} TZS`
                        : 'Professional studio-recorded advertisement'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={includesAudio}
                  onCheckedChange={setIncludesAudio}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-purple-500"
                />
              </div>

              {includesAudio && (
                <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100 animate-fade-in">
                  <Headphones className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-violet-700 leading-relaxed">
                    Our professional studio will record your custom ad with experienced voice artists. You approve it via WhatsApp before it goes live.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Price Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Main price card */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tp-500 via-ts-500 to-cyan-500 animate-gradient p-[2px]">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-tp-950 to-slate-900" />
                </div>

                <div className="relative p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-tp-400" />
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-tp-400">
                        Your Price
                      </span>
                    </div>
                    {result && (
                      <Badge className="bg-tp-500/20 text-tp-300 border-tp-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {result.tier.name} Tier
                      </Badge>
                    )}
                  </div>

                  {loading && !result && (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-16 bg-white/5 rounded-xl" />
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                      <Info className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {result && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Breakdown items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            {result.userCount} users × {formatTZS(result.unitPrice)} TZS
                          </span>
                          <span className="text-slate-300 font-medium">
                            {formatTZS(result.subtotal)} TZS
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {result.durationMonths} {result.durationMonths === 1 ? 'month' : 'months'}
                          </span>
                          <span className="text-slate-300 font-medium">
                            {formatTZS(result.unitPrice * result.userCount)} TZS/mo
                          </span>
                        </div>

                        {result.includesAudio && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 flex items-center gap-2">
                              <Music className="h-3.5 w-3.5" />
                              Audio Recording
                            </span>
                            <span className="text-slate-300 font-medium">
                              +{formatTZS(result.audioCost)} TZS
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      {/* Total */}
                      <div className="text-center py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Total Cost</p>
                        <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                          {formatTZS(result.total)}
                          <span className="text-base font-medium text-slate-500 ml-2">TZS</span>
                        </div>
                        {result.durationMonths > 1 && (
                          <p className="text-xs text-tp-400 mt-2 font-medium">
                            That&apos;s {formatTZS(Math.round(result.total / result.durationMonths))} TZS per month
                          </p>
                        )}
                      </div>

                      {/* Per-user breakdown */}
                      <div className="flex items-center justify-center gap-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <div className="text-center">
                          <p className="text-lg font-extrabold text-white">{formatTZS(result.unitPrice)}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Per User/Mo</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-lg font-extrabold text-white">{result.userCount}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Users</p>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                          <p className="text-lg font-extrabold text-white">{result.durationMonths}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Months</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              {!isAuthenticated && (
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-tp-500 to-ts-500 hover:from-tp-600 hover:to-ts-600 text-white font-bold text-base h-14 rounded-2xl shadow-xl shadow-tp-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-tp-500/30 group"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/80 text-center">
                  <Shield className="h-5 w-5 text-tp-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Secure<br/>Payment</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/80 text-center">
                  <Headphones className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">24/7<br/>Support</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/80 text-center">
                  <Gift className="h-5 w-5 text-violet-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">Cancel<br/>Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════
           SUBSCRIBE MODE — Full width form
           ═══════════════════════════════════════════════════════ */
        <Card className="border-0 shadow-2xl shadow-slate-200/50 overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-tp-600 to-ts-500 px-6 sm:px-8 py-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Calculate & Subscribe</h3>
                  <p className="text-tp-100 text-sm">Configure your subscription details</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Step 1: User Count */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-tp-100 text-tp-700 flex items-center justify-center text-xs font-extrabold">1</div>
                  <Label className="text-sm font-bold text-slate-900">Number of Users</Label>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-0 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setUserCount(Math.max(1, userCount - 1))}
                      className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-tp-600 hover:bg-tp-50 transition-colors active:scale-95"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={userCount}
                      onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-11 text-center text-lg font-bold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setUserCount(userCount + 1)}
                      className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-tp-600 hover:bg-tp-50 transition-colors active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {result && (
                    <Badge className="bg-tp-100 text-tp-700 border-tp-200 hover:bg-tp-100">
                      <Crown className="h-3 w-3 mr-1" />
                      {result.tier.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Step 2: Duration */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-tp-100 text-tp-700 flex items-center justify-center text-xs font-extrabold">2</div>
                  <Label className="text-sm font-bold text-slate-900">Duration</Label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`relative py-3 px-2 rounded-xl text-center transition-all duration-300 ${
                        duration === d.value
                          ? 'bg-gradient-to-br from-tp-500 to-ts-500 text-white shadow-lg shadow-tp-500/25'
                          : 'bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-tp-300'
                      }`}
                    >
                      {d.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-bold uppercase">
                          Hot
                        </span>
                      )}
                      <div className="text-lg font-extrabold">{d.label}</div>
                      <div className="text-[10px] opacity-70 font-medium">{d.unit}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Audio */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-tp-100 text-tp-700 flex items-center justify-center text-xs font-extrabold">3</div>
                  <Label className="text-sm font-bold text-slate-900">Audio Recording</Label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                      <Music className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Include Audio Recording</p>
                      <p className="text-xs text-slate-400">
                        {result ? `+${formatTZS(result.audioCost)} TZS flat fee` : 'Professional studio recording'}
                      </p>
                    </div>
                  </div>
                  <Switch checked={includesAudio} onCheckedChange={setIncludesAudio} />
                </div>
              </div>

              {/* Price Summary */}
              {result && (
                <div className="rounded-2xl bg-gradient-to-br from-tp-50 to-ts-50 border-2 border-tp-200 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-tp-600" />
                    <span className="text-sm font-bold text-tp-800">Your Plan Summary</span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tier:</span>
                      <span className="font-bold text-slate-800">{result.tier.name} Users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Price / User / Month:</span>
                      <span className="font-bold text-slate-800">{formatTZS(result.unitPrice)} TZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Users:</span>
                      <span className="font-bold text-slate-800">{result.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-bold text-slate-800">{result.durationMonths} Months</span>
                    </div>
                  </div>

                  <div className="h-px bg-tp-200/60" />

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-bold text-slate-800">{formatTZS(result.subtotal)} TZS</span>
                    </div>
                    {result.includesAudio && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Music className="h-3 w-3" /> Audio Recording:
                        </span>
                        <span className="font-bold text-slate-800">+{formatTZS(result.audioCost)} TZS</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-tp-300/60" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-bold text-slate-900">TOTAL:</span>
                    <span className="text-3xl font-extrabold text-tp-700">
                      {formatTZS(result.total)} <span className="text-base font-medium">TZS</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Service Request Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-tp-100 text-tp-700 flex items-center justify-center text-xs font-extrabold">4</div>
                  <Label className="text-sm font-bold text-slate-900">Select Service Request</Label>
                </div>
                {requests.length > 0 ? (
                  <div className="space-y-2">
                    {requests.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRequest(r.id)}
                        className={`w-full p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                          selectedRequest === r.id
                            ? 'border-tp-500 bg-tp-50 shadow-sm shadow-tp-100'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.businessName}</p>
                          <p className="text-xs text-slate-400">{r.adType} — {r.status}</p>
                        </div>
                        {selectedRequest === r.id && (
                          <CheckCircle2 className="h-5 w-5 text-tp-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    You need an approved or completed service request before subscribing.
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-tp-100 text-tp-700 flex items-center justify-center text-xs font-extrabold">5</div>
                  <Label className="text-sm font-bold text-slate-900">Phone Number</Label>
                </div>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="+2557XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-4 h-12 text-base"
                  />
                </div>
              </div>

              {/* Subscribe Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-tp-600 to-ts-500 hover:from-tp-700 hover:to-ts-600 text-white font-bold text-base h-14 rounded-2xl shadow-xl shadow-tp-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl group"
                disabled={!result || !selectedRequest || requests.length === 0 || loading}
                onClick={handleSubscribe}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </div>
                ) : (
                  <>
                    Subscribe Now — {result ? `${formatTZS(result.total)} TZS` : ''}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
