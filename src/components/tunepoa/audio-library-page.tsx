'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Music,
  Upload,
  Play,
  Pause,
  Pencil,
  Trash2,
  Star,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Loader2,
  FileAudio,
  Clock,
  HardDrive,
  Plus,
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

export function AudioLibraryPage() {
  const { user, token } = useAppStore()
  const { toast } = useToast()

  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Upload
  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', category: 'ringback' })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' })
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AudioTrack | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Play (visual only)
  const [playingId, setPlayingId] = useState<string | null>(null)

  /* ---- Fetch tracks ---- */

  const fetchTracks = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('category', activeTab)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/audio?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch tracks')
      setTracks(data.data?.tracks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }, [token, activeTab, searchQuery])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  /* ---- Upload ---- */

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title.trim() || !token) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('title', uploadForm.title.trim())
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + Math.random() * 20, 90))
      }, 300)

      const res = await fetch('/api/audio', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload track')
      }

      toast({ title: 'Upload Successful', description: `"${uploadForm.title}" has been uploaded.` })
      resetUploadForm()
      fetchTracks()
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Failed to upload',
        variant: 'destructive',
      })
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const resetUploadForm = () => {
    setUploadFile(null)
    setUploadForm({ title: '', description: '', category: 'ringback' })
    setUploadProgress(0)
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadFile(file)
      if (!uploadForm.title) setUploadForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }))
    }
  }

  /* ---- Edit ---- */

  const handleEdit = (track: AudioTrack) => {
    setEditingTrack(track)
    setEditForm({ title: track.title, description: track.description || '', category: track.category })
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
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update', variant: 'destructive' })
    } finally {
      setSaving(false)
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
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete')
      toast({ title: 'Deleted', description: `"${deleteTarget.title}" has been removed.` })
      setDeleteTarget(null)
      fetchTracks()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  /* ---- Render: Loading ---- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  /* ---- Render: Main ---- */

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
            <Music className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Audio Library</h1>
              <Badge variant="secondary" className="text-xs font-semibold">{tracks.length}</Badge>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Manage your audio tracks and ringback tones</p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20"
          onClick={() => setShowUpload(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Audio
        </Button>
      </div>

      {/* Upload Section (expandable) */}
      {showUpload && (
        <div className="glass-card p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Upload New Track</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowUpload(false); resetUploadForm() }} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
              dragOver
                ? 'border-teal-400 bg-teal-500/10'
                : uploadFile
                ? 'border-teal-500/30 bg-teal-500/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setUploadFile(file)
                  if (!uploadForm.title) setUploadForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }))
                }
              }}
            />
            {uploadFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileAudio className="h-10 w-10 text-teal-400" />
                <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(uploadFile.size)}</p>
                <Button variant="ghost" size="sm" className="text-slate-400 text-xs mt-1" onClick={(e) => { e.stopPropagation(); resetUploadForm() }}>
                  Change file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-slate-500" />
                <p className="text-sm text-slate-300">Drag & drop audio file here or click to browse</p>
                <p className="text-xs text-slate-500">MP3, WAV, OGG up to 50MB</p>
              </div>
            )}
          </div>

          {/* Upload Form Fields */}
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Title</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Track title"
                className="h-11 glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Category</Label>
              <Select value={uploadForm.category} onValueChange={(v) => setUploadForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="h-11 glass-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ringback">Ringback Tone</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="hold">Hold Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label className="text-sm text-slate-300">Description (optional)</Label>
            <Textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description..."
              rows={2}
              className="glass-input resize-none"
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-slate-400 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end mt-5">
            <Button
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
              onClick={handleUpload}
              disabled={!uploadFile || !uploadForm.title.trim() || uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload Track'}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 glass-subtle rounded-xl">
          {[
            { key: 'all', label: 'All' },
            { key: 'ringback', label: 'Ringback' },
            { key: 'promo', label: 'Promo' },
            { key: 'hold', label: 'Hold' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 glass-input"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchTracks} className="shrink-0">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchTracks} className="text-red-300 hover:text-red-200">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {tracks.length === 0 && !error && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Music className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300">No audio tracks found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Upload your first audio track to get started with ringback tones.
          </p>
          <Button
            className="mt-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            onClick={() => setShowUpload(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Your First Track
          </Button>
        </div>
      )}

      {/* Audio Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="glass-card p-4 animate-fade-in-up">
            {/* Waveform placeholder */}
            <div className="relative h-28 rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-teal-400 rounded-full"
                    style={{
                      height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 20}%`,
                    }}
                  />
                ))}
              </div>
              {/* Play button */}
              <button
                onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                className="relative z-10 h-12 w-12 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center hover:bg-teal-500/30 transition-all group-hover:scale-110"
              >
                {playingId === track.id ? (
                  <Pause className="h-5 w-5 text-teal-400" />
                ) : (
                  <Play className="h-5 w-5 text-teal-400 ml-0.5" />
                )}
              </button>
              {/* Default star */}
              {track.isDefault && (
                <div className="absolute top-2 right-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white text-sm truncate flex-1">{track.title}</h3>
                <Badge variant="outline" className={`text-xs shrink-0 ${CATEGORY_COLORS[track.category] || ''}`}>
                  {track.category}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(track.duration)}</span>
                <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatFileSize(track.fileSize)}</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs ${STATUS_COLORS[track.status] || ''}`}>
                  {track.status === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {track.status}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(track)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(track)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrack} onOpenChange={(open) => !open && setEditingTrack(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="h-11 glass-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="h-11 glass-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ringback">Ringback Tone</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="hold">Hold Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="glass-input resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTrack(null)}>Cancel</Button>
            <Button
              className="bg-tp-600 hover:bg-tp-700 text-white"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
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
              Are you sure you want to delete <span className="font-semibold text-slate-300">{deleteTarget?.title}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
