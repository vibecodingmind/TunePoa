'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  Activity,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Analytics {
  totalUsers: number
  activeSubscriptions: number
  pendingRequests: number
  completedRequests: number
  totalRevenue: number
  monthlyRevenue: number
  monthlyPayments: number
  usersByRole: { role: string; _count: number }[]
  subscriptionsByStatus: { status: string; _count: number }[]
  requestsByStatus: { status: string; _count: number }[]
  recentActivity: Activity[]
  packageRevenue: { name: string; amount: number }[]
}

interface Activity {
  id: string
  action: string
  entityType: string
  entityId: string
  details: string
  createdAt: string
  user?: { id: string; name: string }
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics')
        const data = await res.json()
        setAnalytics(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const maxPkgRevenue = Math.max(...analytics.packageRevenue.map(p => p.amount), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your TunePoa platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {analytics.usersByRole.filter(r => r.role === 'BUSINESS_OWNER').reduce((s, r) => s + r._count, 0)} businesses
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeSubscriptions}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {analytics.subscriptionsByStatus.find(s => s.status === 'PENDING')?._count || 0} pending
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">TZS {analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  TZS {analytics.monthlyRevenue.toLocaleString()} this month
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingRequests}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.completedRequests} completed
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Package Revenue */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Revenue by Package
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.packageRevenue.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No revenue data yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.packageRevenue.map(pkg => (
                  <div key={pkg.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{pkg.name}</span>
                      <span className="text-gray-500">TZS {pkg.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(pkg.amount / maxPkgRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Request Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.requestsByStatus.map(rs => (
                <div key={rs.status} className="flex items-center justify-between">
                  <Badge
                    className={
                      rs.status === 'COMPLETED' || rs.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      rs.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      rs.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }
                    variant="outline"
                  >
                    {rs.status}
                  </Badge>
                  <span className="font-semibold text-gray-900">{rs._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              analytics.recentActivity.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-700">
                      {(a.user?.name || 'S').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{a.user?.name || 'System'}</span>{' '}
                      <span className="text-gray-500">{a.action.toLowerCase()}</span>{' '}
                      <span className="text-gray-500">{a.entityType.toLowerCase()}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
