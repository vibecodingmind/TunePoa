'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PlusCircle, Edit, RefreshCw, Loader2, Shield, Star, Crown, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Package {
  id: string
  name: string
  description: string
  price: number
  currency: string
  durationMonths: number
  features: string
  maxAdDuration: number
  isActive: boolean
  displayOrder: number
  _count?: { subscriptions: number }
}

const defaultForm = {
  name: '',
  description: '',
  price: '',
  durationMonths: '1',
  features: '',
  maxAdDuration: '30',
  displayOrder: '0',
  isActive: true,
}

export function AdminPackages() {
  const { token } = useAppStore()
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<Package | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      if (data.success && data.data) {
        setPackages(data.data?.packages || [])
      } else {
        console.error('Failed to fetch packages:', data.error)
        setPackages([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPackages() }, [])

  const openCreate = () => {
    setEditingPkg(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (pkg: Package) => {
    setEditingPkg(pkg)
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: String(pkg.price),
      durationMonths: String(pkg.durationMonths),
      features: typeof pkg.features === 'string' ? pkg.features : JSON.stringify(pkg.features),
      maxAdDuration: String(pkg.maxAdDuration),
      displayOrder: String(pkg.displayOrder),
      isActive: pkg.isActive,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setActionLoading(true)
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        durationMonths: parseInt(form.durationMonths),
        features: form.features,
        maxAdDuration: parseInt(form.maxAdDuration),
        displayOrder: parseInt(form.displayOrder),
        isActive: form.isActive,
      }

      let res
      if (editingPkg) {
        res = await fetch(`/api/packages/${editingPkg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
      }

      if (res.ok) {
        toast({ title: editingPkg ? 'Updated' : 'Created', description: `Package ${editingPkg ? 'updated' : 'created'} successfully` })
        fetchPackages()
        setDialogOpen(false)
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to save', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (pkg: Package) => {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      })
      if (res.ok) {
        toast({ title: 'Updated', description: `Package ${!pkg.isActive ? 'activated' : 'deactivated'}` })
        fetchPackages()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const pkgIcons: Record<string, React.ReactNode> = {
    Bronze: <Shield className="h-5 w-5 text-orange-500" />,
    Silver: <Star className="h-5 w-5 text-gray-400" />,
    Gold: <Crown className="h-5 w-5 text-yellow-500" />,
    Platinum: <Zap className="h-5 w-5 text-emerald-500" />,
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid sm:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
          <p className="text-gray-500 text-sm mt-1">{packages.length} packages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPackages}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}><PlusCircle className="h-4 w-4 mr-2" /> Add Package</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id} className={`border-0 shadow-sm ${!pkg.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {pkgIcons[pkg.name]}
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-xl font-bold text-emerald-600">TZS {pkg.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(pkg)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{pkg.durationMonths} month{pkg.durationMonths > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{pkg.maxAdDuration}s max</span>
                  <span>•</span>
                  <span>{pkg._count?.subscriptions || 0} subs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`toggle-${pkg.id}`} className="text-xs text-gray-500">{pkg.isActive ? 'Active' : 'Inactive'}</Label>
                  <Switch id={`toggle-${pkg.id}`} checked={pkg.isActive} onCheckedChange={() => handleToggleActive(pkg)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPkg ? 'Edit Package' : 'Create Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Bronze" />
              </div>
              <div className="space-y-2">
                <Label>Price (TZS)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input type="number" value={form.durationMonths} onChange={(e) => setForm(p => ({ ...p, durationMonths: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Duration (sec)</Label>
                <Input type="number" value={form.maxAdDuration} onChange={(e) => setForm(p => ({ ...p, maxAdDuration: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm(p => ({ ...p, displayOrder: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e) => setForm(p => ({ ...p, features: e.target.value }))} rows={5} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600" disabled={actionLoading || !form.name || !form.price} onClick={handleSave}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingPkg ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
