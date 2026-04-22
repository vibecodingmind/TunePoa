'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ScrollText,
  Search,
  ChevronDown,
  Filter,
  RotateCcw,
  User,
  Monitor,
  FileText,
  CreditCard,
  Wallet,
  CalendarDays,
} from 'lucide-react'

/* ─── Types ─── */
interface ActivityLog {
  id: string
  userId: string | null
  action: string
  entityType: string
  entityId: string | null
  details: string
  ipAddress: string | null
  createdAt: string
  user?: { id: string; name: string; email: string } | null
}

type EntityType = 'ALL' | 'USER' | 'SERVICE_REQUEST' | 'SUBSCRIPTION' | 'PAYMENT'

/* ─── Relative time helper ─── */
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

/* ─── Action color config ─── */
const ACTION_COLORS: Record<string, string> = {
  CREATED: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  UPDATED: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  DELETED: 'bg-red-500/15 text-red-400 border-red-500/25',
  STATUS_CHANGE: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  LOGIN: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

/* ─── Entity icon ─── */
function EntityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    USER: { icon: User, color: 'text-teal-400' },
    SERVICE_REQUEST: { icon: FileText, color: 'text-cyan-400' },
    SUBSCRIPTION: { icon: CreditCard, color: 'text-amber-400' },
    PAYMENT: { icon: Wallet, color: 'text-emerald-400' },
  }

  const c = config[type] || { icon: Monitor, color: 'text-slate-400' }
  const Icon = c.icon
  return <Icon className={cn('h-3.5 w-3.5', c.color)} />
}

/* ─── Dropdown Selector ─── */
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (val: string) => void
}) {
  return (
    <div className="relative">
      <button
        onClick={() => {
          const select = document.getElementById(`select-${label}`) as HTMLSelectElement | null
          select?.showPicker?.()
        }}
        className="glass-subtle px-3 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-2 hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
      >
        <Filter className="h-3.5 w-3.5 text-slate-500" />
        <span>{options.find((o) => o.value === value)?.label || label}</span>
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>
      <select
        id={`select-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ─── Log Row Skeleton ─── */
function LogSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24 bg-white/[0.06]" />
        <Skeleton className="h-4 w-32 bg-white/[0.06]" />
        <Skeleton className="h-6 w-24 rounded-md bg-white/[0.06]" />
        <Skeleton className="h-4 w-20 bg-white/[0.06]" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-32 bg-white/[0.04]" />
        <Skeleton className="h-4 w-20 bg-white/[0.04]" />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function AdminActivityLogs() {
  const { token } = useAppStore()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 50

  // Filters
  const [entityType, setEntityType] = useState<string>('ALL')
  const [action, setAction] = useState<string>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  const fetchLogs = useCallback(async (reset = true) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', reset ? '0' : String(offset))

      if (entityType && entityType !== 'ALL') params.set('entityType', entityType)
      if (action && action !== 'ALL') params.set('action', action)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (search) params.set('search', search)

      const res = await fetch(`/api/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        const newLogs = json.data.logs || []
        if (reset) {
          setLogs(newLogs)
          setOffset(0)
        } else {
          setLogs((prev) => [...prev, ...newLogs])
        }
        setTotal(json.data.total || 0)
        setHasMore(newLogs.length === limit)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token, entityType, action, startDate, endDate, search, offset, limit])

  useEffect(() => {
    fetchLogs(true)
  }, [fetchLogs, entityType, action, startDate, endDate])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(true)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const loadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)
    fetchLogs(false).then(() => setOffset(newOffset))
  }

  const resetFilters = () => {
    setEntityType('ALL')
    setAction('ALL')
    setStartDate('')
    setEndDate('')
    setSearch('')
  }

  const hasFilters = entityType !== 'ALL' || action !== 'ALL' || startDate || endDate || search

  const entityOptions = [
    { value: 'ALL', label: 'All Entities' },
    { value: 'USER', label: 'User' },
    { value: 'SERVICE_REQUEST', label: 'Service Request' },
    { value: 'SUBSCRIPTION', label: 'Subscription' },
    { value: 'PAYMENT', label: 'Payment' },
  ]

  const actionOptions = [
    { value: 'ALL', label: 'All Actions' },
    { value: 'CREATED', label: 'Created' },
    { value: 'UPDATED', label: 'Updated' },
    { value: 'DELETED', label: 'Deleted' },
    { value: 'STATUS_CHANGE', label: 'Status Change' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ]

  // Get unique actions from loaded logs for display
  const availableActions = [...new Set(logs.map((l) => l.action))]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20">
          <ScrollText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activity Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total} log entries total
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search in details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm glass-input border-0 rounded-xl"
            />
          </div>

          {/* Entity type filter */}
          <FilterDropdown
            label="entity"
            value={entityType}
            options={entityOptions}
            onChange={setEntityType}
          />

          {/* Action filter */}
          <FilterDropdown
            label="action"
            value={action}
            options={actionOptions}
            onChange={setAction}
          />

          {/* Date range */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500 shrink-0" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-sm glass-input border-0 rounded-xl w-[140px]"
              placeholder="From"
            />
            <span className="text-slate-500 text-xs">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-sm glass-input border-0 rounded-xl w-[140px]"
              placeholder="To"
            />
          </div>

          {/* Reset */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-slate-400 hover:text-white hover:bg-white/5 gap-1.5 text-sm shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Logs list */}
      {loading && logs.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LogSkeleton key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-scale">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <ScrollText className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No activity logs found</h3>
          <p className="text-sm text-slate-400">
            {hasFilters ? 'Try adjusting your filters.' : 'Activity logs will appear here as actions are performed.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            {/* Table header */}
            <div className="glass-subtle px-4 py-3 rounded-t-2xl border-b border-white/[0.06]">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="w-[160px] shrink-0">Timestamp</span>
                <span className="w-[140px] shrink-0">User</span>
                <span className="w-[120px] shrink-0">Action</span>
                <span className="w-[110px] shrink-0">Entity</span>
                <span className="w-[100px] shrink-0">Entity ID</span>
                <span className="flex-1 min-w-0">Details</span>
                <span className="w-[120px] shrink-0 text-right">IP Address</span>
              </div>
            </div>

            {/* Table rows */}
            <div className="max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin">
              {logs.map((log) => {
                const actionColor = ACTION_COLORS[log.action] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                let detailsStr = ''
                try {
                  const parsed = JSON.parse(log.details)
                  detailsStr = JSON.stringify(parsed).slice(0, 80)
                } catch {
                  detailsStr = log.details.slice(0, 80)
                }

                return (
                  <div
                    key={log.id}
                    className="glass-card rounded-none border-x-0 border-t-0 px-4 py-3 transition-colors hover:bg-white/[0.02] animate-fade-in group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Timestamp */}
                      <span className="w-[160px] shrink-0 text-xs text-slate-500 font-medium">
                        {timeAgo(log.createdAt)}
                      </span>

                      {/* User */}
                      <span className="w-[140px] shrink-0 text-sm text-slate-300 font-medium truncate">
                        {log.user?.name || 'System'}
                      </span>

                      {/* Action badge */}
                      <span className="w-[120px] shrink-0">
                        <Badge className={`${actionColor} rounded-md text-[11px] font-semibold border`} variant="outline">
                          {log.action}
                        </Badge>
                      </span>

                      {/* Entity type */}
                      <span className="w-[110px] shrink-0 flex items-center gap-1.5 text-sm text-slate-400">
                        <EntityIcon type={log.entityType} />
                        <span className="truncate">{log.entityType}</span>
                      </span>

                      {/* Entity ID */}
                      <span className="w-[100px] shrink-0 text-xs text-slate-500 font-mono truncate">
                        {log.entityId ? `${log.entityId.slice(0, 8)}...` : '—'}
                      </span>

                      {/* Details */}
                      <span className="flex-1 min-w-0 text-xs text-slate-500 truncate font-mono">
                        {detailsStr}
                      </span>

                      {/* IP Address */}
                      <span className="w-[120px] shrink-0 text-right text-xs text-slate-500 font-mono">
                        {log.ipAddress || '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom border */}
            <div className="glass-subtle h-2 rounded-b-2xl" />
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin pr-1">
            {logs.map((log) => {
              const actionColor = ACTION_COLORS[log.action] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'
              let detailsStr = ''
              try {
                const parsed = JSON.parse(log.details)
                detailsStr = JSON.stringify(parsed).slice(0, 120)
              } catch {
                detailsStr = log.details.slice(0, 120)
              }

              return (
                <div key={log.id} className="glass-card p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{log.user?.name || 'System'}</span>
                      <Badge className={`${actionColor} rounded-md text-[10px] font-semibold border`} variant="outline">
                        {log.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo(log.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <EntityIcon type={log.entityType} />
                    <span className="text-xs text-slate-400">{log.entityType}</span>
                    {log.entityId && (
                      <span className="text-[10px] text-slate-500 font-mono">{log.entityId.slice(0, 12)}...</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">{detailsStr}</p>
                  {log.ipAddress && (
                    <p className="text-[10px] text-slate-600 mt-1">IP: {log.ipAddress}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={loadMore}
                disabled={loading}
                className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 text-sm font-medium gap-2"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          {/* Count */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Showing {logs.length} of {total} entries
            </p>
          </div>
        </>
      )}
    </div>
  )
}
