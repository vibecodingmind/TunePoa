'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Music,
  Play,
  Pause,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Volume2,
  Search,
  X,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SampleTune {
  id: string
  title: string
  category: string
  description: string | null
  audioUrl: string
  duration: number | null
  isActive: boolean
  displayOrder: number
  createdAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  promo: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  branding: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  offer: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  announcement: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  hold: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AdminSampleTunesPage() {
  const { token } = useAppStore()
  const { toast } = useToast()

  const [tunes, setTunes] = useState<SampleTune[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', category: 'promo', audioUrl: '', description: '', duration: '' })
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<SampleTune | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Audio play
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useState<HTMLAudioElement | null>(null)

  const fetchTunes = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sample-tunes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok && !data.success) throw new Error(data.error || 'Failed to fetch')
      // Also fetch inactive ones for admin
      const allRes = await fetch('/api/sample-tunes?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
      if (allRes && allRes.ok) {
        const allData = await allRes.json()
        if (allData.success) {
          setTunes(allData.data || [])
        } else {
          setTunes(data.data || [])
        }
      } else {
        setTunes(data.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tunes')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchTunes() }, [fetchTunes])

  // Note: The GET endpoint only returns active tunes. For admin, we need to show all.
  // Let's use a workaround - fetch all tunes including inactive.
  // Since the GET endpoint only returns active ones, for admin we show those plus allow adding/deleting.
  // This is a simplification; in production, we'd add an admin-specific GET endpoint.

  const filteredTunes = tunes.filter((t) => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActive = showInactive || t.isActive
    return matchesSearch && matchesActive
  })

  const handlePlay = (tune: SampleTune) => {
    if (playingId === tune.id) {
      setPlayingId(null)
      return
    }
    setPlayingId(tune.id)
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ title: '', category: 'promo', audioUrl: '', description: '', duration: '' })
    setDialogOpen(true)
  }

  const openEdit = (tune: SampleTune) => {
    setEditId(tune.id)
    setForm({
      title: tune.title,
      category: tune.category,
      audioUrl: tune.audioUrl,
      description: tune.description || '',
      duration: tune.duration?.toString() || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!token || !form.title || !form.audioUrl) return
    setSaving(true)
    try {
      const body: Record<string, string> = {
        title: form.title,
        category: form.category,
        audioUrl: form.audioUrl,
        description: form.description,
      }
      if (form.duration) body.duration = form.duration

      let res: Response
      if (editId) {
        res = await fetch(`/api/sample-tunes/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/sample-tunes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save')

      toast({ title: editId ? 'Updated' : 'Created', description: `Sample tune ${editId ? 'updated' : 'created'} successfully.` })
      setDialogOpen(false)
      fetchTunes()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !token) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/sample-tunes/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast({ title: 'Deleted', description: 'Sample tune removed.' })
      setDeleteTarget(null)
      fetchTunes()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Music className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Sample Tunes</h1>
              <Badge variant="secondary" className="text-xs font-semibold">{filteredTunes.length}</Badge>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Manage public sample ringback tunes</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tune
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search tunes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 pl-9 glass-input" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-slate-600"
          />
          Show inactive
        </label>
        <Button variant="outline" size="sm" onClick={fetchTunes}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
        </div>
      )}

      {/* Empty */}
      {filteredTunes.length === 0 && !error && (
        <div className="glass-card p-12 text-center">
          <Music className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No sample tunes found</h3>
          <p className="text-sm text-slate-400 mt-1">Add your first sample tune to get started.</p>
        </div>
      )}

      {/* Tunes List */}
      {filteredTunes.length > 0 && (
        <div className="space-y-3">
          {filteredTunes.map((tune) => (
            <div key={tune.id} className={`glass-card p-5 flex items-center gap-4 transition-all duration-300 ${!tune.isActive ? 'opacity-50' : ''}`}>
              {/* Play button */}
              <button
                onClick={() => handlePlay(tune)}
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  playingId === tune.id
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
                }`}
              >
                {playingId === tune.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white truncate">{tune.title}</p>
                  <Badge variant="outline" className={`text-xs shrink-0 ${CATEGORY_COLORS[tune.category] || ''}`}>
                    {tune.category}
                  </Badge>
                  {!tune.isActive && (
                    <Badge variant="outline" className="text-xs bg-slate-500/15 text-slate-400 border-slate-500/25">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="truncate max-w-[200px]">{tune.audioUrl}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Volume2 className="h-3 w-3" />
                    {formatDuration(tune.duration)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(tune)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(tune)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Sample Tune' : 'Add Sample Tune'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Tune title" className="h-11 glass-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-11 glass-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="hold">Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (sec)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 30" className="h-11 glass-input" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Audio URL *</Label>
              <Input value={form.audioUrl} onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))} placeholder="https://example.com/audio.mp3" className="h-11 glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" className="glass-input resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.audioUrl} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? 'Save Changes' : 'Add Tune'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sample Tune</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-300">{deleteTarget?.title}</span>? This will deactivate the tune.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white border-0">
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
