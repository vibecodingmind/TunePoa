'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CreditCard,
  Smartphone,
  Wallet,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Types */
/* ========================================================================= */

interface Gateway {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface PaymentGatewayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptionId: string
  amount: number
  currency?: string
  packageName?: string
  onSuccess?: () => void
}

/* ========================================================================= */
/* Gateway icon + style map */
/* ========================================================================= */

const GATEWAY_STYLES: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  shadow: string
  bgLight: string
  badge: string
}> = {
  pesapal: {
    icon: Smartphone,
    gradient: 'from-green-500 to-emerald-400',
    shadow: 'shadow-green-500/20',
    bgLight: 'bg-green-500/10',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  stripe: {
    icon: CreditCard,
    gradient: 'from-indigo-500 to-violet-400',
    shadow: 'shadow-indigo-500/20',
    bgLight: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  paypal: {
    icon: Wallet,
    gradient: 'from-amber-500 to-yellow-400',
    shadow: 'shadow-amber-500/20',
    bgLight: 'bg-amber-500/10',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
}

function formatCurrency(amount: number, currency?: string): string {
  const cur = currency || 'TZS'
  return `${cur} ${amount.toLocaleString()}`
}

/* ========================================================================= */
/* Main Component */
/* ========================================================================= */

export function PaymentGatewayDialog({
  open,
  onOpenChange,
  subscriptionId,
  amount,
  currency = 'TZS',
  packageName,
  onSuccess,
}: PaymentGatewayDialogProps) {
  const { toast } = useToast()

  const [gateways, setGateways] = useState<Gateway[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)
  const [initiating, setInitiating] = useState(false)

  /* ---- Fetch available gateways ---- */

  const fetchGateways = useCallback(async () => {
    if (!open) return

    setLoading(true)
    setFetchError(null)
    setSelectedGateway(null)

    try {
      const res = await fetch('/api/payments/gateways')
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch payment gateways')
      }

      const enabled = (data.data?.gateways || []).filter((g: Gateway) => g.enabled)
      setGateways(enabled)

      if (enabled.length === 0) {
        setFetchError('No payment gateways are currently available. Please contact support.')
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load payment options')
    } finally {
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    fetchGateways()
  }, [fetchGateways])

  /* ---- Initiate payment ---- */

  const handlePay = async () => {
    if (!selectedGateway || !subscriptionId) return

    setInitiating(true)

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          gateway: selectedGateway,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Payment Failed',
          description: data.error || 'Failed to initiate payment. Please try again.',
          variant: 'destructive',
        })
        return
      }

      const redirectUrl = data.data?.redirectUrl

      if (redirectUrl) {
        toast({
          title: 'Redirecting to Payment',
          description: `You will be redirected to complete your payment via ${selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1)}.`,
        })
        // Redirect to gateway checkout
        window.location.href = redirectUrl
      } else {
        toast({
          title: 'Payment Initiated',
          description: 'Your payment has been initiated. You can check the status in your subscriptions.',
        })
        onOpenChange(false)
        onSuccess?.()
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setInitiating(false)
    }
  }

  /* ---- Reset on close ---- */

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedGateway(null)
    }
    onOpenChange(open)
  }

  /* ---- Render ---- */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg glass-card border-white/[0.06] bg-[#0a1628]/95 backdrop-blur-xl p-0 overflow-hidden">
        {/* Gradient accent */}
        <div className="h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-extrabold">Choose Payment Method</div>
                <div className="text-sm font-normal text-slate-400 mt-0.5">
                  Complete your subscription payment
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Amount summary */}
          <div className="glass-subtle rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Package</span>
              <span className="text-sm font-semibold text-slate-200">{packageName || 'Subscription'}</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Amount Due</span>
              <span className="text-lg font-extrabold text-white">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Loading payment options...
              </p>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Error state */}
          {fetchError && !loading && (
            <Alert variant="destructive" className="border-0 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-300">
                {fetchError}
              </AlertDescription>
            </Alert>
          )}

          {/* Gateway options */}
          {!loading && !fetchError && gateways.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available Payment Methods
              </p>

              {gateways.map((gateway) => {
                const style = GATEWAY_STYLES[gateway.id] || GATEWAY_STYLES.stripe
                const Icon = style.icon
                const isSelected = selectedGateway === gateway.id

                return (
                  <button
                    key={gateway.id}
                    onClick={() => setSelectedGateway(gateway.id)}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                      cursor-pointer text-left group
                      ${isSelected
                        ? 'border-teal-500/50 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div
                      className={`
                        h-11 w-11 rounded-lg flex items-center justify-center shrink-0
                        transition-all duration-300
                        ${isSelected
                          ? `bg-gradient-to-br ${style.gradient} text-white shadow-lg ${style.shadow}`
                          : `${style.bgLight} text-slate-400 group-hover:text-white`
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {gateway.name}
                        </span>
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase ${style.badge}`}>
                          {gateway.description}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pay securely with {gateway.name}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <div className={`
                      h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0
                      transition-all duration-300
                      ${isSelected
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-white/20'
                      }
                    `}>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Security note */}
          <div className="flex items-center gap-2 px-1">
            <Shield className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05]"
              onClick={() => handleClose(false)}
              disabled={initiating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className={`
                flex-1 h-11 rounded-xl font-bold transition-all duration-300
                ${selectedGateway
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }
              `}
              onClick={handlePay}
              disabled={!selectedGateway || initiating}
            >
              {initiating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
