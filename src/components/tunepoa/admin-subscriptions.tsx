'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Search, Eye, RefreshCw, CreditCard, Radio, Loader2, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  mnoProvider: { id: string; name: string; code: string } | null
  package: { id: string; name: string }
  request: { id: string; businessName: string; adType: string }
  user: { id: string; name: string; email: string; businessName: string }
  payments: { id: string; amount: number; method: string; status: string; paidAt: string | null }[]
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
  REFUNDED: 'bg-gray-100 text-gray-600',
}

const mnoStatusColors: Record<string, string> = {
  NOT_SUBMITTED: 'bg-gray-100 text-gray-600',
  PENDING_MNO: 'bg-yellow-100 text-yellow-700',
  ACTIVE_MNO: 'bg-emerald-100 text-emerald-700',
  FAILED_MNO: 'bg-red-100 text-red-700',
  REMOVED_MNO: 'bg-gray-100 text-gray-600',
}

export function AdminSubscriptions() {
  const { token } = useAppStore()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [payFilter, setPayFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'M_PESA', reference: '' })

  const fetchSubscriptions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setSubscriptions(data.data.subscriptions || [])
      } else {
        console.error('Failed to fetch subscriptions:', data.error)
        setSubscriptions([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const filteredSubs = subscriptions.filter(s =>
    (!searchTerm ||
      s.user.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.package.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (payFilter === 'ALL' || s.paymentStatus === payFilter)
  )

  const handleUpdateSubscription = async (id: string, data: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast({ title: 'Updated', description: 'Subscription updated' })
        fetchSubscriptions()
        setDetailOpen(false)
        setPaymentOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedSub) return
    const amount = parseFloat(paymentForm.amount)
    if (!amount) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subscriptionId: selectedSub.id,
          amount,
          method: paymentForm.method,
          reference: paymentForm.reference,
        }),
      })
      if (res.ok) {
        toast({ title: 'Payment Recorded', description: `TZS ${amount.toLocaleString()} recorded` })
        fetchSubscriptions()
        setPaymentOpen(false)
        setDetailOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  /** Submit to Vodacom (hardcoded MNO provider) */
  const handleSubmitToMno = async () => {
    if (!selectedSub) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/mno-providers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const vodacom = (data.data?.providers || []).find(
        (p: { code: string }) => p.code === 'VODACOM'
      )
      if (!vodacom) {
        toast({ title: 'Error', description: 'Vodacom provider not found in database', variant: 'destructive' })
        return
      }
      const ref = `VOD-${Date.now().toString(36).toUpperCase()}`
      await handleUpdateSubscription(selectedSub.id, {
        mnoProviderId: vodacom.id,
        mnoReference: ref,
        mnoStatus: 'PENDING_MNO',
      })
      toast({ title: 'Submitted to Vodacom', description: `Reference: ${ref}` })
    } catch {
      toast({ title: 'Error', description: 'Failed to submit to Vodacom', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredSubs.length} subscriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubscriptions}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search subscriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredSubs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No subscriptions found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredSubs.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-gray-900">{sub.user.businessName}</p>
                        <Badge variant="outline" className="text-xs">{sub.package.name}</Badge>
                        <Badge className={subStatusColors[sub.status]} variant="outline">{sub.status}</Badge>
                        <Badge className={payStatusColors[sub.paymentStatus]} variant="outline">{sub.paymentStatus}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        TZS {sub.amount.toLocaleString()} &bull; {sub.user.name}
                        &bull; Vodacom
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedSub(sub); setDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedSub && (
            <>
              <DialogHeader>
                <DialogTitle>Subscription Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Business:</span> <span className="font-medium">{selectedSub.user.businessName}</span></div>
                  <div><span className="text-gray-500">Client:</span> <span className="font-medium">{selectedSub.user.name}</span></div>
                  <div><span className="text-gray-500">Package:</span> <span className="font-medium">{selectedSub.package.name}</span></div>
                  <div><span className="text-gray-500">Amount:</span> <span className="font-medium">TZS {selectedSub.amount.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedSub.phoneNumber || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Network:</span> <span className="font-medium">Vodacom Tanzania</span></div>
                  <div><span className="text-gray-500">Vodacom Ref:</span> <span className="font-medium">{selectedSub.mnoReference || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Auto Renew:</span> <span className="font-medium">{selectedSub.autoRenew ? 'Yes' : 'No'}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={subStatusColors[selectedSub.status]} variant="outline">Status: {selectedSub.status}</Badge>
                  <Badge className={payStatusColors[selectedSub.paymentStatus]} variant="outline">Payment: {selectedSub.paymentStatus}</Badge>
                  <Badge className={mnoStatusColors[selectedSub.mnoStatus] || 'bg-gray-100 text-gray-600'} variant="outline">Vodacom: {selectedSub.mnoStatus}</Badge>
                </div>
                {selectedSub.payments.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Payment History:</span>
                    <div className="mt-1 space-y-1">
                      {selectedSub.payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>TZS {p.amount.toLocaleString()} ({p.method})</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</Badge>
                            {p.paidAt && <span className="text-xs text-gray-400">{new Date(p.paidAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {selectedSub.paymentStatus === 'UNPAID' && (
                  <Button variant="outline" size="sm" onClick={() => { setPaymentForm({ amount: String(selectedSub.amount), method: 'M_PESA', reference: '' }); setPaymentOpen(true); }}>
                    <DollarSign className="h-4 w-4 mr-1" /> Record Payment
                  </Button>
                )}
                {selectedSub.mnoStatus === 'NOT_SUBMITTED' && selectedSub.paymentStatus === 'PAID' && (
                  <Button variant="outline" size="sm" disabled={actionLoading} onClick={handleSubmitToMno}>
                    <Radio className="h-4 w-4 mr-1" /> Submit to Vodacom
                  </Button>
                )}
                {selectedSub.mnoStatus === 'PENDING_MNO' && (
                  <Button size="sm" className="bg-emerald-600" onClick={() => handleUpdateSubscription(selectedSub.id, { mnoStatus: 'ACTIVE_MNO' })}>
                    Activate on Vodacom
                  </Button>
                )}
                {selectedSub.status !== 'CANCELLED' && (
                  <Button variant="destructive" size="sm" onClick={() => handleUpdateSubscription(selectedSub.id, { status: 'CANCELLED' })}>
                    Cancel
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (TZS)</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm(p => ({ ...p, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M_PESA">M-Pesa</SelectItem>
                  <SelectItem value="TIGO_PESA">Tigo Pesa</SelectItem>
                  <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference (Optional)</Label>
              <Input value={paymentForm.reference} onChange={(e) => setPaymentForm(p => ({ ...p, reference: e.target.value }))} placeholder="Transaction reference" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600" disabled={actionLoading} onClick={handleRecordPayment}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
