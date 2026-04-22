'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
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
  { key: '1', label: '1 Month', field: 'price1Month' as const, color: 'from-teal-500/15 to-cyan-500/10' },
  { key: '3', label: '3 Months', field: 'price3Month' as const, color: 'from-teal-500/10 to-cyan-500/15' },
  { key: '6', label: '6 Months', field: 'price6Month' as const, color: 'from-cyan-500/10 to-sky-500/15' },
  { key: '12', label: '12 Months', field: 'price12Month' as const, color: 'from-cyan-500/15 to-violet-500/10' },
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
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-cyan-400/70 font-medium pointer-events-none">
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
            'glass-input',
            'border-2 border-cyan-500/30',
            'rounded-lg',
            'outline-none',
            'shadow-[0_0_0_3px_rgba(34,211,238,0.15),0_0_20px_rgba(20,184,166,0.1)]',
            'transition-all duration-150',
          )}
          aria-label={`Edit ${label} price`}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
          <button
            onMouseDown={(e) => { e.preventDefault(); commit() }}
            className="p-0.5 rounded hover:bg-teal-500/20 text-teal-400"
            aria-label="Confirm"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); cancel() }}
            className="p-0.5 rounded hover:bg-white/10 text-slate-400"
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
        'hover:bg-teal-500/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a1628]',
        'cursor-pointer',
      )}
      aria-label={`Click to edit ${label} price`}
    >
      <div className="font-mono font-semibold text-sm text-slate-200">
        {formatNumber(value)}
      </div>
      <div className="text-[10px] text-cyan-400/60 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
            'glass-input',
            'border-2 border-cyan-500/30',
            'rounded-lg',
            'outline-none',
            'shadow-[0_0_0_3px_rgba(34,211,238,0.15),0_0_20px_rgba(20,184,166,0.1)]',
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
        'hover:bg-white/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a1628]',
        'cursor-pointer',
        className,
      )}
      aria-label={`Click to edit ${label}`}
    >
      <span className="inline-block group-hover:text-cyan-400 transition-colors">
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
          'glass-input',
          'border-2 border-cyan-500/30 rounded-md',
          'outline-none shadow-[0_0_0_3px_rgba(34,211,238,0.12)]',
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
        'font-mono text-sm font-semibold text-slate-300',
        'hover:text-cyan-400 rounded px-1.5 py-0.5',
        'hover:bg-teal-500/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
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
      <div className="relative space-y-6">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -right-20 w-64 h-64 bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl glass-card" style={{ opacity: 0.5 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* ─── Decorative gradient orbs ────────────────────────────────────── */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-60 -right-24 w-72 h-72 bg-cyan-500/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-violet-500/4 rounded-full blur-[90px] pointer-events-none" />

      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <DollarSign className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Service Pricing
              </h1>
              {/* Gradient accent line */}
              <div className="h-1 w-16 mt-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2 ml-14">
            Click any price or name cell to edit inline. Changes are saved per-tier.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchTiers(); fetchSettings(); }}
            className={cn(
              'glass-input border border-white/10 hover:border-teal-500/30',
              'text-slate-300 hover:text-white hover:bg-teal-500/5',
              'transition-all duration-200',
            )}
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
                  className={cn(
                    'bg-gradient-to-r from-teal-500 to-cyan-500',
                    'hover:from-teal-600 hover:to-cyan-600',
                    'text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]',
                    'transition-all duration-200',
                  )}
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
          'fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-medium',
          'backdrop-blur-xl shadow-2xl',
          'transition-all duration-300 transform',
          toast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none',
          toast?.type === 'success'
            ? 'bg-teal-500/20 border border-teal-500/30 text-teal-200 shadow-[0_0_30px_rgba(20,184,166,0.2)]'
            : 'bg-red-500/20 border border-red-500/30 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.2)]',
        )}
        role="alert"
      >
        {toast?.type === 'success' ? (
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-500/20 shrink-0">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/20 shrink-0">
            <X className="h-4 w-4 text-red-400" />
          </div>
        )}
        {toast?.text}
      </div>

      {/* ─── Pricing Matrix Section ───────────────────────────────────────── */}
      <div className="glass-card overflow-hidden border-0">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-white/[0.03] to-transparent border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/15 border border-teal-500/15">
              <Sparkles className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Pricing Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prices in TZS per user per month
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-0">
          {/* Column Headers */}
          <div className="grid grid-cols-[minmax(180px,1.2fr),repeat(4,minmax(110px,1fr)),minmax(90px,0.7fr),minmax(100px,0.8fr)] sm:grid-cols-[minmax(220px,1.2fr),repeat(4,minmax(120px,1fr)),minmax(100px,0.7fr),minmax(110px,0.8fr)]">
            {/* Tier Info Header */}
            <div className="px-4 py-3.5 border-b border-r border-white/[0.05] bg-gradient-to-b from-teal-500/[0.06] to-transparent">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Users className="h-3.5 w-3.5 text-teal-500/60" />
                Tier
              </div>
            </div>
            {/* Duration Headers */}
            {DURATION_COLUMNS.map((col) => (
              <div
                key={col.key}
                className={cn(
                  'px-3 py-3.5 border-b border-r border-white/[0.05] text-center',
                  'bg-gradient-to-br',
                  col.color,
                )}
              >
                <div className="text-xs font-semibold text-slate-200">
                  {col.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  TZS / User
                </div>
              </div>
            ))}
            {/* Status Header */}
            <div className="hidden px-3 py-3.5 border-b border-r border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-center sm:block">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </div>
            </div>
            {/* Actions Header */}
            <div className="hidden px-3 py-3.5 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent text-center sm:block">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </div>
            </div>
          </div>

          {/* Tier Rows */}
          <div className="divide-y divide-white/[0.04]">
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
                      'group transition-all duration-200',
                      'hover:bg-white/[0.03]',
                      tier.isActive
                        ? 'bg-[#0a1628]/60'
                        : 'bg-[#0a1628]/30',
                      isDirty && 'bg-amber-500/[0.04]',
                    )}
                  >
                    {/* Tier Info */}
                    <div
                      className={cn(
                        'flex flex-col justify-center gap-1.5 px-4 py-3.5 border-r border-white/[0.04]',
                        tier.isActive && 'border-l-[3px] border-l-teal-500',
                        !tier.isActive && 'border-l-[3px] border-l-transparent',
                      )}
                    >
                      <EditableTextCell
                        value={tier.name}
                        onChange={(v) => updateTierField(tier.id, 'name', v)}
                        onSave={() => markDirty(tier.id)}
                        label="tier name"
                        placeholder="Tier name"
                        className="font-semibold text-sm text-white"
                        inputClassName="font-semibold text-sm"
                      />
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users className="h-3 w-3 text-teal-500/40" />
                        <EditableMiniNumber
                          value={tier.minUsers}
                          onChange={(v) => updateTierField(tier.id, 'minUsers', v)}
                          onSave={() => markDirty(tier.id)}
                          label="min users"
                        />
                        <span className="text-slate-500">–</span>
                        <EditableMiniNumber
                          value={tier.maxUsers}
                          onChange={(v) => updateTierField(tier.id, 'maxUsers', v)}
                          onSave={() => markDirty(tier.id)}
                          label="max users"
                        />
                        <span className="text-slate-500">users</span>
                      </div>
                    </div>

                    {/* Price Cells */}
                    {DURATION_COLUMNS.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center border-r border-white/[0.04] px-2 py-2"
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
                    <div className="hidden sm:flex items-center justify-center border-r border-white/[0.04] px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tier.isActive}
                          onCheckedChange={() => toggleTierActive(tier)}
                          className={cn(
                            'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-cyan-500 data-[state=unchecked]:bg-white/10',
                          )}
                          aria-label={`Toggle ${tier.name} active status`}
                        />
                        <span className={cn(
                          'text-[10px] font-medium',
                          tier.isActive
                            ? 'text-teal-400'
                            : 'text-slate-500',
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
                                ? 'text-teal-400 hover:text-teal-300 hover:bg-teal-500/10'
                                : 'text-slate-500',
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
                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
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
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] mb-4">
                  <DollarSign className="h-8 w-8 opacity-30" />
                </div>
                <p className="text-sm font-medium text-slate-300">No pricing tiers yet</p>
                <p className="text-xs mt-1 text-slate-500">Add your first tier to get started</p>
              </div>
            )}
          </div>

          {/* Add Tier Button */}
          <div className="border-t border-white/[0.05] p-4">
            <Button
              variant="ghost"
              onClick={addTier}
              className={cn(
                'w-full border-2 border-dashed border-white/[0.08] rounded-2xl py-6 h-auto',
                'hover:border-teal-500/40 hover:bg-teal-500/[0.04]',
                'text-slate-400 hover:text-teal-400',
                'glass-input bg-transparent',
                'transition-all duration-300',
                'hover:shadow-[0_0_30px_rgba(20,184,166,0.08)]',
              )}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Add New Tier</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Add-on Settings Section ──────────────────────────────────────── */}
      <div className="glass-card overflow-hidden border-0">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-white/[0.03] to-transparent border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 border border-violet-500/15">
              <Gift className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Add-on Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure flat-fee add-on services
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Audio Recording Price */}
            <div className="group glass-card !bg-white/[0.02] !border-white/[0.04] p-5 rounded-2xl transition-all duration-300 hover:!border-teal-500/15 hover:!bg-teal-500/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/10 border border-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.08)]">
                  <Music className="h-4 w-4 text-teal-400" />
                </div>
                <Label className="text-sm font-semibold text-slate-200">
                  Audio Recording
                </Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-medium text-slate-400 glass-input !border-white/[0.06] px-2 py-0.5 rounded-md">
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
                    'glass-input',
                    'rounded-xl',
                    'outline-none',
                    'transition-all duration-200',
                    'hover:border-white/15',
                  )}
                  placeholder="0"
                  aria-label="Audio recording price"
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 ml-13">
                Flat fee for recording your advertisement audio
              </p>
            </div>

            {/* Starter Package Price */}
            <div className="group glass-card !bg-white/[0.02] !border-white/[0.04] p-5 rounded-2xl transition-all duration-300 hover:!border-amber-500/15 hover:!bg-amber-500/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                  <Gift className="h-4 w-4 text-amber-400" />
                </div>
                <Label className="text-sm font-semibold text-slate-200">
                  Starter Package
                </Label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-medium text-slate-400 glass-input !border-white/[0.06] px-2 py-0.5 rounded-md">
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
                    'glass-input',
                    'rounded-xl',
                    'outline-none',
                    'transition-all duration-200',
                    'hover:border-white/15',
                  )}
                  placeholder="0"
                  aria-label="Starter package price"
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 ml-13">
                Includes 1-month subscription + audio recording
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={saveGlobalSettings}
              disabled={savingSettings || !settingsDirty}
              className={cn(
                'bg-gradient-to-r from-teal-500 to-cyan-500',
                'hover:from-teal-600 hover:to-cyan-600',
                'text-white shadow-[0_0_20px_rgba(20,184,166,0.25)]',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                'transition-all duration-200',
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
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Info Card ────────────────────────────────────────────────────── */}
      <div className="glass-card !bg-white/[0.02] !border-white/[0.06] overflow-hidden relative">
        <div className="py-5 px-6">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-teal-500/10 border border-cyan-500/10 shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-sm text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200">
                How the calculation works
              </p>
              <p>
                <code className="text-xs glass-input !py-1 px-2.5 rounded-lg font-mono border-white/[0.06]">
                  Total = Price/User × Users × Months + Audio Recording (if selected)
                </code>
              </p>
              <p className="text-xs text-slate-400">
                Example: Tier 11–25, 20 users, 6 months = 12,000 × 20 × 6 = {formatTZS(12000 * 20 * 6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
