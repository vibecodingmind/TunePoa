'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  BellOff,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Filter,
} from 'lucide-react'

/* ─── Types ─── */
interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  actionUrl: string | null
  isRead: boolean
  createdAt: string
}

type FilterTab = 'ALL' | 'UNREAD' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

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
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString()
}

/* ─── Type config ─── */
const TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}> = {
  INFO: {
    icon: Info,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  ERROR: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
}

/* ─── Notification Card ─── */
function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.INFO
  const Icon = config.icon

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id)
    }
  }

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-200 animate-fade-in cursor-pointer group',
        notification.isRead ? 'opacity-70' : 'border-l-2 border-l-teal-400'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.bgColor, 'border', config.borderColor)}>
          <Icon className={cn('h-4.5 w-4.5', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('text-sm font-semibold truncate', notification.isRead ? 'text-slate-400' : 'text-white')}>
              {notification.title}
            </h3>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-teal-400 shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {timeAgo(notification.createdAt)}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id) }}
                  className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-teal-400 transition-colors"
                  title="Mark as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(notification.id) }}
                className="p-1 rounded-md hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton Loader ─── */
function NotificationSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48 bg-white/[0.06]" />
          <Skeleton className="h-3 w-full bg-white/[0.04]" />
          <Skeleton className="h-3 w-24 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export function NotificationsPage() {
  const { token, setUnreadCount } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [total, setTotal] = useState(0)

  const fetchNotifications = useCallback(async (tab?: FilterTab) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', '50')
      params.set('offset', '0')

      if (tab === 'UNREAD') {
        params.set('unread', 'true')
      }

      const res = await fetch(`/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data.notifications || [])
        setTotal(json.data.total || 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchNotifications(activeTab)
  }, [fetchNotifications, activeTab])

  // Poll for unread count every 30s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.success) {
          setUnreadCount(json.data.total || 0)
        }
      } catch {
        // silent
      }
    }

    poll()
    const interval = setInterval(poll, 30000)
    return () => clearInterval(interval)
  }, [token, setUnreadCount])

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev: number) => Math.max(0, prev - 1))
    } catch {
      console.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      console.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const deleted = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev: number) => Math.max(0, prev - 1))
      }
    } catch {
      console.error('Failed to delete')
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL' || activeTab === 'UNREAD') return true
    return n.type === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'INFO', label: 'Info' },
    { id: 'SUCCESS', label: 'Success' },
    { id: 'WARNING', label: 'Warning' },
    { id: 'ERROR', label: 'Error' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-teal-500/20">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 gap-2 text-sm font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-slate-500 shrink-0 mr-1" />
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tab.id === 'ALL'
            ? notifications.length
            : tab.id === 'UNREAD'
              ? unreadCount
              : notifications.filter((n) => n.type === tab.id).length

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              {tab.label}
              {count > 0 && (
                <Badge
                  className={cn(
                    'ml-1.5 px-1.5 py-0 h-4 text-[10px] font-bold rounded-md',
                    isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-white/[0.06] text-slate-500'
                  )}
                  variant="outline"
                >
                  {count}
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-scale">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <BellOff className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {activeTab === 'UNREAD' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-sm text-slate-400">
            {activeTab === 'UNREAD'
              ? 'You\'re all caught up! Check back later.'
              : 'Notifications about your account activity will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin pr-1">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Total count */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Showing {filteredNotifications.length} of {total} notifications
          </p>
        </div>
      )}
    </div>
  )
}
