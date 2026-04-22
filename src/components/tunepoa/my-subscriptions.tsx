'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CreditCard,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
  Phone,
  Calendar,
  Building2,
  Loader2,
  Receipt,
  Wifi,
  Banknote,
  CircleDollarSign,
  RotateCcw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PaymentGatewayDialog } from './payment-gateway-dialog'

/* ========================================================================= */
/* Types */
/* ========================================================================= */

interface PaymentRecord {
  id: string
  amount: number
  method: string
  status: string
  paidAt: string | null
  reference: string | null
  createdAt: string
}

interface Subscription {
  id: string
  status: string
  paymentStatus: string
  vodacomStatus: string
  vodacomReference: string | null
  phoneNumber: string | null
  startDate: string | null
  endDate: string | null
  amount: number
  currency: string
  autoRenew: boolean
  package: { id: string; name: string; price: number; durationMonths: number }
  request: { id: string; businessName: string; adType: string }
}

/* ========================================================================= */
/* Helpers */
/* ========================================================================= */

function formatCurrency(amount: number): string {
  return `TZS ${amount.toLocaleString()}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPaymentMethod(method: string): string {
  return method.replace(/_/g, '')
}

function getPaymentStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-white/5 text-slate-300 border-white/[0.08]'
}

/* ========================================================================= */
/* Status Badge Component */
/* ========================================================================= */

interface StatusBadgeProps {
  label: string
  status: string
  icon: React.ComponentType<{ className?: string }>
}

function StatusBadge({ label, status, icon: Icon }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-xs ${getPaymentStatusColor(status)}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}: {STATUS_LABELS[status] || status.replace(/_/g, '')}
    </Badge>
  )
}

/* ========================================================================= */
/* Unpaid Payment Banner */
/* ========================================================================= */

function UnpaidBanner({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 cursor-pointer hover:from-amber-500/15 hover:to-orange-500/15 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 group-hover:scale-110 transition-transform">
          <CircleDollarSign className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-300">Payment Required</p>
          <p className="text-xs text-amber-400/70">
            Click here to select a payment method and complete your subscription.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 border-0 font-bold text-xs"
        >
          Pay Now
          <CreditCard className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* Main Component */
/* ========================================================================= */

export function MySubscriptions() {
  const { user, token, navigate } = useAppStore()
  const { toast } = useToast()

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [paymentsLoading, setPaymentsLoading] = useState<string | null>(null)
  const [paymentsMap, setPaymentsMap] = useState<Record<string, PaymentRecord[]>>({})

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null)
  const [cancelling, setCancelling] = useState(false)

  // Payment dialog
  const [payTarget, setPayTarget] = useState<Subscription | null>(null)

  // Renewal dialog
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null)
  const [renewDuration, setRenewDuration] = useState<number>(1)
  const [renewAudio, setRenewAudio] = useState(false)
  const [renewing, setRenewing] = useState(false)

  /* ---- Fetch subscriptions ---- */

  const fetchSubscriptions = useCallback(async () => {
    if (!user || !token) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/subscriptions?userId=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch subscriptions')
      }

      setSubscriptions(data.data?.subscriptions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  /* ---- Fetch payments for a subscription ---- */

  const fetchPayments = useCallback(
    async (subscriptionId: string) => {
      if (!token) return
      if (paymentsMap[subscriptionId]) return

      setPaymentsLoading(subscriptionId)

      try {
        const res = await fetch(`/api/payments?subscriptionId=${subscriptionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()

        if (data.success) {
          setPaymentsMap((prev) => ({
            ...prev,
            [subscriptionId]: data.data?.payments || [],
          }))
        }
      } catch {
        // Silently fail
      } finally {
        setPaymentsLoading(null)
      }
    },
    [token, paymentsMap],
  )

  const handleExpand = async (subId: string) => {
    const newExpandedId = expandedId === subId ? null : subId
    setExpandedId(newExpandedId)

    if (newExpandedId) {
      await fetchPayments(newExpandedId)
    }
  }

  /* ---- Payment success callback ---- */

  const handlePaymentSuccess = useCallback(() => {
    setPayTarget(null)
    fetchSubscriptions()
  }, [fetchSubscriptions])

  /* ---- Cancel subscription ---- */

  const handleCancel = async () => {
    if (!cancelTarget || !token) return

    setCancelling(true)
    try {
      const res = await fetch(`/api/subscriptions/${cancelTarget.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to cancel subscription',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      })

      setCancelTarget(null)
      fetchSubscriptions()
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setCancelling(false)
    }
  }

  /* ---- Renew subscription ---- */

  const handleRenew = async () => {
    if (!renewTarget || !token) return

    setRenewing(true)
    try {
      const res = await fetch(`/api/subscriptions/${renewTarget.id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          durationMonths: renewDuration,
          includesAudio: renewAudio,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Renewal Failed',
          description: data.error || 'Failed to renew subscription',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Subscription Renewed',
        description: `Your ${renewTarget.package.name} Package has been renewed for ${renewDuration} month(s).`,
      })

      setRenewTarget(null)
      await fetchSubscriptions()

      // If the renewed subscription is unpaid, open the payment dialog
      const renewedSub = data.data?.subscription
      if (renewedSub && renewedSub.paymentStatus === 'UNPAID') {
        setPayTarget(renewedSub as Subscription)
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setRenewing(false)
    }
  }

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
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
            <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  /* ---- Render: Main ---- */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                {subscriptions.length}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Manage your active subscriptions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-tp-600 hover:bg-tp-700 text-white"
            onClick={() => navigate('packages')}
          >
            <CreditCard className="h-4 w-4 mr-1.5" />
            Browse Packages
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {subscriptions.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No subscriptions yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Subscribe to a package to activate your ringback tone ad on Vodacom.
            </p>
            <Button
              className="mt-5 bg-tp-600 hover:bg-tp-700 text-white"
              onClick={() => navigate('packages')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Browse Packages
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscription Cards */}
      {subscriptions.length > 0 && (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const isExpanded = expandedId === sub.id
            const payments = paymentsMap[sub.id] || []
            const canCancel = ['ACTIVE', 'PENDING'].includes(sub.status)
            const canRenew = sub.status === 'ACTIVE' || sub.status === 'EXPIRED'
            const needsPayment = sub.paymentStatus === 'UNPAID' && sub.status !== 'CANCELLED'

            return (
              <Card
                key={sub.id}
                className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${needsPayment ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{sub.package.name} Package</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[sub.status] || 'bg-white/5 text-slate-300 border-white/[0.08]'}`}
                        >
                          {STATUS_LABELS[sub.status] || sub.status}
                        </Badge>
                        {needsPayment && (
                          <Badge className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse">
                            AWAITING PAYMENT
                          </Badge>
                        )}
                      </div>

                      {/* Detail grid */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{sub.request.businessName}</span>
                          <Badge variant="outline" className="text-xs text-slate-400 border-white/[0.08] shrink-0">
                            {sub.request.adType}
                          </Badge>
                        </div>
                        {sub.phoneNumber && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{sub.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300">
                          <Wifi className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Vodacom Tanzania</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Banknote className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{formatCurrency(sub.amount)}</span>
                          <span className="text-slate-400 text-xs">
                            / {sub.package.durationMonths}mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Status badges row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <StatusBadge label="Subscription" status={sub.status} icon={CreditCard} />
                        <StatusBadge label="Payment" status={sub.paymentStatus} icon={Banknote} />
                        <StatusBadge label="Vodacom" status={sub.vodacomStatus} icon={Wifi} />
                      </div>

                      {/* Unpaid payment banner */}
                      {needsPayment && (
                        <UnpaidBanner onClick={() => setPayTarget(sub)} />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {needsPayment && (
                        <Button
                          size="sm"
                          className="h-9 bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 border-0 font-bold"
                          onClick={() => setPayTarget(sub)}
                        >
                          <CircleDollarSign className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Pay Now</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExpand(sub.id)}
                        className="h-9"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Hide</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Details</span>
                          </>
                        )}
                      </Button>
                      {canRenew && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 border-teal-500/20 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300"
                          onClick={() => {
                            setRenewTarget(sub)
                            setRenewDuration(1)
                            setRenewAudio(false)
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Renew</span>
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-500/10 hover:bg-red-500/100/10 hover:text-red-400 h-9"
                          onClick={() => setCancelTarget(sub)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Cancel</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Payment History */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-4 w-4 text-slate-400" />
                        <h4 className="text-sm font-semibold text-slate-300">Payment History</h4>
                      </div>

                      {paymentsLoading === sub.id ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : payments.length === 0 ? (
                        <div className="text-center py-6">
                          <Receipt className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-400">No payment records found.</p>
                          {needsPayment && (
                            <Button
                              size="sm"
                              className="mt-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 border-0 font-bold"
                              onClick={() => setPayTarget(sub)}
                            >
                              <CircleDollarSign className="h-4 w-4 mr-1.5" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/[0.06]">
                                <TableHead className="text-xs text-slate-400 uppercase tracking-wide">
                                  Date
                                </TableHead>
                                <TableHead className="text-xs text-slate-400 uppercase tracking-wide">
                                  Amount
                                </TableHead>
                                <TableHead className="text-xs text-slate-400 uppercase tracking-wide">
                                  Method
                                </TableHead>
                                <TableHead className="text-xs text-slate-400 uppercase tracking-wide">
                                  Status
                                </TableHead>
                                <TableHead className="text-xs text-slate-400 uppercase tracking-wide">
                                  Reference
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment) => (
                                <TableRow key={payment.id} className="border-white/[0.04]">
                                  <TableCell className="text-sm text-slate-300">
                                    {formatDate(payment.paidAt || payment.createdAt)}
                                  </TableCell>
                                  <TableCell className="font-semibold text-sm">
                                    {formatCurrency(payment.amount)}
                                  </TableCell>
                                  <TableCell className="text-sm text-slate-300">
                                    {formatPaymentMethod(payment.method)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getPaymentStatusColor(payment.status)}`}
                                    >
                                      {STATUS_LABELS[payment.status] || payment.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-slate-400 font-mono text-xs">
                                    {payment.reference || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* Payment Gateway Dialog */}
      {/* ================================================================= */}
      <PaymentGatewayDialog
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        subscriptionId={payTarget?.id || ''}
        amount={payTarget?.amount || 0}
        currency={payTarget?.currency || 'TZS'}
        packageName={payTarget?.package?.name ? `${payTarget.package.name} Package` : undefined}
        onSuccess={handlePaymentSuccess}
      />

      {/* ================================================================= */}
      {/* Renewal Dialog */}
      {/* ================================================================= */}
      <Dialog open={!!renewTarget} onOpenChange={(open) => !open && setRenewTarget(null)}>
        <DialogContent className="sm:max-w-md bg-[#1a1d2e] border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                <RotateCcw className="h-4 w-4 text-teal-400" />
              </div>
              Renew Subscription
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Extend your subscription duration and optionally add audio recording.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Current package info */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Package</p>
                  <p className="text-base font-semibold text-white">
                    {renewTarget?.package.name} Package
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Current Amount</p>
                  <p className="text-base font-semibold text-white">
                    {renewTarget ? formatCurrency(renewTarget.amount) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-300">Duration</Label>
              <RadioGroup
                value={String(renewDuration)}
                onValueChange={(val) => setRenewDuration(Number(val))}
                className="grid grid-cols-4 gap-2"
              >
                {[
                  { value: '1', label: '1 Month' },
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={`duration-${opt.value}`}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      String(renewDuration) === opt.value
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                        : 'bg-white/5 border-white/[0.08] text-slate-400 hover:bg-white/[0.08] hover:text-slate-300'
                    }`}
                  >
                    <RadioGroupItem
                      value={opt.value}
                      id={`duration-${opt.value}`}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{opt.value}</span>
                    <span className="text-[10px] uppercase tracking-wide">{opt.label.replace(opt.value + ' ', '')}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Audio add-on */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Wifi className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Audio Add-on</p>
                  <p className="text-xs text-slate-400">Include professional audio recording</p>
                </div>
              </div>
              <Checkbox
                checked={renewAudio}
                onCheckedChange={(checked) => setRenewAudio(checked === true)}
                className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
              />
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/[0.08]">
              <p className="text-sm text-slate-400 mb-1">Renewal Summary</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {renewDuration} month{renewDuration > 1 ? 's' : ''}
                  {renewAudio ? ' + audio add-on' : ''}
                </span>
                <span className="text-sm font-semibold text-teal-400">Final amount calculated server-side</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRenewTarget(null)}
              className="text-slate-300 border-white/[0.08] hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenew}
              disabled={renewing}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
            >
              {renewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Renewing...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Renew Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================= */}
      {/* Cancel Confirmation Dialog */}
      {/* ================================================================= */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your{''}
              <span className="font-semibold text-slate-300">
                {cancelTarget?.package.name} Package
              </span>{''}
              subscription? This action cannot be undone. Your ringback tone ad will be removed from
              Vodacom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel disabled={cancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
