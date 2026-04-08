'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DollarSign,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  Music,
  Gift,
  Info,
  Users,
  Sparkles,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Data Interfaces ──────────────────────────────────────────────────────────

interface PricingTier {
  id: string
  name: string
  minUsers: number
  maxUsers: number
  price1Month: number
  price3Month: number
  price6Month: number
  price12Month: number
  isActive: boolean
  displayOrder: number
}

interface PricingSetting {
  value: string
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DURATION_COLUMNS = [
  { key: '1', label: '1 Month', field: 'price1Month' as const, color: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20' },
  { key: '3', label: '3 Months', field: 'price3Month' as const, color: 'from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20' },
  { key: '6', label: '6 Months', field: 'price6Month' as const, color: 'from-emerald-500/10 to-sky-500/10 dark:from-emerald-500/20 dark:to-sky-500/20' },
  { key: '12', label: '12 Months', field: 'price12Month' as const, color: 'from-emerald-500/10 to-violet-500/10 dark:from-emerald-500/20 dark:to-violet-500/20' },
] as const

const formatTZS = (amount: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (n: number) => n.toLocaleString('en-TZ')

// ─── Inline Editable Cell ─────────────────────────────────────────────────────

function EditablePriceCell({
  value,
  onChange,
  onSave,
  label,
}: {
  value: number
  onChange: (v: number) => void
  onSave: () => void
  label: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(String(value || 0))
    setEditing(true)
  }

  const commit = () => {
    const num = parseInt(draft.replace(/,/g, ''), 10) || 0
    onChange(num)
    setEditing(false)
    onSave()
  }

  const cancel = () => {
    setDraft(String(value || 0))
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      cancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commit()
    }
  }

  if (editing) {
    return (
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-medium pointer-events-none">
          TZS
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9,]/g, ''))}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-10 pr-8 py-2 text-sm font-mono font-semibold text-right',
            'bg-white dark:bg-slate-800',
            'border-2 border-emerald-500 dark:border-emerald-400',
            'rounded-lg',
            'outline-none',
            'shadow-[0_0_0_3px_rgba(16,185,129,0.15)] dark:shadow-[0_0_0_3px_rgba(52,211,153,0.2)]',
            'transition-all duration-150',
          )}
          aria-label={`Edit ${label} price`}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
          <button
            onMouseDown={(e) => { e.preventDefault(); commit() }}
            className="p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
            aria-label="Confirm"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); cancel() }}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            aria-label="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        'group w-full px-3 py-2 rounded-lg text-right transition-all duration-150',
        'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
        'cursor-pointer',
      )}
      aria-label={`Click to edit ${label} price`}
    >
      <div className="font-mono font-semibold text-sm text-slate-800 dark:text-slate-200">
        {formatNumber(value)}
      </div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to edit
      </div>
    </button>
  )
}

// ─── Inline Editable Text Cell ────────────────────────────────────────────────

function EditableTextCell({
  value,
  onChange,
  onSave,
  label,
  placeholder,
  className,
  inputClassName,
}: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  label: string
  placeholder?: string
  className?: string
  inputClassName?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  useEffect(() => {
    setDraft(value)
  }, [value])

  const startEdit = () => {
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    onChange(draft)
    setEditing(false)
    onSave()
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      cancel()
    }
  }

  if (editing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-3 py-1.5 text-sm',
            'bg-white dark:bg-slate-800',
            'border-2 border-emerald-500 dark:border-emerald-400',
            'rounded-lg',
            'outline-none',
            'shadow-[0_0_0_3px_rgba(16,185,129,0.15)] dark:shadow-[0_0_0_3px_rgba(52,211,153,0.2)]',
            'transition-all duration-150',
            inputClassName,
          )}
          placeholder={placeholder}
          aria-label={`Edit ${label}`}
        />
      </div>
    )
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        'group text-left transition-all duration-150 rounded px-1 -mx-1',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
        'cursor-pointer',
        className,
      )}
      aria-label={`Click to edit ${label}`}
    >
      <span className="inline-block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {value || placeholder || '—'}
      </span>
    </button>
  )
}

// ─── Editable Number Mini ─────────────────────────────────────────────────────

function EditableMiniNumber({
  value,
  onChange,
  onSave,
  label,
  className,
}: {
  value: number
  onChange: (v: number) => void
  onSave: () => void
  label: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(String(value))
    setEditing(true)
  }

  const commit = () => {
    const num = parseInt(draft, 10) || 0
    onChange(num)
    setEditing(false)
    onSave()
  }

  const cancel = () => {
    setDraft(String(value))
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    else if (e.key === 'Escape') { cancel() }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-16 px-2 py-0.5 text-sm font-mono text-center',
          'bg-white dark:bg-slate-800',
          'border-2 border-emerald-500 dark:border-emerald-400 rounded-md',
          'outline-none shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',
          className,
        )}
        aria-label={`Edit ${label}`}
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        'font-mono text-sm font-semibold text-slate-700 dark:text-slate-300',
        'hover:text-emerald-600 dark:hover:text-emerald-400 rounded px-1.5 py-0.5',
        'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        'cursor-pointer transition-colors',
        className,
      )}
      aria-label={`Click to edit ${label}`}
    >
      {value}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPricing() {
  const { token } = useAppStore()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [settings, setSettings] = useState<Record<string, PricingSetting>>({})
  const [loading, setLoading] = useState(true)
  const [savingTierId, setSavingTierId] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Track which tiers have unsaved changes
  const [dirty, setDirty] = useState<Set<string>>(new Set())

  // Add-on settings
  const [audioPrice, setAudioPrice] = useState('15000')
  const [starterPrice, setStarterPrice] = useState('30000')
  const [settingsDirty, setSettingsDirty] = useState(false)

  // ─── Toast ─────────────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const fetchTiers = useCallback(async () => {
    try {
      const res = await fetch('/api/pricing-tiers')
      const data = await res.json()
      if (data.success && data.data) {
        setTiers(data.data.tiers || [])
      }
    } catch (err) {
      console.error('Fetch tiers error:', err)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/pricing-settings')
      const data = await res.json()
      if (data.success && data.data) {
        setSettings(data.data.settings || {})
        if (data.data.settings.audio_recording_price) {
          setAudioPrice(data.data.settings.audio_recording_price.value)
        }
        if (data.data.settings.starter_package_price) {
          setStarterPrice(data.data.settings.starter_package_price.value)
        }
      }
    } catch (err) {
      console.error('Fetch settings error:', err)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [tiersRes, settingsRes] = await Promise.all([
          fetch('/api/pricing-tiers'),
          fetch('/api/pricing-settings'),
        ])
        const tiersData = await tiersRes.json()
        const settingsData = await settingsRes.json()
        if (cancelled) return
        if (tiersData.success && tiersData.data) {
          setTiers(tiersData.data.tiers || [])
        }
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data.settings || {})
          if (settingsData.data.settings.audio_recording_price) {
            setAudioPrice(settingsData.data.settings.audio_recording_price.value)
          }
          if (settingsData.data.settings.starter_package_price) {
            setStarterPrice(settingsData.data.settings.starter_package_price.value)
          }
        }
      } catch (err) {
        console.error('Initial data fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ─── Tier CRUD ─────────────────────────────────────────────────────────────

  const updateTierField = (id: string, field: string, value: unknown) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    )
    setDirty((prev) => new Set(prev).add(id))
  }

  const markDirty = (id: string) => {
    setDirty((prev) => new Set(prev).add(id))
  }

  const saveTier = async (tier: PricingTier) => {
    if (!tier.name || tier.minUsers < 1) {
      showToast('error', 'Tier name and min users are required')
      return
    }

    setSavingTierId(tier.id)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/pricing-tiers/${tier.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: tier.name,
          minUsers: tier.minUsers,
          maxUsers: tier.maxUsers,
          price1Month: tier.price1Month,
          price3Month: tier.price3Month,
          price6Month: tier.price6Month,
          price12Month: tier.price12Month,
          isActive: tier.isActive,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `"${tier.name}" saved`)
        setDirty((prev) => {
          const next = new Set(prev)
          next.delete(tier.id)
          return next
        })
        await fetchTiers()
      } else {
        showToast('error', data.error || 'Failed to save tier')
      }
    } catch {
      showToast('error', 'Network error')
    }
    setSavingTierId(null)
  }

  const saveAllTiers = async () => {
    const dirtyTiers = tiers.filter((t) => dirty.has(t.id))
    if (dirtyTiers.length === 0) {
      showToast('success', 'All tiers are up to date')
      return
    }

    for (const tier of dirtyTiers) {
      await saveTier(tier)
    }
  }

  const addTier = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const newOrder = tiers.length > 0 ? Math.max(...tiers.map((t) => t.displayOrder)) + 1 : 1
      const res = await fetch('/api/pricing-tiers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `New Tier`,
          minUsers: 1,
          maxUsers: 10,
          price1Month: 0,
          price3Month: 0,
          price6Month: 0,
          price12Month: 0,
          displayOrder: newOrder,
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', 'New tier added — click cells to edit')
        await fetchTiers()
      } else {
        showToast('error', data.error || 'Failed to add tier')
      }
    } catch {
      showToast('error', 'Network error')
    }
  }

  const deleteTier = async (tier: PricingTier) => {
    if (!confirm(`Delete tier "${tier.name}"? This action cannot be undone.`)) return

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/pricing-tiers/${tier.id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showToast('success', `"${tier.name}" deleted`)
        await fetchTiers()
      } else {
        showToast('error', data.error || 'Failed to delete tier')
      }
    } catch {
      showToast('error', 'Network error')
    }
  }

  const toggleTierActive = async (tier: PricingTier) => {
    updateTierField(tier.id, 'isActive', !tier.isActive)
    markDirty(tier.id)

    // Auto-save on toggle
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/pricing-tiers/${tier.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !tier.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', `"${tier.name}" ${!tier.isActive ? 'activated' : 'deactivated'}`)
        setDirty((prev) => {
          const next = new Set(prev)
          next.delete(tier.id)
          return next
        })
        await fetchTiers()
      } else {
        showToast('error', data.error || 'Failed to update')
      }
    } catch {
      showToast('error', 'Network error')
    }
  }

  // ─── Settings Save ─────────────────────────────────────────────────────────

  const saveGlobalSettings = async () => {
    setSavingSettings(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      await fetch('/api/pricing-settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'audio_recording_price',
          value: audioPrice,
          label: 'Audio Recording Price (TZS)',
        }),
      })

      await fetch('/api/pricing-settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'starter_package_price',
          value: starterPrice,
          label: 'Starter Package Price (TZS)',
        }),
      })

      setSettingsDirty(false)
      showToast('success', 'Add-on settings saved')
    } catch {
      showToast('error', 'Network error')
    }
    setSavingSettings(false)
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Service Pricing
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-11">
            Click any price or name cell to edit inline. Changes are saved per-tier.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-11 sm:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchTiers(); fetchSettings(); }}
            className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          {dirty.size > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={saveAllTiers}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save All ({dirty.size})
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {dirty.size} tier{dirty.size > 1 ? 's' : ''} with unsaved changes
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ─── Toast Notification ───────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
          'transition-all duration-300 transform',
          toast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none',
          toast?.type === 'success'
            ? 'bg-emerald-600 text-white dark:bg-emerald-500'
            : 'bg-red-600 text-white dark:bg-red-500',
        )}
        role="alert"
      >
        {toast?.type === 'success' ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <X className="h-4 w-4 shrink-0" />
        )}
        {toast?.text}
      </div>

      {/* ─── Pricing Matrix Section ───────────────────────────────────────── */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-700/60 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Pricing Matrix
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prices in TZS per user per month
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Column Headers */}
          <div className="grid grid-cols-[minmax(180px,1.2fr),repeat(4,minmax(110px,1fr)),minmax(90px,0.7fr),minmax(100px,0.8fr)] sm:grid-cols-[minmax(220px,1.2fr),repeat(4,minmax(120px,1fr)),minmax(100px,0.7fr),minmax(110px,0.8fr)]">
            {/* Tier Info Header */}
            <div className="px-4 py-3 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Users className="h-3.5 w-3.5" />
                Tier
              </div>
            </div>
            {/* Duration Headers */}
            {DURATION_COLUMNS.map((col) => (
              <div
                key={col.key}
                className={cn(
                  'px-3 py-3 border-b border-r border-slate-100 dark:border-slate-800 text-center',
                  'bg-gradient-to-br',
                  col.color,
                )}
              >
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {col.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  TZS / User
                </div>
              </div>
            ))}
            {/* Status Header */}
            <div className="hidden px-3 py-3 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-center sm:block">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </div>
            </div>
            {/* Actions Header */}
            <div className="hidden px-3 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-center sm:block">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </div>
            </div>
          </div>

          {/* Tier Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tiers
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((tier) => {
                const isDirty = dirty.has(tier.id)
                const isSaving = savingTierId === tier.id

                return (
                  <div
                    key={tier.id}
                    className={cn(
                      'grid grid-cols-[minmax(180px,1.2fr),repeat(4,minmax(110px,1fr)),minmax(90px,0.7fr),minmax(100px,0.8fr)] sm:grid-cols-[minmax(220px,1.2fr),repeat(4,minmax(120px,1fr)),minmax(100px,0.7fr),minmax(110px,0.8fr)]',
                      'group transition-colors duration-150',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/20',
                      tier.isActive
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-50/60 dark:bg-slate-900/50',
                      isDirty && 'bg-amber-50/50 dark:bg-amber-950/10',
                    )}
                  >
                    {/* Tier Info */}
                    <div
                      className={cn(
                        'flex flex-col justify-center gap-1.5 px-4 py-3.5 border-r border-slate-100 dark:border-slate-800',
                        tier.isActive && 'border-l-[3px] border-l-emerald-500',
                        !tier.isActive && 'border-l-[3px] border-l-transparent',
                      )}
                    >
                      <EditableTextCell
                        value={tier.name}
                        onChange={(v) => updateTierField(tier.id, 'name', v)}
                        onSave={() => markDirty(tier.id)}
                        label="tier name"
                        placeholder="Tier name"
                        className="font-semibold text-sm text-slate-800 dark:text-white"
                        inputClassName="font-semibold text-sm"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Users className="h-3 w-3" />
                        <EditableMiniNumber
                          value={tier.minUsers}
                          onChange={(v) => updateTierField(tier.id, 'minUsers', v)}
                          onSave={() => markDirty(tier.id)}
                          label="min users"
                        />
                        <span className="text-slate-300 dark:text-slate-600">–</span>
                        <EditableMiniNumber
                          value={tier.maxUsers}
                          onChange={(v) => updateTierField(tier.id, 'maxUsers', v)}
                          onSave={() => markDirty(tier.id)}
                          label="max users"
                        />
                        <span>users</span>
                      </div>
                    </div>

                    {/* Price Cells */}
                    {DURATION_COLUMNS.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center border-r border-slate-100 dark:border-slate-800 px-2 py-2"
                      >
                        <EditablePriceCell
                          value={tier[col.field]}
                          onChange={(v) => updateTierField(tier.id, col.field, v)}
                          onSave={() => markDirty(tier.id)}
                          label={`${tier.name} ${col.label}`}
                        />
                      </div>
                    ))}

                    {/* Status */}
                    <div className="hidden sm:flex items-center justify-center border-r border-slate-100 dark:border-slate-800 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tier.isActive}
                          onCheckedChange={() => toggleTierActive(tier)}
                          className={cn(
                            'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700',
                          )}
                          aria-label={`Toggle ${tier.name} active status`}
                        />
                        <span className={cn(
                          'text-[10px] font-medium',
                          tier.isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500',
                        )}>
                          {tier.isActive ? 'On' : 'Off'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveTier(tier)}
                            disabled={isSaving || !isDirty}
                            className={cn(
                              'h-8 px-3 gap-1.5 text-xs',
                              isDirty
                                ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                                : 'text-slate-400 dark:text-slate-500',
                            )}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isDirty ? (
                              <Save className="h-3.5 w-3.5" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            {isDirty ? 'Save' : 'Saved'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isDirty ? 'Save changes for this tier' : 'No unsaved changes'}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => deleteTier(tier)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete this tier</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )
              })}

            {tiers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                <DollarSign className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No pricing tiers yet</p>
                <p className="text-xs mt-1">Add your first tier to get started</p>
              </div>
            )}
          </div>

          {/* Add Tier Button */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-4">
            <Button
              variant="ghost"
              onClick={addTier}
              className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl py-6 h-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Add New Tier</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Add-on Settings Section ──────────────────────────────────────── */}
      <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40">
              <Gift className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Add-on Settings
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure flat-fee add-on services
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Audio Recording Price */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <Music className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Audio Recording
                </Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    TZS
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={audioPrice}
                  onChange={(e) => {
                    setAudioPrice(e.target.value.replace(/[^0-9,]/g, ''))
                    setSettingsDirty(true)
                  }}
                  className={cn(
                    'w-full pl-14 pr-4 py-2.5 text-sm font-mono font-semibold',
                    'bg-white dark:bg-slate-800',
                    'border border-slate-200 dark:border-slate-700',
                    'rounded-xl',
                    'outline-none',
                    'transition-all duration-150',
                    'hover:border-slate-300 dark:hover:border-slate-600',
                    'focus:border-emerald-500 dark:focus:border-emerald-400',
                    'focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]',
                  )}
                  placeholder="0"
                  aria-label="Audio recording price"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-10">
                Flat fee for recording your advertisement audio
              </p>
            </div>

            {/* Starter Package Price */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Starter Package
                </Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                    TZS
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={starterPrice}
                  onChange={(e) => {
                    setStarterPrice(e.target.value.replace(/[^0-9,]/g, ''))
                    setSettingsDirty(true)
                  }}
                  className={cn(
                    'w-full pl-14 pr-4 py-2.5 text-sm font-mono font-semibold',
                    'bg-white dark:bg-slate-800',
                    'border border-slate-200 dark:border-slate-700',
                    'rounded-xl',
                    'outline-none',
                    'transition-all duration-150',
                    'hover:border-slate-300 dark:hover:border-slate-600',
                    'focus:border-emerald-500 dark:focus:border-emerald-400',
                    'focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]',
                  )}
                  placeholder="0"
                  aria-label="Starter package price"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-10">
                Includes 1-month subscription + audio recording
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={saveGlobalSettings}
              disabled={savingSettings || !settingsDirty}
              className={cn(
                'bg-emerald-600 hover:bg-emerald-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-150',
              )}
            >
              {savingSettings ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
            {settingsDirty && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Unsaved changes
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Info Card ────────────────────────────────────────────────────── */}
      <Card className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/60">
        <CardContent className="py-4 px-5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                How the calculation works
              </p>
              <p>
                <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
                  Total = Price/User × Users × Months + Audio Recording (if selected)
                </code>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Example: Tier 11–25, 20 users, 6 months = 12,000 × 20 × 6 = {formatTZS(12000 * 20 * 6)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
