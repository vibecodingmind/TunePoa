'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Music,
  Headphones,
  Award,
  Crown,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Info,
  Star,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Types                                                                     */
/* ========================================================================= */

interface Package {
  id: string
  name: string
  description: string
  price: number
  currency: string
  durationMonths: number
  features: string
  maxAdDuration: number
  isActive: boolean
  _count?: { subscriptions: number }
}

interface ServiceRequest {
  id: string
  businessName: string
  adType: string
  status: string
}

/* ========================================================================= */
/* Constants                                                                 */
/* ========================================================================= */

const BILLING_PERIODS = [
  { value: 'monthly', label: 'Monthly', discount: null },
  { value: 'quarterly', label: 'Quarterly', discount: 'Save 5%' },
  { value: 'yearly', label: 'Yearly', discount: 'Save 17%' },
]

const PAYMENT_METHODS = [
  { value: 'M-Pesa', label: 'M-Pesa' },
  { value: 'Tigo Pesa', label: 'Tigo Pesa' },
  { value: 'Airtel Money', label: 'Airtel Money' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
]

const MNO_PROVIDERS = [
  { value: 'Vodacom', label: 'Vodacom' },
  { value: 'Tigo', label: 'Tigo' },
  { value: 'Airtel', label: 'Airtel' },
  { value: 'Halotel', label: 'Halotel' },
]

const PKG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bronze: Music,
  Silver: Headphones,
  Gold: Award,
  Platinum: Crown,
}

const PKG_COLORS: Record<string, string> = {
  Bronze: 'border-orange-200 bg-gradient-to-br from-orange-50/80 to-white',
  Silver: 'border-slate-300 bg-gradient-to-br from-slate-50/80 to-white',
  Gold: 'border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white',
  Platinum: 'border-violet-200 bg-gradient-to-br from-violet-50/80 to-white',
}

const PKG_ICON_COLORS: Record<string, string> = {
  Bronze: 'text-orange-500 bg-orange-100',
  Silver: 'text-slate-500 bg-slate-100',
  Gold: 'text-emerald-600 bg-emerald-100',
  Platinum: 'text-violet-600 bg-violet-100',
}

const PKG_BTN_COLORS: Record<string, string> = {
  Bronze: 'bg-orange-600 hover:bg-orange-700 text-white',
  Silver: 'bg-slate-700 hover:bg-slate-800 text-white',
  Gold: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  Platinum: 'bg-violet-600 hover:bg-violet-700 text-white',
}

/* ========================================================================= */
/* Helpers                                                                   */
/* ========================================================================= */

function detectMNO(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('25565') || cleaned.startsWith('065')) return 'Vodacom'
  if (cleaned.startsWith('25567') || cleaned.startsWith('067')) return 'Tigo'
  if (cleaned.startsWith('25568') || cleaned.startsWith('068')) return 'Airtel'
  if (cleaned.startsWith('25569') || cleaned.startsWith('069')) return 'Halotel'
  return ''
}

function formatCurrency(amount: number): string {
  return `TZS ${amount.toLocaleString()}`
}

/* ========================================================================= */
/* Component                                                                 */
/* ========================================================================= */

export function PackagesPage() {
  const { user, token, navigate } = useAppStore()
  const { toast } = useToast()

  const [packages, setPackages] = useState<Package[]>([])
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  // Subscribe dialog state
  const [subscribeDialog, setSubscribeDialog] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [selectedRequest, setSelectedRequest] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mnoProvider, setMnoProvider] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  /* ---- Fetch data ---- */

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const [pkgRes, reqRes] = await Promise.all([
        fetch('/api/packages', { headers }),
        user && token
          ? fetch(`/api/service-requests?userId=${user.id}`, { headers })
          : Promise.resolve(new Response(JSON.stringify({ success: true, data: { requests: [] } }))),
      ])

      const pkgData = await pkgRes.json()
      const reqData = await reqRes.json()

      if (!pkgRes.ok || !pkgData.success) throw new Error(pkgData.error || 'Failed to fetch packages')
      if (reqData.success === false) throw new Error(reqData.error || 'Failed to fetch requests')

      setPackages(pkgData.data?.packages || [])
      setUserRequests(reqData.data?.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user, token])

  /* ---- Computed ---- */

  const eligibleRequests = useMemo(
    () => userRequests.filter((r) => ['APPROVED', 'COMPLETED'].includes(r.status)),
    [userRequests],
  )

  const multiplier = useMemo(() => {
    switch (billingPeriod) {
      case 'quarterly':
        return 3
      case 'yearly':
        return 10
      default:
        return 1
    }
  }, [billingPeriod])

  const detectedMNO = useMemo(() => detectMNO(phoneNumber), [phoneNumber])

  useEffect(() => {
    if (detectedMNO && !mnoProvider) {
      setMnoProvider(detectedMNO)
    }
  }, [detectedMNO, mnoProvider])

  /* ---- Subscribe handlers ---- */

  const handleSubscribe = (pkg: Package) => {
    if (!user || !token) {
      navigate('landing')
      return
    }
    setSelectedPkg(pkg)
    setSelectedRequest('')
    setPhoneNumber(user.phone || '')
    setMnoProvider('')
    setPaymentMethod('')
    setSubscribeDialog(true)
  }

  const confirmSubscribe = async () => {
    if (!selectedPkg || !selectedRequest || !paymentMethod || !user || !token) return

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          requestId: selectedRequest,
          phoneNumber,
          mnoProvider: mnoProvider || undefined,
          paymentMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create subscription',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Subscription Created',
        description: `You have subscribed to the ${selectedPkg.name} package. Please complete your payment.`,
      })
      setSubscribeDialog(false)
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
  }

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[30rem] rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Render: Error ---- */

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  /* ---- Comparison data ---- */

  const comparisonFeatures = [
    'Ad Duration',
    'Phone Numbers',
    'Custom Script',
    'Voice-over',
    'Sound Effects',
    'WhatsApp Verification',
    'Dedicated Support',
    'Reports',
    'A/B Testing',
  ]

  const featureMatrix: Record<string, Record<string, string | boolean>> = {
    'Ad Duration': { Bronze: '15s', Silver: '30s', Gold: '45s', Platinum: '60s' },
    'Phone Numbers': { Bronze: '1', Silver: '2', Gold: '5', Platinum: '10' },
    'Custom Script': { Bronze: true, Silver: true, Gold: true, Platinum: true },
    'Voice-over': { Bronze: false, Silver: true, Gold: true, Platinum: true },
    'Sound Effects': { Bronze: false, Silver: false, Gold: true, Platinum: true },
    'WhatsApp Verification': { Bronze: true, Silver: true, Gold: true, Platinum: true },
    'Dedicated Support': { Bronze: false, Silver: false, Gold: true, Platinum: true },
    Reports: { Bronze: 'Monthly', Silver: 'Monthly', Gold: 'Weekly', Platinum: 'Daily' },
    'A/B Testing': { Bronze: false, Silver: false, Gold: false, Platinum: true },
  }

  /* ---- Render: Packages ---- */

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription Packages</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose the perfect package for your ringback tone advertising needs
        </p>
      </div>

      {/* Eligibility notice */}
      {eligibleRequests.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Eligibility Required</p>
            <p className="text-xs text-amber-700 mt-1">
              You need at least one approved service request to subscribe to a package. Submit a
              request and wait for approval first.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => navigate('new-request')}
            >
              Create a Request
            </Button>
          </div>
        </div>
      )}

      {/* Billing Period Toggle */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {BILLING_PERIODS.map((period) => {
          const isActive = billingPeriod === period.value
          return (
            <button
              key={period.value}
              onClick={() => setBillingPeriod(period.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {period.label}
              {period.discount && (
                <span className="ml-1.5 text-xs text-emerald-600 font-semibold">
                  {period.discount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Package Cards                                                     */}
      {/* ================================================================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
          const Icon = PKG_ICONS[pkg.name] || ShieldCheck
          const iconColor = PKG_ICON_COLORS[pkg.name] || 'text-slate-500 bg-slate-100'
          const cardColor = PKG_COLORS[pkg.name] || 'border-slate-200 bg-white'
          const btnColor = PKG_BTN_COLORS[pkg.name] || 'bg-slate-700 hover:bg-slate-800 text-white'
          const isGold = pkg.name === 'Gold'
          const totalPrice = Math.round(pkg.price * multiplier)
          const billingLabel =
            billingPeriod === 'monthly'
              ? 'mo'
              : billingPeriod === 'quarterly'
                ? 'qtr'
                : 'yr'
          const currentDiscount = BILLING_PERIODS.find((p) => p.value === billingPeriod)?.discount

          return (
            <Card
              key={pkg.id}
              className={`relative ${cardColor} ${
                isGold
                  ? 'border-2 border-emerald-400 shadow-lg scale-[1.02] lg:scale-105 z-10'
                  : 'border shadow-sm'
              } transition-shadow hover:shadow-md`}
            >
              {isGold && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-2 pt-6">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">{pkg.name}</CardTitle>
                    {pkg._count && (
                      <p className="text-xs text-slate-400">
                        {pkg._count.subscriptions} active
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(totalPrice)}
                  </span>
                  <span className="text-sm text-slate-500">/{billingLabel}</span>
                  {currentDiscount && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs text-emerald-600 border-emerald-300 bg-emerald-50"
                    >
                      {currentDiscount}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">{pkg.description}</p>

                <Separator />

                {/* Features list */}
                <ul className="space-y-2.5">
                  {Array.isArray(features) &&
                    features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                </ul>

                {/* Subscribe button */}
                <Button
                  className={`w-full h-10 font-medium ${
                    isGold
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : btnColor
                  }`}
                  variant={isGold ? 'default' : 'default'}
                  disabled={eligibleRequests.length === 0}
                  onClick={() => handleSubscribe(pkg)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Package Comparison Table                                           */}
      {/* ================================================================= */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Package Comparison</CardTitle>
          <CardDescription>Compare features across all packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-500 text-xs uppercase tracking-wide min-w-[160px]">
                    Feature
                  </TableHead>
                  {packages.map((pkg) => (
                    <TableHead
                      key={pkg.id}
                      className="text-center text-slate-900 min-w-[100px] font-semibold"
                    >
                      {pkg.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((feature) => (
                  <TableRow key={feature} className="border-slate-50">
                    <TableCell className="font-medium text-slate-700 text-sm">{feature}</TableCell>
                    {packages.map((pkg) => {
                      const value = featureMatrix[feature]?.[pkg.name]
                      return (
                        <TableCell key={pkg.id} className="text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-slate-700 font-medium">{value}</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Subscribe Dialog                                                   */}
      {/* ================================================================= */}
      <Dialog open={subscribeDialog} onOpenChange={setSubscribeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              Subscribe to {selectedPkg?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPkg
                ? `${formatCurrency(selectedPkg.price * multiplier)} for ${
                    billingPeriod === 'monthly'
                      ? `${selectedPkg.durationMonths} month${selectedPkg.durationMonths > 1 ? 's' : ''}`
                      : billingPeriod === 'quarterly'
                        ? '3 months'
                        : '12 months'
                  }`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Select Service Request */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service Request</Label>
              {eligibleRequests.length === 0 ? (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">
                    You need at least one approved service request to subscribe.
                  </p>
                </div>
              ) : (
                <Select value={selectedRequest} onValueChange={setSelectedRequest}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a service request..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleRequests.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        <div className="flex items-center gap-2">
                          <span>{r.businessName}</span>
                          <Badge variant="outline" className="text-xs text-slate-500">
                            {r.adType}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number (Ringback Tone)
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                className="h-11"
              />
              {detectedMNO && (
                <p className="text-xs text-emerald-600 font-medium">
                  Auto-detected provider: {detectedMNO}
                </p>
              )}
            </div>

            {/* MNO Provider */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">MNO Provider</Label>
              <Select value={mnoProvider} onValueChange={setMnoProvider}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {MNO_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setSubscribeDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!selectedRequest || !paymentMethod || subscribing}
              onClick={confirmSubscribe}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Confirm Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
