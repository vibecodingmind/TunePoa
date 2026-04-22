'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  CreditCard,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  UserPlus,
} from 'lucide-react'

/* ─── Types ─── */
interface AnalyticsData {
  overview: {
    totalUsers: number
    activeSubscriptions: number
    totalRevenue: number
    pendingRequests: number
  }
  revenue: { month: string; revenue: number }[]
  subscriptions: {
    byStatus: Record<string, number>
    byTier: { name: string; count: number }[]
  }
  users: {
    byRole: Record<string, number>
    byStatus: Record<string, number>
    newUsers: { month: string; count: number }[]
  }
  requests: {
    byStatus: Record<string, number>
    byCategory: Record<string, number>
  }
  payments: {
    byMethod: Record<string, number>
    byStatus: Record<string, number>
  }
  recentActivity: {
    id: string
    action: string
    entityType: string
    entityId: string | null
    details: string
    createdAt: string
    user?: { id: string; name: string } | null
  }[]
}

/* ─── Helpers ─── */
function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ').format(amount)
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(parseInt(year), parseInt(m) - 1)
  return date.toLocaleString('en', { month: 'short', year: '2-digit' })
}

/* ─── Status color config ─── */
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/25',
  EXPIRED: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
  SUSPENDED: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  COMPLETED: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/25',
  UNPAID: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  PAID: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  OVERDUE: 'bg-red-500/15 text-red-400 border-red-500/25',
  REFUNDED: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  INACTIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

/* ─── KPI Card ─── */
function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
  delay,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  iconBg: string
  iconColor: string
  delay: string
}) {
  return (
    <div className={cn('glass-card border-0 overflow-hidden relative group animate-fade-in-up', delay)}>
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r', gradient, 'opacity-0 group-hover:opacity-100 transition-opacity duration-300')} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className={cn('text-xs font-medium mt-1', iconColor)}>{sub}</p>
          </div>
          <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton State ─── */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded-lg bg-white/[0.05]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl bg-white/[0.05]" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl bg-white/[0.05]" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl bg-white/[0.05]" />
        <Skeleton className="h-72 rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function AdminAnalyticsPage() {
  const { token } = useAppStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // ─── CSV Export ───
  const handleExport = () => {
    if (!data) return

    const rows: string[] = []

    // Overview
    rows.push('Overview')
    rows.push('Metric,Value')
    rows.push(`Total Users,${data.overview.totalUsers}`)
    rows.push(`Active Subscriptions,${data.overview.activeSubscriptions}`)
    rows.push(`Total Revenue (TZS),${data.overview.totalRevenue}`)
    rows.push(`Pending Requests,${data.overview.pendingRequests}`)
    rows.push('')

    // Revenue
    rows.push('Monthly Revenue')
    rows.push('Month,Revenue (TZS)')
    for (const r of data.revenue) {
      rows.push(`${r.month},${r.revenue}`)
    }
    rows.push('')

    // Subscriptions by status
    rows.push('Subscriptions by Status')
    rows.push('Status,Count')
    for (const [status, count] of Object.entries(data.subscriptions.byStatus)) {
      rows.push(`${status},${count}`)
    }
    rows.push('')

    // Users by role
    rows.push('Users by Role')
    rows.push('Role,Count')
    for (const [role, count] of Object.entries(data.users.byRole)) {
      rows.push(`${role},${count}`)
    }
    rows.push('')

    // Requests by status
    rows.push('Requests by Status')
    rows.push('Status,Count')
    for (const [status, count] of Object.entries(data.requests.byStatus)) {
      rows.push(`${status},${count}`)
    }

    const csv = rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tunepoa-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !data) {
    return <AnalyticsSkeleton />
  }

  const { overview, revenue, subscriptions, users, requests, payments, recentActivity } = data

  // Revenue chart data
  const maxRevenue = revenue.length > 0 ? Math.max(...revenue.map((r) => r.revenue), 1) : 1

  // User growth
  const maxNewUsers = users.newUsers.length > 0 ? Math.max(...users.newUsers.map((u) => u.count), 1) : 1
  const latestMonth = users.newUsers[users.newUsers.length - 1]
  const prevMonth = users.newUsers[users.newUsers.length - 2]
  const growthPct = prevMonth && prevMonth.count > 0
    ? Math.round(((latestMonth?.count || 0) - prevMonth.count) / prevMonth.count * 100)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
            <p className="text-sm text-slate-400 mt-0.5">Comprehensive platform performance overview</p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          className="bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/25 gap-2 text-sm font-medium transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* ─── Top Row: KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Users"
          value={overview.totalUsers}
          sub={`${growthPct >= 0 ? '+' : ''}${growthPct}% this month`}
          icon={Users}
          gradient="from-teal-400 to-cyan-500"
          iconBg="bg-teal-500/10"
          iconColor="text-teal-400"
          delay="animation-delay-100"
        />
        <KPICard
          label="Active Subscriptions"
          value={overview.activeSubscriptions}
          sub={`${subscriptions.byStatus.PENDING || 0} pending`}
          icon={CreditCard}
          gradient="from-cyan-400 to-cyan-500"
          iconBg="bg-cyan-500/10"
          iconColor="text-cyan-400"
          delay="animation-delay-200"
        />
        <KPICard
          label="Total Revenue"
          value={`TZS ${formatTZS(overview.totalRevenue)}`}
          sub="All-time revenue"
          icon={DollarSign}
          gradient="from-amber-400 to-orange-500"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          delay="animation-delay-300"
        />
        <KPICard
          label="Pending Requests"
          value={overview.pendingRequests}
          sub={`${requests.byStatus.APPROVED || 0} approved`}
          icon={Clock}
          gradient="from-violet-400 to-purple-500"
          iconBg="bg-violet-500/10"
          iconColor="text-violet-400"
          delay="animation-delay-400"
        />
      </div>

      {/* ─── Revenue Chart ─── */}
      <div className="glass-card p-6 animate-fade-in-up animation-delay-300">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-teal-400" />
          </div>
          <h2 className="text-lg font-semibold gradient-text">Monthly Revenue</h2>
        </div>

        {revenue.every((r) => r.revenue === 0) ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">No revenue data yet</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-[200px] sm:h-[240px]">
            {revenue.map((r) => {
              const height = r.revenue > 0 ? Math.max((r.revenue / maxRevenue) * 100, 3) : 3
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5 group min-w-0">
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 glass-strong px-2 py-1 rounded-md z-10 text-[10px] text-white whitespace-nowrap pointer-events-none">
                    TZS {formatTZS(r.revenue)}
                  </div>
                  <div
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-teal-500/80 to-cyan-400/80 transition-all duration-500 hover:from-teal-400 hover:to-cyan-300 relative min-h-[3px]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-slate-500 truncate w-full text-center">
                    {formatMonthLabel(r.month)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── Subscription Breakdown ─── */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-400">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold gradient-text">Subscriptions</h2>
          </div>

          {/* Status distribution */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">By Status</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(subscriptions.byStatus).map(([status, count]) => {
                const style = STATUS_STYLE[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                return (
                  <Badge key={status} className={cn('rounded-lg font-medium text-xs border px-3 py-1', style)} variant="outline">
                    {status} <span className="ml-1.5 font-bold">{count}</span>
                  </Badge>
                )
              })}
              {Object.keys(subscriptions.byStatus).length === 0 && (
                <span className="text-sm text-slate-500">No subscriptions yet</span>
              )}
            </div>
          </div>

          {/* Tier distribution */}
          {subscriptions.byTier.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">By Tier</h3>
              <div className="space-y-2.5">
                {subscriptions.byTier.map((tier) => {
                  const total = subscriptions.byTier.reduce((s, t) => s + t.count, 0) || 1
                  const pct = Math.round((tier.count / total) * 100)
                  return (
                    <div key={tier.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">{tier.name}</span>
                        <span className="text-slate-400 text-xs">{tier.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── User Growth ─── */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold gradient-text">User Growth</h2>
          </div>

          {users.newUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">No user growth data</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto scrollbar-thin pr-1">
              {users.newUsers.map((entry) => {
                const prev = users.newUsers.find(
                  (u) => u.month === String(
                    (() => {
                      const [y, m] = entry.month.split('-')
                      const d = new Date(parseInt(y), parseInt(m) - 2)
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                    })()
                  )
                )
                const trend = prev ? entry.count - prev.count : 0
                const height = entry.count > 0 ? Math.max((entry.count / maxNewUsers) * 100, 4) : 4

                return (
                  <div key={entry.month} className="flex items-center gap-3 group">
                    <span className="text-xs text-slate-500 w-14 shrink-0">{formatMonthLabel(entry.month)}</span>
                    <div className="flex-1 h-6 bg-white/[0.03] rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500/60 to-cyan-400/60 rounded-md transition-all duration-500 group-hover:from-teal-500 group-hover:to-cyan-400"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 w-16 shrink-0 justify-end">
                      <span className="text-sm font-semibold text-white">{entry.count}</span>
                      {trend !== 0 && (
                        trend > 0
                          ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                          : <ArrowDownRight className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* User stats pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
            {Object.entries(users.byRole).map(([role, count]) => (
              <Badge key={role} className="bg-white/[0.06] text-slate-300 border-white/[0.08] rounded-lg text-xs font-medium" variant="outline">
                {role.replace(/_/g, ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── Requests & Payments Summary ─── */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold gradient-text-warm">Requests & Payments</h2>
          </div>

          <div className="space-y-5">
            {/* Requests by status */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requests by Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(requests.byStatus).map(([status, count]) => {
                  const style = STATUS_STYLE[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                  return (
                    <Badge key={status} className={cn('rounded-lg font-medium text-xs border px-3 py-1', style)} variant="outline">
                      {status} <span className="ml-1.5 font-bold">{count}</span>
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Requests by category */}
            {Object.keys(requests.byCategory).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requests by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(requests.byCategory).map(([cat, count]) => (
                    <Badge key={cat} className="bg-white/[0.06] text-slate-300 border-white/[0.08] rounded-lg text-xs font-medium capitalize" variant="outline">
                      {cat.replace(/_/g, ' ')}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Payments by method */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payments by Method</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(payments.byMethod).map(([method, count]) => (
                  <Badge key={method} className="bg-teal-500/10 text-teal-400 border-teal-500/20 rounded-lg text-xs font-medium" variant="outline">
                    {method}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Payments by status */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payments by Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(payments.byStatus).map(([status, count]) => {
                  const style = STATUS_STYLE[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                  return (
                    <Badge key={status} className={cn('rounded-lg font-medium text-xs border px-3 py-1', style)} variant="outline">
                      {status} <span className="ml-1.5 font-bold">{count}</span>
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Recent Activity ─── */}
        <div className="glass-card p-6 animate-fade-in-up animation-delay-600">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>

          <div className="max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
            {recentActivity.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((a) => {
                const actionStyle = STATUS_STYLE[a.action] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/15">
                      <span className="text-[11px] font-semibold">
                        {(a.user?.name || 'S').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-200">{a.user?.name || 'System'}</span>
                        <Badge className={cn('rounded-md text-[10px] font-semibold border px-1.5 py-0', actionStyle)} variant="outline">
                          {a.action}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {a.entityType} {a.entityId ? `#${a.entityId.slice(0, 8)}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
