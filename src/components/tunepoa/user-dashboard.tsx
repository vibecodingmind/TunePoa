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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  Clock,
  Wallet,
  Radio,
  Phone,
  PlusCircle,
  Package,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

/* ========================================================================= */
/* Types                                                                     */
/* ========================================================================= */

interface ServiceRequest {
  id: string
  businessName: string
  adType: string
  status: string
  createdAt: string
}

interface Subscription {
  id: string
  status: string
  mnoStatus: string
  paymentStatus: string
  phoneNumber: string | null
  startDate: string | null
  endDate: string | null
  amount: number
  package: { id: string; name: string; price: number; durationMonths: number }
  mnoProvider: { id: string; name: string } | null
}

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
}

/* ========================================================================= */
/* Helpers                                                                   */
/* ========================================================================= */

function formatCurrency(amount: number): string {
  return `TZS ${amount.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function shortenId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)))
}

/* ========================================================================= */
/* Stats Card Sub-component                                                  */
/* ========================================================================= */

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  iconBg: string
  iconColor: string
  trend?: string
}

function StatCard({ label, value, icon: Icon, gradient, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="card-premium border-0 bg-white group overflow-hidden relative">
      {/* Top gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div
            className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </div>
  )
}

/* ========================================================================= */
/* Main Component                                                            */
/* ========================================================================= */

export function UserDashboard() {
  const { user, token, navigate } = useAppStore()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user || !token) return

    setLoading(true)
    setError(null)

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const [reqRes, subRes, payRes] = await Promise.all([
        fetch(`/api/service-requests?userId=${user.id}`, { headers }),
        fetch(`/api/subscriptions?userId=${user.id}`, { headers }),
        fetch(`/api/payments?userId=${user.id}`, { headers }),
      ])

      const reqData = await reqRes.json()
      const subData = await subRes.json()
      const payData = await payRes.json()

      if (!reqRes.ok || !reqData.success) throw new Error(reqData.error || 'Failed to fetch requests')
      if (!subRes.ok || !subData.success) throw new Error(subData.error || 'Failed to fetch subscriptions')
      if (!payRes.ok || !payData.success) throw new Error(payData.error || 'Failed to fetch payments')

      setRequests(reqData.data?.requests || [])
      setSubscriptions(subData.data?.subscriptions || [])
      setPayments(payData.data?.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  /* ---- Computed stats ---- */

  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE').length
  const pendingRequests = requests.filter((r) =>
    ['PENDING', 'IN_PROGRESS', 'RECORDING', 'AWAITING_VERIFICATION'].includes(r.status),
  ).length
  const totalSpent = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)
  const activeAds = subscriptions.filter((s) => s.mnoStatus === 'ACTIVE_MNO').length

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const activeSubscriptions = subscriptions
    .filter((s) => ['ACTIVE', 'PENDING'].includes(s.status))
    .slice(0, 3)

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Banner skeleton */}
        <Skeleton className="h-48 w-full rounded-2xl bg-slate-100" />
        {/* Stats skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-xl bg-slate-100" />
          ))}
        </div>
        {/* Table skeleton */}
        <Skeleton className="h-72 rounded-xl bg-slate-100" />
        {/* Subscription cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Render: Error ---- */

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  /* ---- Render: Dashboard ---- */

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ================================================================= */}
      {/* Welcome Banner                                                     */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-6 sm:p-8 text-white">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white/20 rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/15 rounded-full" />
        <div className="absolute bottom-1/4 right-1/2 w-8 h-8 bg-white/10 rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-2 text-emerald-100 text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-lg">
            {user?.businessName
              ? `Manage your ads and subscriptions for ${user.businessName}`
              : 'Your business dashboard is ready'}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              size="sm"
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-md shadow-emerald-900/10 font-medium rounded-xl"
              onClick={() => navigate('new-request')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Service Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10 bg-white/10 rounded-xl backdrop-blur-sm"
              onClick={() => navigate('packages')}
            >
              <Package className="h-4 w-4 mr-2" />
              Browse Packages
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Stats Cards                                                        */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscriptions"
          value={activeSubs}
          icon={CreditCard}
          gradient="from-emerald-400 to-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={activeSubs > 0 ? `${activeSubs} running` : undefined}
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          gradient="from-amber-400 to-amber-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          icon={Wallet}
          gradient="from-sky-400 to-sky-600"
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          label="Active Ads"
          value={activeAds}
          icon={Radio}
          gradient="from-violet-400 to-violet-600"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
      </div>

      {/* ================================================================= */}
      {/* Recent Service Requests                                            */}
      {/* ================================================================= */}
      <Card className="card-premium-static border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold text-slate-900">Recent Service Requests</CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">Your latest ad creation requests</p>
            </div>
            {requests.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[13px] rounded-lg"
                onClick={() => navigate('my-requests')}
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">No service requests yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first ringback tone ad request</p>
              <Button
                variant="link"
                className="text-emerald-600 mt-1 text-sm"
                onClick={() => navigate('new-request')}
              >
                Get started
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">ID</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Business</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Type</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Status</TableHead>
                      <TableHead className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequests.map((req) => (
                      <TableRow
                        key={req.id}
                        className="cursor-pointer hover:bg-slate-50/50 transition-colors border-slate-50 group"
                        onClick={() => navigate('my-requests')}
                      >
                        <TableCell className="font-mono text-xs text-slate-400">
                          {shortenId(req.id)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 text-sm">{req.businessName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-slate-500 border-slate-200 text-xs font-medium rounded-md">
                            {req.adType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'} text-xs font-medium rounded-md`}
                          >
                            {STATUS_LABELS[req.status] || req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">{formatDate(req.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-2">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate('my-requests')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{req.businessName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 rounded-md">
                          {req.adType}
                        </Badge>
                        <span className="text-xs text-slate-400">{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge
                        variant="outline"
                        className={`${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600 border-slate-200'} text-xs rounded-md`}
                      >
                        {STATUS_LABELS[req.status] || req.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Active Subscriptions                                               */}
      {/* ================================================================= */}
      <Card className="card-premium-static border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold text-slate-900">Active Subscriptions</CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">Currently running ringback tone plans</p>
            </div>
            {subscriptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[13px] rounded-lg"
                onClick={() => navigate('subscriptions')}
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">No active subscriptions</p>
              <p className="text-slate-400 text-sm mt-1">Subscribe to a package to activate your ad</p>
              <Button
                variant="link"
                className="text-emerald-600 mt-1 text-sm"
                onClick={() => navigate('packages')}
              >
                Browse packages
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-300 group bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 text-sm">{sub.package.name}</h3>
                    <Badge
                      variant="outline"
                      className={`${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-600 border-slate-200'} text-xs font-medium rounded-md`}
                    >
                      {STATUS_LABELS[sub.status] || sub.status}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(sub.amount)}
                      </span>
                    </div>
                    {sub.phoneNumber && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{sub.phoneNumber}</span>
                      </div>
                    )}
                    {sub.mnoProvider && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 rounded-md">
                          {sub.mnoProvider.name}
                        </Badge>
                        {sub.mnoStatus && (
                          <Badge
                            variant="outline"
                            className={`${STATUS_COLORS[sub.mnoStatus] || 'bg-slate-100 text-slate-600 border-slate-200'} text-xs rounded-md`}
                          >
                            {STATUS_LABELS[sub.mnoStatus] || sub.mnoStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                    {sub.endDate && (
                      <p className="text-slate-400 text-xs pt-2 border-t border-slate-50">
                        {sub.status === 'ACTIVE'
                          ? `Expires in ${daysUntil(sub.endDate)} days`
                          : `Expires ${formatDate(sub.endDate)}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Quick Actions                                                      */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white h-12 font-medium rounded-xl shadow-md shadow-emerald-500/10 group"
          onClick={() => navigate('new-request')}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Service Request
          <ArrowRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 h-12 font-medium rounded-xl"
          onClick={() => navigate('packages')}
        >
          <Package className="h-4 w-4 mr-2" />
          Browse Packages
        </Button>
      </div>
    </div>
  )
}
