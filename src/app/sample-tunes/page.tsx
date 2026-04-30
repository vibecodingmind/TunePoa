'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Music, Play, Pause, Volume2, Search, X } from 'lucide-react'

interface SampleTune {
  id: string
  title: string
  category: string
  description: string | null
  audioUrl: string
  duration: number | null
  isActive: boolean
  displayOrder: number
}

const CATEGORIES = ['All', 'Promo', 'Branding', 'Offer', 'Announcement', 'Hold']

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

export default function SampleTunesPage() {
  const [tunes, setTunes] = useState<SampleTune[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetch('/api/sample-tunes')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTunes(data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredTunes = tunes.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePlay = (tune: SampleTune) => {
    if (playingId === tune.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(tune.audioUrl)
    audio.play().catch(() => {})
    audioRef.current = audio
    setPlayingId(tune.id)

    audio.onended = () => setPlayingId(null)
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <Music className="h-3.5 w-3.5" />
            Sample Tunes
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Explore Our <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Sound Library</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Browse our collection of professionally produced ringback tones. Find the perfect sound for your brand.
          </p>
          <div className="max-w-lg mx-auto rounded-2xl overflow-hidden">
            <Image
              src="/sample-tunes-banner.png"
              alt="Sample Tunes"
              width={1200}
              height={400}
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Filter + Search */}
      <section className="py-8 bg-[#0a1628] sticky top-[72px] z-40 backdrop-blur-xl bg-[#0a1628]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white/[0.06] text-slate-400 hover:text-teal-400 hover:bg-white/10 border border-white/[0.08]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                placeholder="Search tunes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl glass-input text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tunes Grid */}
      <section className="py-16 sm:py-24 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredTunes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Music className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300 mb-1">No tunes found</h3>
              <p className="text-sm text-slate-400">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTunes.map((tune) => (
                <div
                  key={tune.id}
                  className="glass-card group relative p-6 hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Playing indicator */}
                  {playingId === tune.id && (
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1 bg-teal-400 rounded-full animate-bounce" style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  )}

                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(tune)}
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                      playingId === tune.id
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                        : 'bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-105'
                    }`}
                  >
                    {playingId === tune.id ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                  </button>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 truncate">{tune.title}</h3>

                  {/* Category + Duration */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[tune.category] || ''}`}>
                      {tune.category}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      {formatDuration(tune.duration)}
                    </span>
                  </div>

                  {/* Description */}
                  {tune.description && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{tune.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
