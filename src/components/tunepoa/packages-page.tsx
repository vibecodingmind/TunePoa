'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { PricingCalculator } from './pricing-calculator'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PackagesPage() {
  const { user, token, navigate } = useAppStore()
  const { toast } = useToast()
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = useCallback(async (data: {
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
  }, [user, token, navigate, toast])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Packages & Pricing</h1>
        <p className="text-slate-500 text-sm mt-1">
          Select the number of users and duration to get instant pricing, then subscribe.
        </p>
      </div>

      {/* Pricing Calculator in Subscribe Mode */}
      <PricingCalculator mode="subscribe" onSubscribe={handleSubscribe} isAuthenticated={true} />

      {subscribing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium text-slate-700">Processing subscription...</p>
          </Card>
        </div>
      )}
    </div>
  )
}
