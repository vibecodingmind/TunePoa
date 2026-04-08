'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PlusCircle,
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Music2,
} from 'lucide-react'

interface ServiceRequest {
  id: string
  businessName: string
  adType: string
  status: string
  preferredLanguage: string
  createdAt: string
  user?: { name: string; businessName: string }
}

interface Subscription {
  id: string
  status: string
  amount: number
  currency: string
  startDate: string | null
  endDate: string | null
  paymentStatus: string
  package: { id: string; name: string }
  request: { id: string; businessName: string }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RECORDING: 'bg-purple-100 text-purple-700 border-purple-200',
  AWAITING_VERIFICATION: 'bg-orange-100 text-orange-700 border-orange-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RECORDING: 'Recording',
  AWAITING_VERIFICATION: 'Awaiting Review',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
}

export function UserDashboard() {
  const { currentUser, navigate } = useAppStore()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    const fetchData = async () => {
      try {
        const [reqRes, subRes] = await Promise.all([
          fetch(`/api/service-requests?userId=${currentUser.id}`),
          fetch(`/api/subscriptions?userId=${currentUser.id}`),
        ])
        const reqData = await reqRes.json()
        const subData = await subRes.json()
        setRequests(reqData.requests || [])
        setSubscriptions(subData.subscriptions || [])
      } catch (e) {
        console.error('Failed to fetch dashboard data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE').length
  const pendingRequests = requests.filter(r => ['PENDING', 'IN_PROGRESS', 'RECORDING', 'AWAITING_VERIFICATION'].includes(r.status)).length
  const totalSpent = subscriptions
    .filter(s => s.paymentStatus === 'PAID')
    .reduce((sum, s) => sum + s.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Music2 className="h-5 w-5" />
            <span className="text-emerald-100 text-sm font-medium">Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{currentUser?.name}</h1>
          <p className="text-emerald-100">{currentUser?.businessName}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              size="sm"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate('new-request')}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              New Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('packages')}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              View Packages
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{activeSubs}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  TZS {totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Service Requests */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Service Requests</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => navigate('my-requests')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No service requests yet</p>
              <Button
                variant="link"
                className="text-emerald-600 mt-2"
                onClick={() => navigate('new-request')}
              >
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map(req => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{req.businessName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {req.adType}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge className={statusColors[req.status] || ''} variant="outline">
                    {statusLabels[req.status] || req.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Subscriptions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Subscriptions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => navigate('subscriptions')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No subscriptions yet</p>
              <Button
                variant="link"
                className="text-emerald-600 mt-2"
                onClick={() => navigate('packages')}
              >
                Browse packages
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{sub.package.name} Package</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub.request.businessName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">TZS {sub.amount.toLocaleString()}</p>
                    <Badge
                      className={sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : sub.paymentStatus === 'UNPAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                      variant="outline"
                    >
                      {sub.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
