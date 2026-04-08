'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Star, Crown, Zap, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

const pkgIcons: Record<string, React.ReactNode> = {
  Bronze: <Shield className="h-6 w-6 text-orange-500" />,
  Silver: <Star className="h-6 w-6 text-gray-400" />,
  Gold: <Crown className="h-6 w-6 text-yellow-500" />,
  Platinum: <Zap className="h-6 w-6 text-emerald-500" />,
}

const pkgColors: Record<string, string> = {
  Bronze: 'border-orange-200 bg-gradient-to-br from-orange-50 to-white',
  Silver: 'border-gray-200 bg-gradient-to-br from-gray-50 to-white',
  Gold: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white',
  Platinum: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-500',
}

export function PackagesPage() {
  const { currentUser, navigate } = useAppStore()
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([])
  const [subscribeDialog, setSubscribeDialog] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [selectedRequest, setSelectedRequest] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, reqRes] = await Promise.all([
          fetch('/api/packages'),
          currentUser ? fetch(`/api/service-requests?userId=${currentUser.id}`) : Promise.resolve({ json: () => Promise.resolve({ requests: [] }) }),
        ])
        const pkgData = await pkgRes.json()
        const reqData = await reqRes.json()
        setPackages(pkgData.packages || [])
        setUserRequests(reqData.requests || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  const eligibleRequests = userRequests.filter(r =>
    ['APPROVED', 'COMPLETED'].includes(r.status)
  )

  const handleSubscribe = (pkg: Package) => {
    if (!currentUser) {
      navigate('landing')
      return
    }
    setSelectedPkg(pkg)
    setSelectedRequest('')
    setPhoneNumber(currentUser.phone || '')
    setSubscribeDialog(true)
  }

  const confirmSubscribe = async () => {
    if (!selectedPkg || !selectedRequest || !currentUser) return

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          packageId: selectedPkg.id,
          requestId: selectedRequest,
          phoneNumber,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to subscribe', variant: 'destructive' })
        return
      }

      toast({ title: 'Subscription Created!', description: `You've subscribed to the ${selectedPkg.name} package. Please complete payment.` })
      setSubscribeDialog(false)
      navigate('subscriptions')
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Packages</h1>
        <p className="text-gray-500 text-sm mt-1">Choose the perfect package for your ringback tone advertising needs</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map(pkg => {
          const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
          return (
            <Card key={pkg.id} className={`relative ${pkgColors[pkg.name] || 'border-gray-200'}`}>
              {pkg.name === 'Platinum' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pkgIcons[pkg.name]}
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  </div>
                  {pkg._count && (
                    <Badge variant="secondary" className="text-xs">
                      {pkg._count.subscriptions} active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold text-gray-900">TZS {pkg.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500"> / {pkg.durationMonths} month{pkg.durationMonths > 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm text-gray-500">{pkg.description}</p>
                <ul className="space-y-2">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${pkg.name === 'Platinum' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  variant={pkg.name === 'Platinum' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(pkg)}
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={subscribeDialog} onOpenChange={setSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPkg?.name} Package</DialogTitle>
            <DialogDescription>
              TZS {selectedPkg?.price?.toLocaleString()} for {selectedPkg?.durationMonths} month{selectedPkg && selectedPkg.durationMonths > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Service Request</Label>
              {eligibleRequests.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  You need at least one approved service request to subscribe. Create and get a request approved first.
                </p>
              ) : (
                <select
                  value={selectedRequest}
                  onChange={(e) => setSelectedRequest(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
                >
                  <option value="">Choose a request...</option>
                  {eligibleRequests.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.businessName} - {r.adType}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Phone Number (Ringback Tone)</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+2557XXXXXXXX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeDialog(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!selectedRequest || subscribing}
              onClick={confirmSubscribe}
            >
              {subscribing ? 'Subscribing...' : 'Confirm Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
