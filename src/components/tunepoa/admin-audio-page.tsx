'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Music,
  Play,
  Pause,
  Pencil,
  Trash2,
  Star,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileAudio,
  Clock,
  HardDrive,
  CheckCircle2,
  Ban,
  Eye,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Types */
/* ========================================================================= */

interface AudioTrack {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  duration: number | null
  mimeType: string
  category: string
  status: string
  isDefault: boolean
  createdAt: string
  user: { id: string; name: string; email: string; businessName?: string }
}

/* ========================================================================= */
/* Helpers */
/* ========================================================================= */

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  INACTIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  PROCESSING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

const CATEGORY_COLORS: Record<string, string> = {
  ringback: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  promo: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  hold: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ========================================================================= */
/* Main Component */
/* ========================================================================= */

export function AdminAudioPage() {
  const { token } = useAppStore()
  const { toast } = useToast()

  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', status: '' })
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AudioTrack | null>(null)
  const [deleting, setDeleting] = useState(false)

  // View detail
  const [viewTrack, setViewTrack] = useState<AudioTrack | null>(null)

  // Play (visual)
  const [playingId, setPlayingId] = useState<string | null>(null)

  /* ---- Fetch ---- */

  const fetchTracks = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/audio?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch')
      setTracks(data.data?.tracks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }, [token, statusFilter, categoryFilter, searchQuery])

  useEffect(() => { fetchTracks() }, [fetchTracks])

  /* ---- Edit ---- */

  const handleEdit = (track: AudioTrack) => {
    setEditingTrack(track)
    setEditForm({ title: track.title, description: track.description || '', category: track.category, status: track.status })
  }

  const handleSaveEdit = async () => {
    if (!editingTrack || !token) return
    setSaving(true)
    try {
      const res = await fetch(`/api/audio/${editingTrack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update')
      toast({ title: 'Updated', description: 'Track has been updated.' })
      setEditingTrack(null)
      fetchTracks()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  /* ---- Status Toggle ---- */

  const handleToggleStatus = async (track: AudioTrack, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/audio/${track.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast({ title: 'Status Updated', description: `Track is now ${newStatus}` })
      fetchTracks()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  /* ---- Delete ---- */

  const handleDelete = async () => {
    if (!deleteTarget || !token) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/audio/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast({ title: 'Deleted', description: 'Track removed.' })
      setDeleteTarget(null)
      fetchTracks()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  /* ---- Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      </div>
    )
  }

  /* ---- Render ---- */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
          <Music className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Audio Management</h1>
            <Badge variant="secondary" className="text-xs font-semibold">{tracks.length}</Badge>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Manage all users&apos; audio tracks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-[140px] glass-input"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-10 w-[140px] glass-input"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ringback">Ringback</SelectItem>
            <SelectItem value="promo">Promo</SelectItem>
            <SelectItem value="hold">Hold</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 glass-input"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchTracks}>
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
      {tracks.length === 0 && !error && (
        <div className="glass-card p-12 text-center">
          <Music className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No audio tracks found</h3>
          <p className="text-sm text-slate-400 mt-1">No tracks match your current filters.</p>
        </div>
      )}

      {/* Table */}
      {tracks.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06]">
                  <TableHead className="text-xs text-slate-400">Track</TableHead>
                  <TableHead className="text-xs text-slate-400">User</TableHead>
                  <TableHead className="text-xs text-slate-400">Category</TableHead>
                  <TableHead className="text-xs text-slate-400">Size / Duration</TableHead>
                  <TableHead className="text-xs text-slate-400">Status</TableHead>
                  <TableHead className="text-xs text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => (
                  <TableRow key={track.id} className="border-white/[0.04]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                          className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 hover:bg-teal-500/20 transition-all"
                        >
                          {playingId === track.id ? <Pause className="h-3.5 w-3.5 text-teal-400" /> : <Play className="h-3.5 w-3.5 text-teal-400 ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{track.title}</p>
                          {track.isDefault && <Star className="h-3 w-3 text-amber-400 fill-amber-400 inline mt-0.5" />}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-300">{track.user.name}</p>
                      <p className="text-xs text-slate-500">{track.user.businessName || track.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[track.category] || ''}`}>
                        {track.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatFileSize(track.fileSize)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(track.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[track.status] || ''}`}>
                        {track.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewTrack(track)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleEdit(track)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {track.status === 'ACTIVE' ? (
                          <button onClick={() => handleToggleStatus(track, 'INACTIVE')} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Deactivate">
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => handleToggleStatus(track, 'ACTIVE')} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Activate">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(track)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTrack} onOpenChange={(open) => !open && setEditingTrack(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Track</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="h-11 glass-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-11 glass-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ringback">Ringback</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="hold">Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-11 glass-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTrack(null)}>Cancel</Button>
            <Button className="bg-tp-600 hover:bg-tp-700 text-white" onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewTrack} onOpenChange={(open) => !open && setViewTrack(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Track Details</DialogTitle></DialogHeader>
          {viewTrack && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Title:</span><p className="text-white font-medium">{viewTrack.title}</p></div>
                <div><span className="text-slate-400">Category:</span><Badge variant="outline" className={`ml-2 text-xs ${CATEGORY_COLORS[viewTrack.category] || ''}`}>{viewTrack.category}</Badge></div>
                <div><span className="text-slate-400">Status:</span><Badge variant="outline" className={`ml-2 text-xs ${STATUS_COLORS[viewTrack.status] || ''}`}>{viewTrack.status}</Badge></div>
                <div><span className="text-slate-400">Default:</span><p className="text-white">{viewTrack.isDefault ? 'Yes' : 'No'}</p></div>
                <div><span className="text-slate-400">File Size:</span><p className="text-white">{formatFileSize(viewTrack.fileSize)}</p></div>
                <div><span className="text-slate-400">Duration:</span><p className="text-white">{formatDuration(viewTrack.duration)}</p></div>
                <div><span className="text-slate-400">User:</span><p className="text-white">{viewTrack.user.name}</p></div>
                <div><span className="text-slate-400">Business:</span><p className="text-white">{viewTrack.user.businessName || 'N/A'}</p></div>
              </div>
              {viewTrack.description && (
                <div>
                  <span className="text-slate-400 text-sm">Description:</span>
                  <p className="text-white text-sm mt-1">{viewTrack.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-400" />
              </div>
              Delete Track
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-300">{deleteTarget?.title}</span>? This cannot be undone.
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
