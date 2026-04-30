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

const monthlyPackages = [
  {
    name: 'Starter',
    price: '20,000',
    subtitle: 'Per Month',
    description: 'Perfect for individuals and small businesses getting started with custom ringback tones.',
    icon: <Sparkles className="h-6 w-6" />,
    badge: null,
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
  },
  {
    name: 'Pro',
    price: '57,000',
    subtitle: 'Per Month',
    description: 'Ideal for growing businesses that want broader reach with more users and enhanced features.',
    icon: <Zap className="h-6 w-6" />,
    badge: 'Most Popular',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Tailored for you',
    description: 'For large organizations needing a fully customized ringback tone solution at scale.',
    icon: <Star className="h-6 w-6" />,
    badge: null,
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
  },
]

const annualPackages = [
  {
    name: 'Starter',
    price: '199,000',
    subtitle: 'Per Year',
    description: 'Perfect for individuals and small businesses getting started with custom ringback tones.',
    icon: <Sparkles className="h-6 w-6" />,
    badge: null,
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
  },
  {
    name: 'Pro',
    price: '499,000',
    subtitle: 'Per Year',
    description: 'Ideal for growing businesses that want broader reach with more users and enhanced features.',
    icon: <Zap className="h-6 w-6" />,
    badge: 'Most Popular',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Tailored for you',
    description: 'For large organizations needing a fully customized ringback tone solution at scale.',
    icon: <Star className="h-6 w-6" />,
    badge: null,
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
  },
]

export default function PackagesPage() {
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const packages = pricingPeriod === 'monthly' ? monthlyPackages : annualPackages

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
          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <button
                onClick={() => setPricingPeriod('monthly')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  pricingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingPeriod('annual')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  pricingPeriod === 'annual'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((pkg, idx) => {
              const isPopular = 'popular' in pkg && pkg.popular
              const isCustom = pkg.price === 'Custom'
              return (
                <div key={pkg.name} className={`glass-card group relative p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ${isPopular ? 'border-teal-500/30' : ''}`}>
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
                      {pkg.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      <p className="text-xs text-slate-400">{pkg.subtitle}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {isCustom ? 'Custom' : pkg.price}
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
                    {isCustom ? 'Contact Sales' : 'Select Plan'}
                  </Button>
                </div>
              )
            })}
          </div>
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
