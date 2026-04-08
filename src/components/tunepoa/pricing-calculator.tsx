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
  ChevronDown,
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
  { value: 1, label: 'Mwezi 1', sublabel: '1 Month', discount: null },
  { value: 3, label: 'Mwezi 3', sublabel: '3 Months', discount: null },
  { value: 6, label: 'Mwezi 6', sublabel: '6 Months', discount: null },
  { value: 12, label: 'Mwezi 12', sublabel: '12 Months', discount: null },
]

export function PricingCalculator({ mode = 'landing', onSubscribe, isAuthenticated }: PricingCalculatorProps) {
  const [userCount, setUserCount] = useState(10)
  const [duration, setDuration] = useState(1)
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
        setError(data.error || 'Hitilafu imetokea')
        setResult(null)
      }
    } catch {
      setError('Hitilafu ya mtandao')
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

  const detectMNO = (phone: string) => {
    if (phone.startsWith('+25565') || phone.startsWith('065') || phone.startsWith('076')) return 'Vodacom'
    if (phone.startsWith('+25567') || phone.startsWith('067') || phone.startsWith('077')) return 'Airtel'
    if (phone.startsWith('+25571') || phone.startsWith('071') || phone.startsWith('061')) return 'Tigo'
    return null
  }

  const mno = detectMNO(phoneNumber)

  const isSubscribeMode = mode === 'subscribe'

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className={`border-0 shadow-xl overflow-hidden ${
        mode === 'landing'
          ? 'bg-white'
          : 'bg-white'
      }`}>
        <CardContent className="p-0">
          {/* Step indicators */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {mode === 'landing' ? 'Pata Bei — Get Your Price' : 'Linganisha Bei — Calculate & Subscribe'}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              {mode === 'landing'
                ? 'Chagua idadi ya namba na muda, tutakupa bei halisi'
                : 'Chagua mipangilio yako ya usajili'}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1: User Count */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</div>
                <Label className="text-sm font-semibold text-slate-700">Chagua Idadi ya Namba — Select Number Count</Label>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="max-w-[160px] text-lg font-semibold"
                />
                <div className="flex-1">
                  {result && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        <Users className="h-3 w-3 mr-1" />
                        Tier: {result.tier.name}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        ({result.tier.minUsers}–{result.tier.maxUsers === 999 ? '50+' : result.tier.maxUsers} users)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</div>
                <Label className="text-sm font-semibold text-slate-700">Chagua Muda — Select Duration</Label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                      duration === d.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{d.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{d.sublabel}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Audio Recording */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</div>
                <Label className="text-sm font-semibold text-slate-700">Audio Recording — Uandikaji wa Sauti</Label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Jumuisha Audio Recording</p>
                    <p className="text-xs text-slate-400">
                      {result
                        ? `+${formatTZS(result.audioCost)} TZS (bei ya kawaida)`
                        : 'Bei ya kawaida ya uandikaji'}
                    </p>
                  </div>
                </div>
                <Switch checked={includesAudio} onCheckedChange={setIncludesAudio} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Price Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <Label className="text-sm font-semibold text-slate-700">Muhtasari — Your Plan Summary</Label>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {result && (
                <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-slate-500">Tier:</div>
                    <div className="font-semibold text-slate-800 text-right">{result.tier.name} Users</div>

                    <div className="text-slate-500">Bei/Mtumiaji/Mwezi:</div>
                    <div className="font-semibold text-slate-800 text-right">{formatTZS(result.unitPrice)} TZS</div>

                    <div className="text-slate-500">Idadi ya Namba:</div>
                    <div className="font-semibold text-slate-800 text-right">{result.userCount}</div>

                    <div className="text-slate-500">Muda:</div>
                    <div className="font-semibold text-slate-800 text-right">{result.durationMonths} Miezi</div>
                  </div>

                  <div className="h-px bg-emerald-200/50" />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-slate-500">Subtotal:</div>
                    <div className="font-semibold text-slate-800 text-right">{formatTZS(result.subtotal)} TZS</div>

                    {result.includesAudio && (
                      <>
                        <div className="text-slate-500 flex items-center gap-1">
                          <Music className="h-3 w-3" /> Audio Recording:
                        </div>
                        <div className="font-semibold text-slate-800 text-right">+{formatTZS(result.audioCost)} TZS</div>
                      </>
                    )}
                  </div>

                  <div className="h-px bg-emerald-300" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-800">JUMLA — TOTAL:</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {formatTZS(result.total)} TZS
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Subscribe Mode extras */}
            {isSubscribeMode && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Select Service Request */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">4</div>
                    <Label className="text-sm font-semibold text-slate-700">Chagua Ombi — Select Service Request</Label>
                  </div>
                  {requests.length > 0 ? (
                    <div className="space-y-2">
                      {requests.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRequest(r.id)}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                            selectedRequest === r.id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">{r.businessName}</p>
                            <p className="text-xs text-slate-400">{r.adType} — {r.status}</p>
                          </div>
                          {selectedRequest === r.id && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                      <Info className="h-4 w-4 inline mr-1.5" />
                      Unahitaji ombi lililoidhinishwa au kukamilika kabla ya kusajili.
                      <br />
                      <span className="text-xs">You need an approved or completed service request before subscribing.</span>
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">5</div>
                    <Label className="text-sm font-semibold text-slate-700">Namba ya Simu — Phone Number</Label>
                  </div>
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="+2557XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-4"
                    />
                    {mno && (
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        {mno}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* CTA */}
            <div className="pt-2">
              {mode === 'landing' ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-500">
                    Ready to get started? <strong className="text-emerald-600">Register now</strong> and subscribe in minutes.
                  </p>
                  {!isAuthenticated && (
                    <Button size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Anza Sasa — Get Started
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base py-6"
                  disabled={!result || !selectedRequest || requests.length === 0 || loading}
                  onClick={handleSubscribe}
                >
                  {loading ? (
                    'Inahesabu...'
                  ) : (
                    <>
                      Sajili Sasa — Subscribe Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
