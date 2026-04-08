'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { PricingCalculator } from './pricing-calculator'
import {
  Music2,
  Megaphone,
  CheckCircle2,
  Star,
  Zap,
  UserPlus,
  FileText,
  Mic,
  Radio,
  Award,
  BarChart3,
  Wallet,
  MessageCircle,
  TrendingUp,
  Play,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  Headphones,
  LogIn,
  Sparkles,
  Globe,
  Clock,
  Users,
  Calculator,
  Crown,
} from 'lucide-react'

/* ─── FAQ Data ─── */
const faqItems = [
  {
    q: 'What is a ringback tone?',
    a: 'A ringback tone is the sound callers hear when they call your number instead of the standard ringing sound. With TunePoa, you can replace that boring ring with a professional advertisement for your business, turning every incoming call into a marketing opportunity.',
  },
  {
    q: 'How long does it take to set up?',
    a: 'Typically 2-5 business days from request to going live. This includes script writing, professional studio recording, your approval via WhatsApp, and activation on your chosen mobile network.',
  },
  {
    q: 'Can I change my ad anytime?',
    a: 'Yes! You can request a new ad recording anytime from your dashboard. Simply submit a new service request and our production team will create a fresh recording for you.',
  },
  {
    q: 'Which networks are supported?',
    a: 'We support all major Tanzanian networks: Vodacom, Airtel, Tigo, Halotel, and TTCL. Your ringback tone can be active on one or multiple networks depending on your chosen package.',
  },
  {
    q: 'How do I approve my ad?',
    a: 'We send your recorded ad via WhatsApp for your review. You can listen, request revisions, or approve it directly. Once approved, we handle the activation on your mobile network within 24 hours.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept M-Pesa, Tigo Pesa, Airtel Money, and bank transfers. All payments are processed securely and you receive an instant confirmation receipt.',
  },
]

/* ─── Testimonials Data ─── */
const testimonials = [
  {
    quote:
      'Since switching to TunePoa, our brand awareness has increased by 40%. Callers always comment on our professional ringback tone!',
    name: 'Fatima Hassan',
    business: 'Kijani Bora Restaurant',
    rating: 5,
  },
  {
    quote:
      'The setup was incredibly smooth and the team was very responsive. Our customers love hearing our promotions while they wait for us to pick up.',
    name: 'James Mwangi',
    business: 'TechHub Solutions',
    rating: 5,
  },
  {
    quote:
      'Best marketing investment we have made. For the price of a few flyers, we reach thousands of callers every single day. Highly recommended!',
    name: 'Grace Ndungu',
    business: 'Poa Pharmacy',
    rating: 5,
  },
]

/* ─── Package type ─── */
interface PackageData {
  id: string
  name: string
  price: number
  duration: number
  durationUnit: string
  features: string[]
  isActive: boolean
}

/* ─── How It Works Steps ─── */
const howItWorksSteps = [
  {
    icon: <UserPlus className="h-6 w-6" />,
    step: 1,
    title: 'Sign Up',
    desc: 'Register your business and request ringback tone service. It takes less than 2 minutes to create your account.',
    color: 'from-blue-500 to-indigo-500',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    step: 2,
    title: 'Provide Ad Details',
    desc: 'Share your business details and ad script. Not sure what to say? Our team will help you craft the perfect message.',
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    icon: <Mic className="h-6 w-6" />,
    step: 3,
    title: 'Studio Recording',
    desc: 'Our professional studio records your custom ad with experienced voice artists and premium sound quality.',
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    icon: <Radio className="h-6 w-6" />,
    step: 4,
    title: 'Go Live',
    desc: 'Approve the recording via WhatsApp and your ad goes live on every incoming call. It is that simple.',
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
  },
]

/* ─── Feature Cards ─── */
const featureCards = [
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: 'Brand Awareness',
    desc: 'Every call reinforces your brand message to callers, increasing recognition and trust with each ring.',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: 'Professional Ads',
    desc: 'Studio-quality recordings with professional voice artists that make your business sound premium and polished.',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Easy Management',
    desc: 'Track performance and manage ads from your dashboard with real-time analytics and simple controls.',
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Flexible Plans',
    desc: 'Choose a package that fits your budget and scale. Start small, grow over time, and cancel anytime.',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'WhatsApp Verification',
    desc: 'Review and approve your ad via WhatsApp before going live. Quick, convenient, and always accessible.',
    gradient: 'from-pink-500/10 to-rose-500/10',
    iconBg: 'bg-pink-100 text-pink-600',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Analytics',
    desc: 'Monitor how many times your ad is played daily and track the impact on your business growth metrics.',
    gradient: 'from-cyan-500/10 to-sky-500/10',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
]

/* ─── Stats ─── */
const heroStats = [
  { value: '500+', label: 'Active Businesses', icon: <Users className="h-5 w-5" /> },
  { value: '10,000+', label: 'Daily Calls', icon: <Phone className="h-5 w-5" /> },
  { value: '98%', label: 'Satisfaction Rate', icon: <Star className="h-5 w-5" /> },
  { value: '4+', label: 'MNO Partners', icon: <Globe className="h-5 w-5" /> },
]

/* ─── Trusted networks ─── */
const networks = [
  { name: 'Vodacom', color: 'text-red-500' },
  { name: 'Airtel', color: 'text-red-600' },
  { name: 'Tigo', color: 'text-blue-500' },
  { name: 'Halotel', color: 'text-orange-500' },
  { name: 'TTCL', color: 'text-sky-600' },
]

/* ─── Footer Links ─── */
const footerQuickLinks = [
  { label: 'Home', action: 'top' },
  { label: 'How It Works', action: 'how-it-works' },
  { label: 'Pricing', action: 'pricing' },
  { label: 'Contact', action: 'footer' },
]

const footerServices = [
  'Ringback Tones',
  'Ad Production',
  'Analytics Dashboard',
  'Priority Support',
]

export function LandingPage() {
  const { isAuthenticated, navigate, authMode, setAuthMode } = useStore()
  const [packages, setPackages] = useState<PackageData[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  // Fetch packages from API — auto-seed if database is empty
  useEffect(() => {
    let cancelled = false

    async function loadPackages() {
      try {
        const res = await fetch('/api/packages')
        const data = await res.json()

        // Check if database needs seeding (empty response or needsSetup flag)
        if (data.needsSetup || (data.success && Array.isArray(data.data) && data.data.length === 0)) {
          console.log('Database appears empty, triggering auto-seed...')
          try {
            const seedRes = await fetch('/api/seed', { method: 'POST' })
            const seedData = await seedRes.json()
            if (seedData.success) {
              console.log('Auto-seed successful, re-fetching packages...')
              const retryRes = await fetch('/api/packages')
              const retryData = await retryRes.json()
              if (!cancelled && retryData.success && Array.isArray(retryData.data)) {
                setPackages(
                  retryData.data
                    .filter((p: PackageData) => p.isActive)
                    .map((p: PackageData & { features?: string }) => ({
                      ...p,
                      features:
                        typeof p.features === 'string'
                          ? JSON.parse(p.features)
                          : Array.isArray(p.features)
                            ? p.features
                            : [],
                    }))
                    .sort((a: PackageData, b: PackageData) => a.price - b.price),
                )
              }
            } else {
              console.warn('Auto-seed failed:', seedData.error)
            }
          } catch (seedErr) {
            console.warn('Auto-seed request failed:', seedErr)
          }
        } else if (data.success && Array.isArray(data.data)) {
          if (!cancelled) {
            setPackages(
              data.data
                .filter((p: PackageData) => p.isActive)
                .map((p: PackageData & { features?: string }) => ({
                  ...p,
                  features:
                    typeof p.features === 'string'
                      ? JSON.parse(p.features)
                      : Array.isArray(p.features)
                        ? p.features
                        : [],
                }))
                .sort((a: PackageData, b: PackageData) => a.price - b.price),
            )
          }
        }
      } catch {
        // Silently fail -- pricing section will show static packages
      } finally {
        if (!cancelled) setPackagesLoading(false)
      }
    }

    loadPackages()
    return () => { cancelled = true }
  }, [])

  // Scroll helper
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }, [])

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white">
      {/* ════════════════════════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-b border-slate-200/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className={`font-extrabold text-xl tracking-tight transition-colors duration-500 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                TunePoa
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {['How It Works', 'Pricing', 'FAQ'].map((label) => (
                <button
                  key={label}
                  onClick={() => scrollTo(label.toLowerCase().replace(/ /g, '-'))}
                  className={`text-[13px] font-semibold uppercase tracking-wider transition-all duration-300 px-4 py-2 rounded-lg ${
                    scrolled
                      ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className={`font-semibold text-sm transition-all duration-300 ${
                  scrolled
                    ? 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setAuthMode('login')
                  setAuthDialogOpen(true)
                }}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 font-semibold text-sm px-6 h-10 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${scrolled ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className={`h-5 w-5 transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`} />
              ) : (
                <Menu className={`h-5 w-5 transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`} />
              )}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl py-4 space-y-1 animate-fade-in-down rounded-b-2xl">
              {['How It Works', 'Pricing', 'FAQ'].map((label) => (
                <button
                  key={label}
                  onClick={() => scrollTo(label.toLowerCase().replace(/ /g, '-'))}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
              <div className="flex gap-3 pt-4 px-2 border-t border-white/10">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white h-11"
                  onClick={() => {
                    setAuthMode('login')
                    setAuthDialogOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl h-11 font-semibold"
                  onClick={() => {
                    setAuthMode('register')
                    setAuthDialogOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_50%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-teal-400/[0.06] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-[30%] w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Sound wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-[2px] h-16 opacity-[0.04]" aria-hidden="true">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="w-[2px] bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t"
              style={{
                height: `${Math.max(8, Math.sin(i * 0.3) * 50 + Math.cos(i * 0.15) * 30 + 30)}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-[0.15em] mb-8 animate-fade-in-down">
              <Zap className="h-3.5 w-3.5" />
              <span>Tanzania&apos;s #1 Ringback Tone Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.08] tracking-tight animate-fade-in-up">
              Turn Every Call Into{' '}
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  a Marketing Win
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 3 100 3 150 6C200 9 250 4 298 8" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#34d399" />
                      <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Replace boring ringback tones with custom business ads. When customers call you,
              they hear your brand message, special offers, and key information.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-50 font-bold text-base px-10 h-13 rounded-2xl shadow-2xl shadow-black/30 group transition-all duration-300 hover:-translate-y-1"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                Start Free Trial
                <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-2xl text-base px-10 h-13 backdrop-blur-sm font-semibold transition-all duration-300"
                onClick={() => scrollTo('how-it-works')}
              >
                <Play className="mr-2.5 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/[0.05] text-emerald-400 mb-3 group-hover:bg-emerald-500/20 transition-colors duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TRUSTED BY NETWORKS
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
            Trusted Across All Major Networks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {networks.map((net) => (
              <div
                key={net.name}
                className="text-lg sm:text-xl font-bold text-slate-300 hover:text-slate-500 transition-colors duration-300 tracking-tight"
              >
                {net.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 border border-emerald-100">
              <Clock className="h-3.5 w-3.5" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
              How TunePoa Works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Get your custom ringback tone live in four simple steps. No technical skills required.
            </p>
          </div>

          {/* Steps */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-blue-200 via-emerald-300 to-amber-200 opacity-50" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {howItWorksSteps.map((item, idx) => (
                <div key={item.step} className="relative text-center group animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  {/* Icon container */}
                  <div className="relative inline-flex items-center justify-center h-32 mb-6">
                    {/* Glow ring */}
                    <div className={`absolute inset-2 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                    <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-xl ${item.shadowColor} z-10 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    {/* Step number */}
                    <span className="absolute -top-1 -right-1 h-7 w-7 rounded-xl bg-white text-slate-900 text-xs font-extrabold flex items-center justify-center z-20 shadow-lg border border-slate-100">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FEATURES / BENEFITS
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              Key Benefits
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
              Why Businesses Love TunePoa
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Everything you need to turn phone calls into a powerful marketing channel
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl bg-white border border-slate-200/80 p-7 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PRICING — Starter Packages + Custom Calculator
          ════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
        {/* Dark dramatic background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-900/95 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-[15%] w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-[10%] w-[300px] h-[300px] bg-teal-400/[0.05] rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 border border-emerald-500/20 backdrop-blur-sm">
              <Wallet className="h-3.5 w-3.5" />
              Pricing Plans
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Choose Your Perfect Plan
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              All-inclusive starter packages with everything you need. Or build a custom plan with our pricing calculator below. No hidden fees, no long-term contracts.
            </p>
          </div>

          {/* ── Starter Package Cards ── */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {/* Starter Basic */}
            <div className="group relative rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/[0.08] backdrop-blur-sm p-8 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 mb-6" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Basic</h3>
                  <p className="text-xs text-slate-400">For individuals & sole traders</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">50,000</span>
                  <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">One-time payment · 1 month</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Perfect for small businesses just getting started with ringback tone advertising. Includes everything you need to go live.
              </p>
              <ul className="space-y-3 mb-8">
                {['1 phone number', '1 month subscription', 'Audio recording included', '15-second ad duration', 'Email support', 'Basic analytics'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))
                  } else {
                    navigate('packages')
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white font-semibold text-sm hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Get Started
              </button>
            </div>

            {/* Starter Standard — Popular */}
            <div className="group relative rounded-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-emerald-500 to-teal-500 animate-gradient p-[2px]">
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-900" />
              </div>
              {/* Popular badge */}
              <div className="absolute top-0 right-0 z-10">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg shadow-amber-500/30">
                  <Star className="h-3 w-3" />
                  Most Popular
                </div>
              </div>
              <div className="relative p-8">
                <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 mb-6" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Starter Standard</h3>
                    <p className="text-xs text-slate-400">For growing businesses</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">120,000</span>
                    <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">One-time payment · 3 months</p>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase">Save 20%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Great for growing businesses wanting to reach more customers through ringback tones on multiple numbers.
                </p>
                <ul className="space-y-3 mb-8">
                  {['5 phone numbers', '3 months subscription', 'Audio recording included', '30-second ad duration', 'Priority support', 'Weekly analytics', 'Multi-network support'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))
                    } else {
                      navigate('packages')
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Starter Premium */}
            <div className="group relative rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/[0.08] backdrop-blur-sm p-8 hover:border-violet-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10">
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 mb-6" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Premium</h3>
                  <p className="text-xs text-slate-400">For serious brand builders</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">250,000</span>
                  <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">One-time payment · 6 months</p>
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase">Save 33%</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Best value for businesses serious about maximizing brand awareness and reach across all networks.
              </p>
              <ul className="space-y-3 mb-8">
                {['10 phone numbers', '6 months subscription', 'Audio recording included', '45-second ad duration', 'Dedicated support manager', 'Daily analytics', 'All networks supported', 'A/B testing', 'Priority activation'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))
                  } else {
                    navigate('packages')
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white font-semibold text-sm hover:bg-violet-500 hover:border-violet-500 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* ── Custom Pricing Calculator ── */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] text-slate-300 text-[11px] font-bold uppercase tracking-[0.15em] mb-4 border border-white/[0.08]">
                <Calculator className="h-3.5 w-3.5" />
                Custom Pricing
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                Need a Custom Plan?
              </h3>
              <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                Calculate the exact price based on your number of users and preferred duration. Volume discounts apply automatically.
              </p>
            </div>
          </div>

          <PricingCalculator mode="landing" isAuthenticated={isAuthenticated} />

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Secure M-Pesa payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>WhatsApp support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>All TZ prices</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 border border-emerald-100">
              <Headphones className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
              Trusted by Tanzanian Businesses
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              See what our customers have to say about their experience with TunePoa
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="group relative rounded-2xl bg-white border border-slate-200/80 p-8 hover:shadow-xl hover:shadow-emerald-100/30 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Quote mark decoration */}
                <div className="absolute top-6 right-8 text-7xl font-serif text-emerald-100 leading-none select-none group-hover:text-emerald-200 transition-colors duration-300">
                  &ldquo;
                </div>

                <div className="relative">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, si) => (
                      <Star
                        key={si}
                        className="h-4 w-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-[15px] text-slate-600 leading-relaxed mb-8 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3.5 pt-6 border-t border-slate-100">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{t.business}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 sm:py-32 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.03),transparent_50%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 border border-emerald-100">
              <MessageCircle className="h-3.5 w-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Got questions? We have answers to help you get started.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-lg shadow-slate-200/30">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-slate-100 last:border-0 px-6 sm:px-8">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-slate-900 hover:text-emerald-600 hover:no-underline py-5 transition-colors duration-200">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5 pr-10">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Decorative icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white mb-8 shadow-2xl shadow-emerald-500/30">
            <Music2 className="h-8 w-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Ready to Make Every<br className="hidden sm:block" /> Call Count?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of Tanzanian businesses already growing with TunePoa. Start your free trial today and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-50 font-bold text-base px-10 h-13 rounded-2xl shadow-2xl shadow-black/30 group transition-all duration-300 hover:-translate-y-1"
              onClick={() => {
                setAuthMode('register')
                setAuthDialogOpen(true)
              }}
            >
              Get Started Now
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-2xl text-base px-10 h-13 backdrop-blur-sm font-semibold"
              onClick={() => scrollTo('pricing')}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          AUTH DIALOG
          ════════════════════════════════════════════════════════════════ */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
          </VisuallyHidden>
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════════ */}
      <footer id="footer" className="bg-slate-950 text-slate-400 relative">
        {/* Top gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Music2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">TunePoa</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Tanzania&apos;s leading ringback tone marketing platform. Turn every phone call
                into a branding opportunity for your business.
              </p>
              {/* Social proof mini */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['F', 'J', 'G', 'A'].map((letter, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 text-white flex items-center justify-center text-[10px] font-bold border-2 border-slate-950">
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-500">500+ businesses trust us</span>
              </div>
            </div>

            {/* Quick Links column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {footerQuickLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => {
                        if (link.action === 'top') {
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        } else {
                          scrollTo(link.action)
                        }
                      }}
                      className="text-sm hover:text-emerald-400 transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Services
              </h4>
              <ul className="space-y-3">
                {footerServices.map((svc) => (
                  <li key={svc}>
                    <span className="text-sm">{svc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Contact Us
              </h4>
              <ul className="space-y-3.5">
                <li className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-emerald-400" />
                  </div>
                  info@tunepoa.co.tz
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-emerald-400" />
                  </div>
                  +255 22 123 4567
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                  </div>
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} TunePoa. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-xs text-slate-600 hover:text-emerald-400 transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="text-xs text-slate-600 hover:text-emerald-400 transition-colors duration-200">
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 opacity-50" />
      </footer>
    </div>
  )
}
