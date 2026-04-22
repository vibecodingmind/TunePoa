'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  Activity,
  DollarSign,
  BarChart3,
  Sparkles,
} from 'lucide-react'

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

/* ─── Admin Stat Card ─── */
interface AdminStatCardProps {
  label: string
  value: string | number
  sub: string
  subColor?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  iconBg: string
  iconColor: string
}

function AdminStatCard({ label, value, sub, subColor = 'text-emerald-600', icon: Icon, gradient, iconBg, iconColor }: AdminStatCardProps) {
  return (
    <div className="card-premium border-0 bg-white group overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className={`text-xs ${subColor} font-medium mt-1`}>{sub}</p>
          </div>
          <div className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </div>
  )
}

export function AdminDashboard() {
  const { token } = useAppStore()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setAnalytics(data.data || data)
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
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48 rounded-lg bg-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[116px] rounded-xl bg-slate-100" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl bg-slate-100" />
          <Skeleton className="h-72 rounded-2xl bg-slate-100" />
        </div>
      </div>
    )
  }

  const safe = {
    totalUsers: analytics.totalUsers ?? 0,
    activeSubscriptions: analytics.activeSubscriptions ?? 0,
    pendingRequests: analytics.pendingRequests ?? 0,
    completedRequests: analytics.completedRequests ?? 0,
    totalRevenue: analytics.totalRevenue ?? 0,
    monthlyRevenue: analytics.monthlyRevenue ?? 0,
    monthlyPayments: analytics.monthlyPayments ?? 0,
  }
  const pkgRevenue = analytics.packageRevenue || []
  const maxPkgRevenue = pkgRevenue.length > 0 ? Math.max(...pkgRevenue.map(p => p.amount), 1) : 1
  const usersByRole = analytics.usersByRole || []
  const subsByStatus = analytics.subscriptionsByStatus || []
  const reqsByStatus = analytics.requestsByStatus || []
  const recentActivity = analytics.recentActivity || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Overview of your TunePoa platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Users"
          value={safe.totalUsers}
          sub={`${usersByRole.filter(r => r.role === 'BUSINESS_OWNER').reduce((s, r) => s + r._count, 0)} businesses`}
          icon={Users}
          gradient="from-emerald-400 to-teal-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <AdminStatCard
          label="Active Subscriptions"
          value={safe.activeSubscriptions}
          sub={`${subsByStatus.find(s => s.status === 'PENDING')?._count || 0} pending`}
          icon={CreditCard}
          gradient="from-teal-400 to-cyan-500"
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <AdminStatCard
          label="Total Revenue"
          value={`TZS ${safe.totalRevenue.toLocaleString()}`}
          sub={`TZS ${safe.monthlyRevenue.toLocaleString()} this month`}
          icon={DollarSign}
          gradient="from-amber-400 to-orange-500"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <AdminStatCard
          label="Pending Requests"
          value={safe.pendingRequests}
          sub={`${safe.completedRequests} completed`}
          subColor="text-slate-400"
          icon={Clock}
          gradient="from-violet-400 to-purple-500"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Package Revenue */}
        <Card className="card-premium-static border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 px-6 pt-6">
            <CardTitle className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              Revenue by Package
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {pkgRevenue.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No revenue data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pkgRevenue.map((pkg) => {
                  const pct = (pkg.amount / maxPkgRevenue) * 100
                  return (
                    <div key={pkg.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{pkg.name}</span>
                        <span className="text-slate-400 text-xs font-medium">TZS {pkg.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Status Distribution */}
        <Card className="card-premium-static border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 px-6 pt-6">
            <CardTitle className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              Request Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {reqsByStatus.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No request data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reqsByStatus.map((rs) => {
                  const statusColor = rs.status === 'COMPLETED' || rs.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200/80'
                    : rs.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700 border-amber-200/80'
                      : rs.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700 border-red-200/80'
                        : 'bg-sky-100 text-sky-700 border-sky-200/80'
                  return (
                    <div key={rs.status} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <Badge
                        className={`${statusColor} rounded-lg font-medium text-[12px]`}
                        variant="outline"
                      >
                        {rs.status}
                      </Badge>
                      <span className="font-semibold text-slate-900 text-sm">{rs._count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-premium-static border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 px-6 pt-6">
          <CardTitle className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-1">
            {recentActivity.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100/80">
                    <span className="text-[11px] font-semibold">
                      {(a.user?.name || 'S').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">{a.user?.name || 'System'}</span>{' '}
                      <span className="text-slate-400">{a.action.toLowerCase()}</span>{' '}
                      <span className="text-slate-400">{a.entityType.toLowerCase()}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
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
