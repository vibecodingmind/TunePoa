'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PlusCircle, Edit, RefreshCw, Loader2, Radio } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MnoProvider {
  id: string
  name: string
  country: string
  code: string
  apiEndpoint: string | null
  isActive: boolean
  notes: string | null
  _count: { subscriptions: number }
}

const defaultForm = {
  name: '',
  code: '',
  country: 'Tanzania',
  apiEndpoint: '',
  isActive: true,
  notes: '',
}

export function AdminMno() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<MnoProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<MnoProvider | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/mno-providers')
      const data = await res.json()
      if (data.success && data.data) {
        setProviders(data.data?.providers || [])
      } else {
        console.error('Failed to fetch providers:', data.error)
        setProviders([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProviders() }, [])

  const openCreate = () => {
    setEditingProvider(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (provider: MnoProvider) => {
    setEditingProvider(provider)
    setForm({
      name: provider.name,
      code: provider.code,
      country: provider.country,
      apiEndpoint: provider.apiEndpoint || '',
      isActive: provider.isActive,
      notes: provider.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setActionLoading(true)
    try {
      const body = {
        name: form.name,
        code: form.code,
        country: form.country,
        apiEndpoint: form.apiEndpoint || null,
        isActive: form.isActive,
        notes: form.notes || null,
      }

      const res = await fetch('/api/mno-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({ title: 'Created', description: 'MNO provider created successfully' })
        fetchProviders()
        setDialogOpen(false)
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to create', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (provider: MnoProvider) => {
    try {
      // Since we only have POST, we show a toast
      toast({ title: 'Info', description: `Provider ${!provider.isActive ? 'activated' : 'deactivated'}. (Update endpoint needed for MNO providers)` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid sm:grid-cols-2 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MNO Providers</h1>
          <p className="text-gray-500 text-sm mt-1">Mobile Network Operators for ringback tone delivery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProviders}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}><PlusCircle className="h-4 w-4 mr-2" /> Add Provider</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(provider => (
          <Card key={provider.id} className={`border-0 shadow-sm ${!provider.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Radio className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <Badge variant="outline" className="text-xs">{provider.code}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(provider)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                <p>📍 {provider.country}</p>
                {provider.apiEndpoint && <p>🔗 {provider.apiEndpoint}</p>}
                {provider.notes && <p className="text-xs italic mt-1">"{provider.notes}"</p>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{provider._count.subscriptions} subscriptions</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`mno-toggle-${provider.id}`} className="text-xs">{provider.isActive ? 'Active' : 'Inactive'}</Label>
                  <Switch id={`mno-toggle-${provider.id}`} checked={provider.isActive} onCheckedChange={() => handleToggleActive(provider)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add MNO Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Vodacom Tanzania" />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g., VODACOM" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>API Endpoint (Optional)</Label>
              <Input value={form.apiEndpoint} onChange={(e) => setForm(p => ({ ...p, apiEndpoint: e.target.value }))} placeholder="https://api.provider.co.tz/rbt" />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600" disabled={actionLoading || !form.name || !form.code} onClick={handleSave}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
