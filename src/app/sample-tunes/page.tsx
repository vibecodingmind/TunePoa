'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Music, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'

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

/* ---------- helpers ---------- */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatRemaining(seconds: number | null): string {
  if (!seconds) return '-00:00'
  return `-${formatTime(seconds)}`
}

/* ---------- tiny waveform component ---------- */

function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = 30
  return (
    <div className="flex items-center gap-[2px] h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 30 + Math.random() * 70 // 30‑100 %
        return (
          <div
            key={i}
            className={`w-[2px] rounded-full transition-colors duration-500 ${
              isPlaying ? 'bg-teal-400/70' : 'bg-slate-600/60'
            }`}
            style={{
              height: `${h}%`,
              animationDelay: isPlaying ? `${i * 50}ms` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

/* ---------- single audio player card ---------- */

function AudioPlayerCard({
  tune,
  isPlaying,
  onToggle,
  audioRef,
  onTimeUpdate,
  currentTime,
}: {
  tune: SampleTune
  isPlaying: boolean
  onToggle: () => void
  audioRef: React.RefObject<HTMLAudioElement | null>
  onTimeUpdate: () => void
  currentTime: number
}) {
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)
  const duration = tune.duration || 0

  const handleToggle = useCallback(async () => {
    if (isPlaying) {
      audioRef.current?.pause()
      return
    }

    setLoading(true)
    const audio = audioRef.current
    if (!audio) { setLoading(false); return }

    if (audio.src !== tune.audioUrl) {
      audio.src = tune.audioUrl
      audio.load()
    }

    audio.oncanplaythrough = () => {
      audio.play().catch(() => {})
      setLoading(false)
    }

    audio.onerror = () => setLoading(false)
    audio.ontimeupdate = onTimeUpdate
    audio.onended = () => {
      onToggle() // will set playingId to null via parent
      audio.currentTime = 0
    }

    audio.play().catch(() => {}).finally(() => setLoading(false))
  }, [isPlaying, audioRef, tune.audioUrl, onToggle, onTimeUpdate])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-500 ${
        isPlaying
          ? 'bg-gradient-to-br from-teal-600/25 to-cyan-700/15 border-teal-500/40 shadow-lg shadow-teal-500/10'
          : 'bg-[#0d1f35]/80 border-white/[0.08] hover:border-teal-500/25 hover:bg-[#0f2540]/80'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Play / Pause button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
            isPlaying
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105'
              : 'bg-white/[0.08] border border-white/[0.12] text-white hover:bg-white/[0.12] hover:scale-105'
          }`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {/* Title + waveform */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate mb-1.5">{tune.title}</p>
          <div className="flex items-center gap-3">
            <WaveformVisualizer isPlaying={isPlaying} />
          </div>
        </div>

        {/* Volume toggle */}
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !muted
              setMuted(!muted)
            }
          }}
          className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300 shrink-0"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Progress bar + timestamps */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] text-slate-500 font-mono w-10 text-right shrink-0">
          {isPlaying ? formatTime(currentTime) : '00:00'}
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden cursor-pointer">
          <div
            className="h-full rounded-full transition-all duration-200 ease-linear"
            style={{
              width: `${progress}%`,
              background: isPlaying
                ? 'linear-gradient(90deg, #14b8a6, #22d3ee)'
                : 'rgba(255,255,255,0.15)',
            }}
          />
        </div>
        <span className="text-[11px] text-slate-500 font-mono w-10 shrink-0">
          {isPlaying && duration > 0
            ? `-${formatTime(Math.max(0, duration - currentTime))}`
            : formatRemaining(duration)}
        </span>
      </div>
    </div>
  )
}

/* ---------- main page ---------- */

export default function SampleTunesPage() {
  const [tunes, setTunes] = useState<SampleTune[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const globalAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create a shared audio element
    globalAudioRef.current = new Audio()
    globalAudioRef.current.preload = 'auto'

    fetch('/api/sample-tunes')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTunes(data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => {
      globalAudioRef.current?.pause()
      globalAudioRef.current = null
    }
  }, [])

  const handleToggle = useCallback((tuneId: string) => {
    if (playingId === tuneId) {
      globalAudioRef.current?.pause()
      setPlayingId(null)
      setCurrentTime(0)
    } else {
      globalAudioRef.current?.pause()
      setPlayingId(tuneId)
      setCurrentTime(0)
    }
  }, [playingId])

  const handleTimeUpdate = useCallback(() => {
    if (globalAudioRef.current) {
      setCurrentTime(globalAudioRef.current.currentTime)
    }
  }, [])

  /* Skeleton loaders */
  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-72px)] bg-[#080f1e] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="h-4 w-24 bg-white/[0.06] rounded mx-auto mb-4" />
              <div className="h-10 w-96 bg-white/[0.06] rounded mx-auto mb-3" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0d1f35]/80 p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/[0.08]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
                      <div className="h-3 w-full bg-white/[0.06] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-72px)] bg-[#080f1e] py-20 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,111,133,0.08),transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-teal-500/50" />
              <Music className="h-5 w-5 text-teal-400" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-teal-500/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Explore Our RBT Audio Samples
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Browse our collection of professionally crafted ringback tones. Hit play to preview any track.
            </p>
          </div>

          {/* Audio players grid — 2 columns */}
          {tunes.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <Music className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No samples available yet</h3>
              <p className="text-sm text-slate-500">Check back soon — new tunes are on the way.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up">
              {tunes.map((tune) => (
                <AudioPlayerCard
                  key={tune.id}
                  tune={tune}
                  isPlaying={playingId === tune.id}
                  onToggle={() => handleToggle(tune.id)}
                  audioRef={globalAudioRef}
                  onTimeUpdate={handleTimeUpdate}
                  currentTime={currentTime}
                />
              ))}
            </div>
          )}

          {/* Bottom decorative divider */}
          <div className="mt-20 flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/[0.06]" />
            <Music className="h-4 w-4 text-slate-700" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
