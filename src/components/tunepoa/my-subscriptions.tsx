'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCard, RefreshCw, ArrowLeft } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  amount: number
  currency: string
  paymentStatus: string
  mnoStatus: string
  mnoReference: string | null
  phoneNumber: string | null
  startDate: string | null
  endDate: string | null
  autoRenew: boolean
  package: { id: string; name: string; price: number; durationMonths: number }
  request: { id: string; businessName: string; adType: string }
  mnoProvider: { id: string; name: string; code: string } | null
  payments: { id: string; amount: number; method: string; status: string; paidAt: string | null; reference: string | null }[]
}

const subStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
}

const payStatusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  UNPAID: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

const mnoStatusColors: Record<string, string> = {
  NOT_SUBMITTED: 'bg-gray-100 text-gray-600',
  PENDING_MNO: 'bg-yellow-100 text-yellow-700',
  ACTIVE_MNO: 'bg-emerald-100 text-emerald-700',
  FAILED_MNO: 'bg-red-100 text-red-700',
  REMOVED_MNO: 'bg-gray-100 text-gray-600',
}

export function MySubscriptions() {
  const { currentUser, navigate } = useAppStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubscriptions = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/subscriptions?userId=${currentUser.id}`)
      const data = await res.json()
      setSubscriptions(data.subscriptions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubscriptions() }, [currentUser])

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
            <p className="text-gray-500 text-sm mt-1">{subscriptions.length} subscriptions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubscriptions}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('packages')}>
            <CreditCard className="h-4 w-4 mr-2" /> Browse Packages
          </Button>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-gray-400">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No subscriptions yet</p>
            <p className="text-sm mt-1">Subscribe to a package to activate your ringback tone</p>
            <Button className="mt-4 bg-emerald-600" onClick={() => navigate('packages')}>
              View Packages
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <Card key={sub.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{sub.package.name} Package</h3>
                      <Badge className={subStatusColors[sub.status]} variant="outline">{sub.status}</Badge>
                      <Badge className={payStatusColors[sub.paymentStatus]} variant="outline">{sub.paymentStatus}</Badge>
                      <Badge className={mnoStatusColors[sub.mnoStatus]} variant="outline">{sub.mnoStatus.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>📦 {sub.request.businessName} ({sub.request.adType})</p>
                      <p>💰 TZS {sub.amount.toLocaleString()} for {sub.package.durationMonths} month{sub.package.durationMonths > 1 ? 's' : ''}</p>
                      {sub.mnoProvider && <p>📱 {sub.mnoProvider.name} {sub.mnoReference && `• Ref: ${sub.mnoReference}`}</p>}
                      {sub.phoneNumber && <p>📞 Ringback on: {sub.phoneNumber}</p>}
                      {sub.startDate && <p>📅 {new Date(sub.startDate).toLocaleDateString()} - {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</p>}
                    </div>
                    {sub.payments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Payment History:</p>
                        <div className="space-y-1">
                          {sub.payments.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                TZS {p.amount.toLocaleString()} via {p.method.replace(/_/g, ' ')}
                                {p.reference && ` (${p.reference})`}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`} variant="outline">{p.status}</Badge>
                                {p.paidAt && <span className="text-gray-400">{new Date(p.paidAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
