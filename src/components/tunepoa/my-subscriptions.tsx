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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Types                                                                     */
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
/* Helpers                                                                   */
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
  return method.replace(/_/g, ' ')
}

function getPaymentStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200'
}

/* ========================================================================= */
/* Status Badge Component                                                    */
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
      {label}: {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </Badge>
  )
}

/* ========================================================================= */
/* Main Component                                                            */
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
              <h1 className="text-2xl font-bold text-slate-900">My Subscriptions</h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                {subscriptions.length}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Manage your active subscriptions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No subscriptions yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Subscribe to a package to activate your ringback tone ad on Vodacom.
            </p>
            <Button
              className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white"
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

            return (
              <Card
                key={sub.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{sub.package.name} Package</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {STATUS_LABELS[sub.status] || sub.status}
                        </Badge>
                      </div>

                      {/* Detail grid */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{sub.request.businessName}</span>
                          <Badge variant="outline" className="text-xs text-slate-400 border-slate-200 shrink-0">
                            {sub.request.adType}
                          </Badge>
                        </div>
                        {sub.phoneNumber && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{sub.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Wifi className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Vodacom Tanzania</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-900">
                          <Banknote className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{formatCurrency(sub.amount)}</span>
                          <span className="text-slate-400 text-xs">
                            / {sub.package.durationMonths}mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
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
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
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
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9"
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
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-4 w-4 text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-700">Payment History</h4>
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
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-slate-100">
                                <TableHead className="text-xs text-slate-500 uppercase tracking-wide">
                                  Date
                                </TableHead>
                                <TableHead className="text-xs text-slate-500 uppercase tracking-wide">
                                  Amount
                                </TableHead>
                                <TableHead className="text-xs text-slate-500 uppercase tracking-wide">
                                  Method
                                </TableHead>
                                <TableHead className="text-xs text-slate-500 uppercase tracking-wide">
                                  Status
                                </TableHead>
                                <TableHead className="text-xs text-slate-500 uppercase tracking-wide">
                                  Reference
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment) => (
                                <TableRow key={payment.id} className="border-slate-50">
                                  <TableCell className="text-sm text-slate-700">
                                    {formatDate(payment.paidAt || payment.createdAt)}
                                  </TableCell>
                                  <TableCell className="font-semibold text-sm">
                                    {formatCurrency(payment.amount)}
                                  </TableCell>
                                  <TableCell className="text-sm text-slate-700">
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
                                  <TableCell className="text-sm text-slate-500 font-mono text-xs">
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
      {/* Cancel Confirmation Dialog                                         */}
      {/* ================================================================= */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your{' '}
              <span className="font-semibold text-slate-700">
                {cancelTarget?.package.name} Package
              </span>{' '}
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
