'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
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
  },
  {
    icon: <FileText className="h-6 w-6" />,
    step: 2,
    title: 'Ad Details',
    desc: 'Provide your business details and ad script. Not sure what to say? Our team will help you craft the perfect message.',
  },
  {
    icon: <Mic className="h-6 w-6" />,
    step: 3,
    title: 'Studio Recording',
    desc: 'Our professional studio records your custom ad with experienced voice artists and premium sound quality.',
  },
  {
    icon: <Radio className="h-6 w-6" />,
    step: 4,
    title: 'Go Live',
    desc: 'Approve the recording via WhatsApp and your ad goes live on every incoming call. It is that simple.',
  },
]

/* ─── Feature Cards ─── */
const featureCards = [
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: 'Brand Awareness',
    desc: 'Every call reinforces your brand message to callers, increasing recognition and trust with each ring.',
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: 'Professional Ads',
    desc: 'Studio-quality recordings with professional voice artists that make your business sound premium and polished.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Easy Management',
    desc: 'Track performance and manage ads from your dashboard with real-time analytics and simple controls.',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Flexible Plans',
    desc: 'Choose a package that fits your budget and scale. Start small, grow over time, and cancel anytime.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'WhatsApp Verification',
    desc: 'Review and approve your ad via WhatsApp before going live. Quick, convenient, and always accessible.',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Analytics',
    desc: 'Monitor how many times your ad is played daily and track the impact on your business growth metrics.',
  },
]

/* ─── Stats ─── */
const heroStats = [
  { value: '500+', label: 'Active Businesses' },
  { value: '10,000+', label: 'Daily Calls' },
  { value: '98%', label: 'Satisfaction Rate' },
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
  const { isAuthenticated, authMode, setAuthMode } = useStore()
  const [packages, setPackages] = useState<PackageData[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  // Fetch packages from API
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
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
      })
      .catch(() => {
        // Silently fail -- pricing section will show skeletons
      })
      .finally(() => setPackagesLoading(false))
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

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-TZ', { style: 'decimal' }).format(amount)

  return (
    <div className="min-h-screen bg-white">
      {/* ─── A. NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-strong shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                TunePoa
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scrollTo('how-it-works')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50/50"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50/50"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50/50"
              >
                FAQ
              </button>
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 font-medium"
                onClick={() => {
                  setAuthMode('login')
                  setAuthDialogOpen(true)
                }}
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20 font-medium"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-slate-700" />
              ) : (
                <Menu className="h-5 w-5 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 py-4 space-y-1 animate-fade-in-down">
              <button
                onClick={() => scrollTo('how-it-works')}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors"
              >
                FAQ
              </button>
              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setAuthMode('login')
                    setAuthDialogOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl"
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

      {/* ─── B. HERO SECTION ─── */}
      <section className="relative pt-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 animate-gradient" />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.2),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.15),transparent_50%)]" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Floating orbs */}
        <div className="absolute top-32 left-[15%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-400/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* Sound wave bars decoration */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-[3px] h-12 opacity-[0.07]" aria-hidden="true">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="w-[2px] bg-white rounded-t"
              style={{
                height: `${Math.max(6, Math.sin(i * 0.4) * 50 + 30)}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-44">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm text-emerald-300 text-sm font-medium mb-8 animate-fade-in-down">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ringback Tone Marketing Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white mb-6 leading-[1.1] tracking-tight animate-fade-in-up">
              Turn Every Call Into a{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Marketing Opportunity
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Replace boring ringback tones with custom business ads. When customers call
              you, they hear your brand message, special offers, and key information.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center animate-fade-in-up animation-delay-300">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-[15px] px-8 h-12 rounded-xl shadow-lg shadow-black/20 group"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 text-white hover:bg-white/5 hover:border-white/25 rounded-xl text-[15px] px-8 h-12 backdrop-blur-sm"
                onClick={() => scrollTo('how-it-works')}
              >
                <Play className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar with glass effect */}
        <div className="relative glass-dark-strong border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-3 gap-6 text-center">
              {heroStats.map((stat) => (
                <div key={stat.label} className="group">
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── C. HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white bg-dot-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/80 mb-4 font-medium"
            >
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              How TunePoa Works
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Get your custom ringback tone live in four simple steps. No technical skills required.
            </p>
          </div>

          {/* Timeline grid */}
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200" aria-hidden="true" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {howItWorksSteps.map((item, idx) => (
                <div key={item.step} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Step circle */}
                  <div className="relative inline-flex items-center justify-center h-28 mb-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10">
                      {item.icon}
                    </div>
                    {/* Step number badge */}
                    <span className="absolute -top-1 -right-1 h-6 w-6 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center z-20 shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
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

      {/* ─── D. FEATURES / BENEFITS ─── */}
      <section className="py-20 sm:py-28 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/80 mb-4 font-medium"
            >
              Benefits
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Why Businesses Love TunePoa
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Everything you need to turn phone calls into a powerful marketing channel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((feature, idx) => (
              <Card
                key={feature.title}
                className="card-premium border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:from-emerald-500 group-hover:to-teal-400 group-hover:text-white transition-all duration-300 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── E. PRICING (Interactive Calculator) ─── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white bg-dot-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/80 mb-4 font-medium"
            >
              Gharama za Huduma
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              No hidden fees. No long-term contracts. All prices in Tanzanian Shillings.
              <br className="hidden sm:block" />
              Bei rahisi, wazi — hazina gharama zilizofichwa. Bei zote katika Shilingi ya Tanzania.
            </p>
          </div>

          <PricingCalculator mode="landing" isAuthenticated={isAuthenticated} />

          <p className="text-center text-sm text-slate-400 mt-10">
            Bei hupungua kadiri muda unapozidi. Jiunge sasa kupata punguzo la kipekee.
          </p>
        </div>
      </section>

      {/* ─── F. TESTIMONIALS ─── */}
      <section className="py-20 sm:py-28 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/80 mb-4 font-medium"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Trusted by Tanzanian Businesses
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              See what our customers have to say about their experience with TunePoa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="card-premium border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, si) => (
                      <Star
                        key={si}
                        className="h-4 w-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.business}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── G. FAQ ─── */}
      <section id="faq" className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200/80 mb-4 font-medium"
            >
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Got questions? We have answers to help you get started.
            </p>
          </div>

          <div className="card-premium-static border border-slate-200/80 rounded-2xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-slate-100 last:border-0 px-6">
                  <AccordionTrigger className="text-left text-[14px] font-medium text-slate-900 hover:text-emerald-600 hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ─── H. CTA ─── */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.15),transparent_70%)]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to Make Every Call Count?
          </h2>
          <p className="text-base text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Join hundreds of Tanzanian businesses already growing with TunePoa. Start your free trial today.
          </p>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-[15px] px-10 h-12 rounded-xl shadow-lg shadow-black/20 group"
            onClick={() => {
              setAuthMode('register')
              setAuthDialogOpen(true)
            }}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </section>

      {/* ─── AUTH DIALOG (popup from navbar / CTAs) ─── */}
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

      {/* ─── I. FOOTER ─── */}
      <footer id="footer" className="bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Music2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">TunePoa</span>
              </div>
              <p className="text-sm leading-relaxed">
                Tanzania&apos;s leading ringback tone marketing platform. Turn every phone call
                into a branding opportunity for your business.
              </p>
            </div>

            {/* Quick Links column */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-[0.1em]">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
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
                      className="text-sm hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services column */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-[0.1em]">
                Services
              </h4>
              <ul className="space-y-2.5">
                {footerServices.map((svc) => (
                  <li key={svc}>
                    <span className="text-sm">{svc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-[0.1em]">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                  info@tunepoa.co.tz
                </li>
                <li className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  +255 22 123 4567
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} TunePoa. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-sm text-slate-600 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-slate-600 hover:text-emerald-400 transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
