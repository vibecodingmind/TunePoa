'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

/**
 * Polling hook – checks /api/poll every `intervalMs` (default 30 s)
 * and updates the unread notification count in the store.
 */
export function usePolling(intervalMs = 30000) {
  const { token, isAuthenticated, setUnreadCount } = useAppStore()
  const lastPollRef = useRef(0)

  useEffect(() => {
    if (!isAuthenticated) return

    const poll = async () => {
      try {
        const since = lastPollRef.current
        const res = await fetch(`/api/poll?since=${since}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        if (data.success) {
          lastPollRef.current = data.data.serverTime
          if (data.data.newNotifications > 0) {
            setUnreadCount(data.data.newNotifications)
          }
        }
      } catch {
        // silent – polling should never crash the UI
      }
    }

    poll() // immediate first call
    const interval = setInterval(poll, intervalMs)
    return () => clearInterval(interval)
  }, [isAuthenticated, token, intervalMs, setUnreadCount])
}
