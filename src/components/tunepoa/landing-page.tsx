'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    icon: <UserPlus className="h-7 w-7" />,
    step: 1,
    title: 'Sign Up',
    desc: 'Register your business and request ringback tone service. It takes less than 2 minutes to create your account.',
  },
  {
    icon: <FileText className="h-7 w-7" />,
    step: 2,
    title: 'Ad Details',
    desc: 'Provide your business details and ad script. Not sure what to say? Our team will help you craft the perfect message.',
  },
  {
    icon: <Mic className="h-7 w-7" />,
    step: 3,
    title: 'Studio Recording',
    desc: 'Our professional studio records your custom ad with experienced voice artists and premium sound quality.',
  },
  {
    icon: <Radio className="h-7 w-7" />,
    step: 4,
    title: 'Go Live',
    desc: 'Approve the recording via WhatsApp and your ad goes live on every incoming call. It is that simple.',
  },
]

/* ─── Feature Cards ─── */
const featureCards = [
  {
    icon: <Megaphone className="h-6 w-6" />,
    title: 'Brand Awareness',
    desc: 'Every call reinforces your brand message to callers, increasing recognition and trust with each ring.',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Professional Ads',
    desc: 'Studio-quality recordings with professional voice artists that make your business sound premium and polished.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Easy Management',
    desc: 'Track performance and manage ads from your dashboard with real-time analytics and simple controls.',
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: 'Flexible Plans',
    desc: 'Choose a package that fits your budget and scale. Start small, grow over time, and cancel anytime.',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'WhatsApp Verification',
    desc: 'Review and approve your ad via WhatsApp before going live. Quick, convenient, and always accessible.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
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
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                TunePoa
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollTo('how-it-works')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                FAQ
              </button>
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-emerald-600"
                onClick={() => {
                  setAuthMode('login')
                  scrollTo('auth-section')
                }}
              >
                Sign In
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => {
                  setAuthMode('register')
                  scrollTo('auth-section')
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
            <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
              <button
                onClick={() => scrollTo('how-it-works')}
                className="block w-full text-left px-2 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="block w-full text-left px-2 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="block w-full text-left px-2 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
              >
                FAQ
              </button>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAuthMode('login')
                    scrollTo('auth-section')
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setAuthMode('register')
                    scrollTo('auth-section')
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
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500" />

        {/* Decorative SVG shapes */}
        <svg
          className="absolute top-20 left-10 w-72 h-72 text-emerald-500 opacity-20"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg
          className="absolute bottom-10 right-10 w-96 h-96 text-teal-400 opacity-15"
          viewBox="0 0 300 200"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 100 Q75 20 150 100 T300 100" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M0 130 Q75 50 150 130 T300 130" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M0 160 Q75 80 150 160 T300 160" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>

        {/* Sound wave bars decoration */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-1 h-16 opacity-10" aria-hidden="true">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white rounded-t"
              style={{
                height: `${Math.max(8, Math.sin(i * 0.5) * 40 + 30)}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/15 text-white border-white/20 mb-6 hover:bg-white/20">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Ringback Tone Marketing Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Turn Every Call Into a{' '}
              <span className="text-amber-300">Marketing Opportunity</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Replace boring ringback tones with custom business ads. When customers call
              you, they hear your brand message, special offers, and key information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-8 h-12 rounded-xl shadow-lg"
                onClick={() => {
                  setAuthMode('register')
                  scrollTo('auth-section')
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-xl text-base px-8 h-12"
                onClick={() => scrollTo('how-it-works')}
              >
                <Play className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-emerald-200 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── C. HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4"
            >
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How TunePoa Works
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Get your custom ringback tone live in four simple steps. No technical skills required.
            </p>
          </div>

          {/* Timeline grid */}
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-emerald-200" aria-hidden="true" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {howItWorksSteps.map((item) => (
                <div key={item.step} className="relative text-center">
                  {/* Step circle */}
                  <div className="relative inline-flex items-center justify-center h-32 mb-6">
                    <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 z-10">
                      {item.icon}
                    </div>
                    {/* Step number badge */}
                    <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center z-20">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── D. FEATURES / BENEFITS ─── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4"
            >
              Benefits
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Businesses Love TunePoa
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Everything you need to turn phone calls into a powerful marketing channel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feature) => (
              <Card
                key={feature.title}
                className="bg-white border-slate-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-200 group"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── E. PRICING ─── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              No hidden fees. No long-term contracts. All prices in Tanzanian Shillings.
            </p>
          </div>

          {packagesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packages.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg) => {
                const isPopular = pkg.name === 'Gold'
                return (
                  <Card
                    key={pkg.id}
                    className={`relative ${
                      isPopular
                        ? 'border-emerald-500 border-2 shadow-lg shadow-emerald-100'
                        : 'border-slate-200'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            pkg.name === 'Bronze'
                              ? 'bg-amber-600'
                              : pkg.name === 'Silver'
                                ? 'bg-slate-400'
                                : pkg.name === 'Gold'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                          }`}
                        />
                        <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                      </div>
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-slate-900">
                          TZS {formatPrice(pkg.price)}
                        </span>
                        <span className="text-sm text-slate-500 ml-1">
                          / {pkg.duration} {pkg.durationUnit}
                        </span>
                      </div>
                      <ul className="space-y-2.5 mb-6">
                        {(Array.isArray(pkg.features) ? pkg.features : []).map(
                          (f: string) => (
                            <li
                              key={f}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ),
                        )}
                      </ul>
                      <Button
                        className={`w-full ${
                          isPopular
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                        onClick={() => {
                          setAuthMode('register')
                          scrollTo('auth-section')
                        }}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              Pricing packages are being updated. Please check back soon.
            </div>
          )}

          <p className="text-center text-sm text-slate-400 mt-8">
            All plans include a 10% discount for annual subscriptions. Contact us for enterprise pricing.
          </p>
        </div>
      </section>

      {/* ─── F. TESTIMONIALS ─── */}
      <section className="py-20 sm:py-28 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Tanzanian Businesses
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              See what our customers have to say about their experience with TunePoa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white border-slate-200 shadow-sm">
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
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
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
              className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4"
            >
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Got questions? We have answers to help you get started.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-slate-900 hover:text-emerald-600 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── H. CTA ─── */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 relative overflow-hidden">
        <svg
          className="absolute top-0 right-0 w-80 h-80 text-emerald-500 opacity-20"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make Every Call Count?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-xl mx-auto">
            Join hundreds of Tanzanian businesses already growing with TunePoa. Start your free trial today.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-10 h-12 rounded-xl shadow-lg"
            onClick={() => {
              setAuthMode('register')
              scrollTo('auth-section')
            }}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ─── AUTH SECTION ─── */}
      <section id="auth-section" className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              {authMode === 'login' ? (
                <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── I. FOOTER ─── */}
      <footer id="footer" className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Music2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">TunePoa</span>
              </div>
              <p className="text-sm leading-relaxed">
                Tanzania&apos;s leading ringback tone marketing platform. Turn every phone call
                into a branding opportunity for your business.
              </p>
            </div>

            {/* Quick Links column */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
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
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
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
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                  info@tunepoa.co.tz
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  +255 22 123 4567
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} TunePoa. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
