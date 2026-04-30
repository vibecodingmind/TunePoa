'use client'

import { useState, useEffect } from 'react'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Star, Sparkles, Zap, ArrowRight } from 'lucide-react'

interface PackageData {
  id: string
  name: string
  description: string
  price: number
  currency: string
  durationMonths: number
  features: string[]
  isActive: boolean
  displayOrder: number
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch('/api/packages')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setPackages(
            data.data
              .filter((p: PackageData) => p.isActive)
              .map((p: PackageData & { features?: string }) => ({
                ...p,
                features: typeof p.features === 'string' ? JSON.parse(p.features) : Array.isArray(p.features) ? p.features : [],
              }))
              .sort((a: PackageData, b: PackageData) => a.price - b.price),
          )
        }
      } catch {
        // Use static packages as fallback
        setPackages([
          { id: '1', name: 'Starter', description: 'Perfect for individuals and small businesses.', price: 20000, currency: 'TZS', durationMonths: 1, features: ['Customizable Tones', 'High-quality Audio', 'Scheduled Tones'], isActive: true, displayOrder: 0 },
          { id: '2', name: 'Pro', description: 'Ideal for growing businesses with broader reach.', price: 57000, currency: 'TZS', durationMonths: 3, features: ['Everything in Starter', 'Multiple Phone Numbers', 'Priority Support', 'Custom Branding'], isActive: true, displayOrder: 1 },
          { id: '3', name: 'Enterprise', description: 'For large organizations at scale.', price: 0, currency: 'TZS', durationMonths: 12, features: ['Everything in Pro', 'Unlimited Numbers', 'Dedicated Account Manager', 'Custom Production', 'Analytics Dashboard'], isActive: true, displayOrder: 2 },
        ])
      } finally {
        setLoading(false)
      }
    }
    loadPackages()
  }, [])

  const cardIcons = [<Sparkles key="s" className="h-6 w-6" />, <Zap key="z" className="h-6 w-6" />, <Star key="st" className="h-6 w-6" />]

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Choose the Right <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Package</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Flexible pricing plans designed for businesses of all sizes. Start small and scale as you grow.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 sm:py-24 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.08),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-8 animate-pulse">
                  <div className="h-4 w-24 bg-white/10 rounded mb-6" />
                  <div className="h-8 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-20 bg-white/10 rounded mb-8" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 w-full bg-white/5 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {packages.map((pkg, idx) => {
                const isPopular = idx === 1
                const isCustom = pkg.price === 0 && pkg.name === 'Enterprise'
                return (
                  <div key={pkg.id} className={`glass-card group relative p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ${isPopular ? 'border-teal-500/30' : ''}`}>
                    {isPopular && (
                      <div className="absolute top-0 right-0 z-10">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg shadow-amber-500/30">
                          <Star className="h-3 w-3" />
                          Most Popular
                        </div>
                      </div>
                    )}
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 mb-6" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                        {cardIcons[idx] || cardIcons[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <p className="text-xs text-slate-400">{pkg.durationMonths} Month{pkg.durationMonths > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {isCustom ? 'Custom' : pkg.price.toLocaleString()}
                        </span>
                        {!isCustom && <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{pkg.description}</p>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                        isPopular
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 shadow-lg shadow-teal-500/25'
                          : 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50'
                      }`}
                      onClick={() => { window.location.href = isCustom ? '/contact' : '/' }}
                    >
                      {isCustom ? 'Contact Sales' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 sm:py-24 relative">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Not sure which plan is right for you?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Our team is happy to help you find the perfect package for your business needs.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white font-bold px-10 h-12 rounded-2xl shadow-2xl shadow-teal-500/25"
            onClick={() => { window.location.href = '/contact' }}
          >
            Contact Sales
            <ArrowRight className="ml-2.5 h-5 w-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
