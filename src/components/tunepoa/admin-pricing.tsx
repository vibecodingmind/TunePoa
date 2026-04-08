'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  Music,
  Gift,
  Info,
} from 'lucide-react'

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

const DURATION_HEADERS = [
  { key: '1', label: 'Mwezi 1', sublabel: '1 Month' },
  { key: '3', label: 'Mwezi 3', sublabel: '3 Months' },
  { key: '6', label: 'Mwezi 6', sublabel: '6 Months' },
  { key: '12', label: 'Mwezi 12', sublabel: '12 Months' },
]

export function AdminPricing() {
  const { token } = useAppStore()
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [settings, setSettings] = useState<Record<string, PricingSetting>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null)
  const [isNewTier, setIsNewTier] = useState(false)

  // Edit form
  const [formName, setFormName] = useState('')
  const [formMinUsers, setFormMinUsers] = useState(1)
  const [formMaxUsers, setFormMaxUsers] = useState(10)
  const [formPrice1, setFormPrice1] = useState(0)
  const [formPrice3, setFormPrice3] = useState(0)
  const [formPrice6, setFormPrice6] = useState(0)
  const [formPrice12, setFormPrice12] = useState(0)
  const [formActive, setFormActive] = useState(true)

  // Audio recording price
  const [audioPrice, setAudioPrice] = useState('15000')
  const [starterPrice, setStarterPrice] = useState('30000')
  const [savingSettings, setSavingSettings] = useState(false)

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
    Promise.all([fetchTiers(), fetchSettings()]).then(() => setLoading(false))
  }, [fetchTiers, fetchSettings])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // ─── Tier CRUD ───

  const openNewTier = () => {
    setIsNewTier(true)
    setEditingTier(null)
    setFormName('')
    setFormMinUsers(1)
    setFormMaxUsers(10)
    setFormPrice1(0)
    setFormPrice3(0)
    setFormPrice6(0)
    setFormPrice12(0)
    setFormActive(true)
    setEditDialogOpen(true)
  }

  const openEditTier = (tier: PricingTier) => {
    setIsNewTier(false)
    setEditingTier(tier)
    setFormName(tier.name)
    setFormMinUsers(tier.minUsers)
    setFormMaxUsers(tier.maxUsers)
    setFormPrice1(tier.price1Month)
    setFormPrice3(tier.price3Month)
    setFormPrice6(tier.price6Month)
    setFormPrice12(tier.price12Month)
    setFormActive(tier.isActive)
    setEditDialogOpen(true)
  }

  const saveTier = async () => {
    if (!formName || formMinUsers < 1) {
      showMessage('error', 'Jina na idadi ya watumiaji ni lazima')
      return
    }

    setSaving(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      if (isNewTier) {
        const res = await fetch('/api/pricing-tiers', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: formName,
            minUsers: formMinUsers,
            maxUsers: formMaxUsers,
            price1Month: formPrice1,
            price3Month: formPrice3,
            price6Month: formPrice6,
            price12Month: formPrice12,
          }),
        })
        const data = await res.json()
        if (data.success) {
          showMessage('success', 'Tier imeongezwa kikamilifu!')
        } else {
          showMessage('error', data.error || 'Hitilafu imetokea')
        }
      } else if (editingTier) {
        const res = await fetch(`/api/pricing-tiers/${editingTier.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            name: formName,
            minUsers: formMinUsers,
            maxUsers: formMaxUsers,
            price1Month: formPrice1,
            price3Month: formPrice3,
            price6Month: formPrice6,
            price12Month: formPrice12,
            isActive: formActive,
          }),
        })
        const data = await res.json()
        if (data.success) {
          showMessage('success', 'Tier imeboreshwa kikamilifu!')
        } else {
          showMessage('error', data.error || 'Hitilafu imetokea')
        }
      }
      setEditDialogOpen(false)
      await fetchTiers()
    } catch (err) {
      showMessage('error', 'Hitilafu ya mtandao')
    }
    setSaving(false)
  }

  const deactivateTier = async (tier: PricingTier) => {
    if (!confirm(`Futa tier "${tier.name}"? Hii itafanya tier isiwe hai.`)) return
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/pricing-tiers/${tier.id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Tier imefutwa')
        await fetchTiers()
      } else {
        showMessage('error', data.error || 'Hitilafu imetokea')
      }
    } catch {
      showMessage('error', 'Hitilafu ya mtandao')
    }
  }

  // ─── Settings ───

  const saveGlobalSettings = async () => {
    setSavingSettings(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
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

      showMessage('success', 'Mipangilio imehifadhiwa!')
    } catch {
      showMessage('error', 'Hitilafu ya mtandao')
    }
    setSavingSettings(false)
  }

  const formatTZS = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gharama za Huduma</h1>
          <p className="text-sm text-slate-500 mt-1">Simamia bei za huduma zako — matrix ya bei kulingana na idadi ya watumiaji na muda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchTiers(); fetchSettings(); }}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={openNewTier} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1.5" />
            Ongeza Tier
          </Button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message.text}
        </div>
      )}

      {/* Pricing Matrix Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Pricing Matrix — Gharama (TZS / Mtumiaji / Mwezi)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 w-32">
                    Namba<br />
                    <span className="text-xs font-normal text-slate-400">Users</span>
                  </th>
                  {DURATION_HEADERS.map((d) => (
                    <th key={d.key} className="text-center py-3 px-4 font-semibold text-slate-700">
                      {d.label}<br />
                      <span className="text-xs font-normal text-slate-400">{d.sublabel}</span>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 w-28">Hali</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 w-24">Vitendo</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{tier.name}</div>
                      <div className="text-xs text-slate-400">{tier.minUsers}–{tier.maxUsers === 999 ? '50+' : tier.maxUsers} users</div>
                    </td>
                    {[
                      tier.price1Month,
                      tier.price3Month,
                      tier.price6Month,
                      tier.price12Month,
                    ].map((price, i) => (
                      <td key={i} className="text-center py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800">
                          {price.toLocaleString()}
                        </span>
                      </td>
                    ))}
                    <td className="text-center py-3 px-4">
                      <Badge variant={tier.isActive ? 'default' : 'secondary'}
                        className={tier.isActive
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'}
                      >
                        {tier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600"
                          onClick={() => openEditTier(tier)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => deactivateTier(tier)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tiers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Hakuna pricing tiers. Bonyeza &quot;Ongeza Tier&quot; kuunda moja.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Mipangilio ya Ziada — Add-on Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Recording Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Music className="h-4 w-4 text-emerald-500" />
                Audio Recording — Bei (TZS)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">TZS</span>
                <Input
                  type="number"
                  value={audioPrice}
                  onChange={(e) => setAudioPrice(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-xs text-slate-400">Bei ya kurekodi audio ya tangazo. Bei ya kawaida.</p>
            </div>

            {/* Starter Package Price */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Gift className="h-4 w-4 text-emerald-500" />
                Kifurushi cha Kuanzia — Starter Package (TZS)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">TZS</span>
                <Input
                  type="number"
                  value={starterPrice}
                  onChange={(e) => setStarterPrice(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-xs text-slate-400">Pamoja na usajili wa mwezi 1 + uandikaji wa audio.</p>
            </div>
          </div>

          <Button onClick={saveGlobalSettings} disabled={savingSettings}
            className="bg-emerald-600 hover:bg-emerald-700">
            {savingSettings ? <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
            {savingSettings ? 'Inahifadhi...' : 'Hifadhi Mipangilio'}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-500 space-y-1">
              <p><strong className="text-slate-700">Jinsi hesabu inavyofanya kazi:</strong></p>
              <p>Jumla = Bei ya mtumiaji × Idadi ya watumiaji × Miezi + Audio Recording (kama imechaguliwa)</p>
              <p className="text-xs">Mfano: Tier 11-25, 20 watumiaji, miezi 6 = 12,000 × 20 × 6 = 1,440,000 TZS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit / Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNewTier ? 'Ongeza Pricing Tier' : 'Hariri Pricing Tier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Jina la Tier</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. 1-10, 11-25, 50+"
              />
            </div>

            {/* User Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Min Users</Label>
                <Input type="number" value={formMinUsers}
                  onChange={(e) => setFormMinUsers(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-2">
                <Label>Max Users</Label>
                <Input type="number" value={formMaxUsers}
                  onChange={(e) => setFormMaxUsers(parseInt(e.target.value) || 1)} />
              </div>
            </div>

            {/* Prices */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Bei (TZS / Mtumiaji / Mwezi)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Mwezi 1</Label>
                  <Input type="number" value={formPrice1}
                    onChange={(e) => setFormPrice1(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Mwezi 3</Label>
                  <Input type="number" value={formPrice3}
                    onChange={(e) => setFormPrice3(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Mwezi 6</Label>
                  <Input type="number" value={formPrice6}
                    onChange={(e) => setFormPrice6(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Mwezi 12</Label>
                  <Input type="number" value={formPrice12}
                    onChange={(e) => setFormPrice12(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            {!isNewTier && (
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm font-medium">Tier Iko Hai</Label>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Ghairi</Button>
            <Button onClick={saveTier} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              {isNewTier ? 'Ongeza' : 'Hifadhi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
