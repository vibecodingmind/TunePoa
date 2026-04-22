'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Loader2,
  Pencil,
  ToggleLeft,
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

const formatNumber = (n: number) => n.toLocaleString('en-TZ')

// ─── Tier Card Component ─────────────────────────────────────────────────────
// Each tier is displayed as a clear card with all fields visible and labeled.

function TierCard({
  tier,
  isDirty,
  isSaving,
  onUpdate,
  onSave,
  onDelete,
  onToggleActive,
}: {
  tier: PricingTier
  isDirty: boolean
  isSaving: boolean
  onUpdate: (field: string, value: unknown) => void
  onSave: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  const [editing, setEditing] = useState(false)
  const userRange = tier.maxUsers >= 999 ? `${tier.minUsers}+` : `${tier.minUsers} – ${tier.maxUsers}`

  // Simple input field helper
  const FieldInput = ({
    label,
    sublabel,
    value,
    onChange,
    type = 'text',
    prefix,
  }: {
    label: string
    sublabel?: string
    value: string | number
    onChange: (v: string) => void
    type?: string
    prefix?: string
  }) => (
    <div className={cn(
      'rounded-xl p-3 transition-all duration-200',
      editing ? 'bg-teal-500/[0.06] border border-teal-500/20' : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1]'
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        {sublabel && <span className="text-[10px] text-teal-500/60 font-medium">{sublabel}</span>}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            if (!editing) setEditing(true)
          }}
          className={cn(
            'w-full text-sm font-semibold text-white bg-transparent outline-none',
            prefix ? 'pl-12 pr-2' : 'px-2',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
      </div>
    </div>
  )

  return (
    <div className={cn(
      'glass-card overflow-hidden transition-all duration-300',
      isDirty && 'ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
      !tier.isActive && 'opacity-50'
    )}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-9 h-9 rounded-xl',
            tier.isActive
              ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/15 border border-teal-500/20'
              : 'bg-white/[0.05] border border-white/[0.08]'
          )}>
            <Users className={cn('h-4 w-4', tier.isActive ? 'text-teal-400' : 'text-slate-500')} />
          </div>
          <div>
            <input
              type="text"
              value={tier.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="text-base font-bold text-white bg-transparent outline-none w-40 placeholder-slate-600"
              placeholder="Tier name..."
            />
            <p className="text-[11px] text-slate-500 font-medium">{userRange} users</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Unsaved
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <Switch
              checked={tier.isActive}
              onCheckedChange={onToggleActive}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-cyan-500 data-[state=unchecked]:bg-white/10"
            />
            <span className={cn('text-[11px] font-semibold', tier.isActive ? 'text-teal-400' : 'text-slate-500')}>
              {tier.isActive ? 'Active' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {/* User Range */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">User Range</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-medium block mb-1">Min Users</span>
              <input
                type="number"
                value={tier.minUsers}
                onChange={(e) => onUpdate('minUsers', parseInt(e.target.value) || 0)}
                className="w-full text-lg font-bold text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-medium block mb-1">Max Users</span>
              <input
                type="number"
                value={tier.maxUsers}
                onChange={(e) => onUpdate('maxUsers', parseInt(e.target.value) || 0)}
                className="w-full text-lg font-bold text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Prices */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Price per User (TZS)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { field: 'price1Month', label: '1 Month', key: '1mo', popular: false },
              { field: 'price3Month', label: '3 Months', key: '3mo', popular: false },
              { field: 'price6Month', label: '6 Months', key: '6mo', popular: true },
              { field: 'price12Month', label: '12 Months', key: '12mo', popular: false },
            ] as const).map(({ field, label, key, popular }) => (
              <div key={key} className="relative">
                {popular && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold uppercase shadow-sm z-10">
                    Popular
                  </span>
                )}
                <div className={cn(
                  'rounded-xl p-3 transition-all duration-200',
                  popular
                    ? 'bg-teal-500/[0.06] border border-teal-500/20'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                )}>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">{label}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">TZS</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tier[field]}
                      onChange={(e) => {
                        const num = parseInt(e.target.value.replace(/,/g, ''), 10) || 0
                        onUpdate(field, num)
                      }}
                      className="w-full text-base font-bold text-white bg-transparent outline-none font-mono"
                    />
                  </div>
                  {tier[field] > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                      {formatNumber(Math.round(tier[field] / parseInt(field.replace('price', '').replace('Month', ''))))}/mo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors gap-1.5 text-xs h-8 px-3"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className={cn(
              'gap-1.5 text-xs h-9 px-5 rounded-xl font-semibold transition-all duration-200',
              isDirty
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5'
                : 'bg-white/[0.06] text-slate-500 cursor-default'
            )}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>
    </div>
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
        showToast('success', 'New tier added — fill in the details')
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
      showToast('success', 'Settings saved')
    } catch {
      showToast('error', 'Network error')
    }
    setSavingSettings(false)
  }

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-72 rounded-2xl glass-card animate-pulse" style={{ opacity: 0.4 }} />
        ))}
      </div>
    )
  }

  const sortedTiers = [...tiers].sort((a, b) => a.displayOrder - b.displayOrder)
  const dirtyCount = dirty.size

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/15 border border-teal-500/20">
              <DollarSign className="h-5 w-5 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Service Pricing</h1>
          </div>
          <p className="text-sm text-slate-400 ml-13">
            Manage your pricing tiers — each card is one tier with all its settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { fetchTiers(); fetchSettings(); }}
            className="text-slate-400 hover:text-white hover:bg-white/[0.06] gap-1.5 text-xs h-9 px-3 rounded-xl border border-white/[0.08]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── Toast Notification ───────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium',
          'backdrop-blur-xl shadow-2xl',
          'transition-all duration-300 transform',
          toast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none',
          toast?.type === 'success'
            ? 'bg-teal-500/20 border border-teal-500/30 text-teal-200'
            : 'bg-red-500/20 border border-red-500/30 text-red-200',
        )}
        role="alert"
      >
        {toast?.type === 'success' ? (
          <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
        ) : (
          <span className="text-red-400 shrink-0">✕</span>
        )}
        {toast?.text}
      </div>

      {/* ─── Tier Cards ─────────────────────────────────────────────────── */}
      {sortedTiers.length > 0 && (
        <div className="space-y-5">
          {sortedTiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isDirty={dirty.has(tier.id)}
              isSaving={savingTierId === tier.id}
              onUpdate={(field, value) => updateTierField(tier.id, field, value)}
              onSave={() => saveTier(tier)}
              onDelete={() => deleteTier(tier)}
              onToggleActive={() => toggleTierActive(tier)}
            />
          ))}
        </div>
      )}

      {tiers.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] mx-auto mb-4">
            <DollarSign className="h-7 w-7 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-300 mb-1">No pricing tiers yet</p>
          <p className="text-xs text-slate-500">Create your first tier below to get started.</p>
        </div>
      )}

      {/* ─── Add New Tier Button ────────────────────────────────────────── */}
      <button
        onClick={addTier}
        className="w-full glass-card !bg-white/[0.02] py-5 flex items-center justify-center gap-2.5 text-slate-400 hover:text-teal-400 hover:!border-teal-500/30 hover:!bg-teal-500/[0.03] transition-all duration-300 group"
      >
        <div className="h-8 w-8 rounded-lg border-2 border-dashed border-current/30 flex items-center justify-center group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all duration-300">
          <Plus className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">Add New Pricing Tier</span>
      </button>

      {/* ─── Add-on Settings ─────────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 border border-violet-500/15">
              <Gift className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Add-on Settings</h2>
              <p className="text-[11px] text-slate-500">Flat-fee add-on services</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Audio Recording */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/10">
                  <Music className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <Label className="text-xs font-semibold text-slate-300">Audio Recording Price</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">TZS</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={audioPrice}
                  onChange={(e) => {
                    setAudioPrice(e.target.value.replace(/[^0-9,]/g, ''))
                    setSettingsDirty(true)
                  }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm font-mono font-bold text-white glass-input rounded-xl outline-none"
                  placeholder="0"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 ml-9">Flat fee for professional studio recording</p>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/10">
                  <Gift className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <Label className="text-xs font-semibold text-slate-300">Starter Package Price</Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">TZS</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={starterPrice}
                  onChange={(e) => {
                    setStarterPrice(e.target.value.replace(/[^0-9,]/g, ''))
                    setSettingsDirty(true)
                  }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm font-mono font-bold text-white glass-input rounded-xl outline-none"
                  placeholder="0"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 ml-9">Includes 1-month sub + audio recording</p>
            </div>
          </div>

          {settingsDirty && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={saveGlobalSettings}
                disabled={savingSettings}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                {savingSettings ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
              <span className="text-[11px] text-amber-400 font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── How It Works Info ───────────────────────────────────────────── */}
      <div className="glass-card p-5 !bg-white/[0.02] flex gap-3">
        <Info className="h-5 w-5 text-cyan-500/60 mt-0.5 shrink-0" />
        <div className="text-[13px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">How pricing works</p>
          <p>
            Each tier defines a price <strong className="text-slate-300">per user per month</strong> depending on subscription length.
            Longer plans are cheaper per month.
          </p>
          <p className="text-xs text-slate-500">
            Formula: Total = Price/User × Users × Months + Audio (if selected)
          </p>
        </div>
      </div>
    </div>
  )
}
