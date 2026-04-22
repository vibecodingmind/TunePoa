'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import {
  Megaphone,
  CheckCircle2,
  Star,
  Zap,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Shield,
  Volume2,
  Network,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
} from 'lucide-react'

/* ─── FAQ Data ─── */
const faqItems = [
  {
    q: 'What is TunePoa.com?',
    a: 'TunePoa.com is a platform that offers Ringback Tone (RBT) services, allowing users and businesses to customize the tone heard by callers. Instead of a standard ring, callers will hear personalized music, messages, or brand content.',
  },
  {
    q: 'How can businesses benefit from using TunePoa.com?',
    a: 'Businesses can use TunePoa.com to promote their brand, share product updates, and engage customers through custom ringback tones. It\'s an effective tool for customer interaction, marketing, and increasing brand visibility.',
  },
  {
    q: 'How do I set up a personalized ringback tone?',
    a: 'At TunePoa.com, we handle the entire process for you. Simply reach out to us with your preferred tone, and we\'ll take care of the setup and customization, ensuring your callers hear exactly what you want.',
  },
  {
    q: 'Can I change my ringback tone anytime?',
    a: 'Yes! You can update or change your ringback tone at any time through the TunePoa.com platform. Enjoy flexibility to express your style, share new content, or update promotions whenever you wish.',
  },
  {
    q: 'Is there a cost for using TunePoa.com services?',
    a: 'TunePoa.com offers different pricing plans depending on the features and customization you need. There are options for both individual users and businesses, ensuring you get the best value based on your requirements.',
  },
]

/* ─── Testimonials Data ─── */
const testimonials = [
  {
    quote:
      'We were looking for a way to differentiate ourselves and provide a more polished experience for our callers. The Ring Back Tone service was easy to set up and seamlessly integrated with our phone system. It\'s been a hit with both employees and customers, and we\'ve received a lot of positive feedback.',
    name: 'Ghalib K.',
    business: 'Mbeya',
    rating: 5,
  },
  {
    quote:
      'TunePoa has revolutionized how we manage our HR and payroll. The automated functionalities and in-depth reports have brought a new level of efficiency and accuracy to our daily work.',
    name: 'Benard N.',
    business: 'Dar es Salaam',
    rating: 5,
  },
  {
    quote:
      'Our business was looking for a way to improve the time customers spend on hold, and this service delivered beyond expectations. The Ring Back Tones keep customers entertained, engaged, and even informed while they wait. It\'s become an essential part of our customer service strategy!',
    name: 'Jumanne T.',
    business: 'Mwanza',
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

/* ─── Benefit Cards (from live site) ─── */
const benefitCards = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Enhanced Brand Identity',
    desc: 'Customize the ringback tone to reflect your business\'s personality, making every call a branding opportunity. It\'s a subtle yet effective way to ensure your brand resonates with customers.',
    gradient: 'from-tp-500/10 to-ts-500/10',
    iconBg: 'bg-teal-500/15 text-teal-400',
  },
  {
    icon: <Volume2 className="h-5 w-5" />,
    title: 'Increased Customer Engagement',
    desc: 'With a captive audience waiting for their call to connect, RBT ensures your message is heard, keeping customers engaged and more likely to remember your brand.',
    gradient: 'from-ts-500/10 to-cyan-500/10',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Cost-Effective Advertising',
    desc: 'RBT provides a direct channel to advertise your products or services without the need for costly traditional ad campaigns, ensuring maximum reach at a fraction of the cost.',
    gradient: 'from-green-500/10 to-tp-500/10',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
  },
]

/* ─── Pricing Cards (from live site) ─── */
const pricingCards = [
  {
    name: 'Starter',
    price: '20,000',
    subtitle: 'Per User',
    badge: null,
    description: 'Perfect for individuals and small businesses getting started with custom ringback tones.',
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    accentFrom: 'from-teal-500',
    accentTo: 'to-cyan-400',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    btnLabel: 'Get Started',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
  {
    name: 'Pro',
    price: '57,000',
    subtitle: 'Per 3 Users',
    badge: 'Most Popular',
    description: 'Ideal for growing businesses that want broader reach with more users and enhanced features.',
    icon: <Zap className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    accentFrom: 'from-teal-500',
    accentTo: 'to-cyan-400',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    btnLabel: 'Select Plan',
    btnStyle: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 shadow-lg shadow-teal-500/25',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Tailored for you',
    badge: null,
    description: 'For large organizations needing a fully customized ringback tone solution at scale.',
    icon: <Star className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    accentFrom: 'from-cyan-400',
    accentTo: 'to-teal-400',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    btnLabel: 'Contact Us',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
]

/* ─── Footer Links (from live site) ─── */
const footerCompanyLinks = [
  { label: 'About', action: 'about' },
  { label: 'Features', action: 'benefits' },
  { label: 'Pricing', action: 'pricing' },
  { label: 'Why TunePoa', action: 'about' },
  { label: 'Contact', action: 'footer' },
]

const footerProductLinks = [
  { label: 'API' },
  { label: 'Partnership' },
  { label: 'Coverage' },
  { label: 'Support Desk' },
  { label: 'Blog' },
]

const footerOtherLinks = [
  { label: 'Privacy Policy' },
  { label: 'Terms Of Services' },
  { label: 'Refund Policy' },
  { label: 'Cookies Policy' },
  { label: 'FAQ', action: 'faq' },
]

/* ─── Nav Links (from live site) ─── */
const navLinks = [
  { label: 'About', id: 'about' },
  { label: 'Benefits', id: 'benefits' },
  { label: 'Integrations', id: 'integrations' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Contact', id: 'footer' },
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

        if (data.needsSetup || (data.success && Array.isArray(data.data) && data.data.length === 0)) {
          try {
            const seedRes = await fetch('/api/seed', { method: 'POST' })
            const seedData = await seedRes.json()
            if (seedData.success) {
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
              // Seed failed — will show empty state gracefully
            }
          } catch {
            // Seed request failed — database may not be reachable yet
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
    <div className="min-h-screen bg-[#0a1628]">
      {/* ════════════════════════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-nav'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/tunepoa-logo.png" alt="TunePoa" width={120} height={25} className="object-contain" />
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id)}
                  className={`text-[13px] font-semibold uppercase tracking-wider transition-all duration-300 px-4 py-2 rounded-lg ${
                    scrolled
                      ? 'text-slate-400 hover:text-teal-400 hover:bg-white/[0.06]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop right section */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                className="font-semibold text-sm text-slate-300 hover:text-teal-400 hover:bg-white/[0.06] transition-all duration-300"
                onClick={() => {
                  setAuthMode('login')
                  setAuthDialogOpen(true)
                }}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white shadow-lg shadow-teal-500/25 font-semibold text-sm px-6 h-10 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5"
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
            <div className="lg:hidden flex items-center">
              <button
                className="p-2.5 rounded-xl text-white/70 hover:bg-white/10 transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/[0.08] glass-strong py-4 space-y-1 animate-fade-in-down rounded-b-2xl">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-3 pt-4 px-2 border-t border-white/[0.08]">
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
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl h-11 font-semibold"
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f2d] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,178,207,0.08),transparent_50%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-teal-500/[0.08] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-cyan-400/[0.06] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-[30%] w-[300px] h-[300px] bg-teal-500/[0.04] rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Sound wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-[2px] h-16 opacity-[0.04]" aria-hidden="true">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="w-[2px] bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-md text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-8 animate-fade-in-down">
              <Volume2 className="h-3.5 w-3.5" />
              <span>Make It Ring</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.08] tracking-tight animate-fade-in-up">
              Revolutionize the{' '}
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="bg-gradient-to-r from-[#00c9b7] via-[#4ab2cf] to-[#00c9b7] bg-clip-text text-transparent">
                  call-waiting experience!
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 3 100 3 150 6C200 9 250 4 298 8" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00c9b7" />
                      <stop offset="1" stopColor="#4ab2cf" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              TunePoa&apos;s RBT replaces boring beeps with delightful melodies, transforming call experiences while driving revenue and enhancing satisfaction.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white font-bold text-base px-10 h-13 rounded-2xl shadow-2xl shadow-teal-500/25 group transition-all duration-300 hover:-translate-y-1"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                Get Started
                <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-8 text-sm text-slate-500 animate-fade-in-up animation-delay-500">
              Used by leading companies around the Country
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ABOUT SECTION
          ════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 sm:py-32 bg-[#0a1628] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.06),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              <Megaphone className="h-3.5 w-3.5" />
              About TunePoa
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Turn Every Call into an Opportunity
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              Our Platform allows businesses to replace the traditional ringing sound with personalized music or messages while customers wait on the line. This service enhances customer experience, boosts brand visibility, and engages callers with professional, branded content. We help reduce perceived wait times and leaves a lasting impression on clients.
            </p>
          </div>

          {/* Sub-section */}
          <div className="max-w-3xl mx-auto text-center glass-card p-8 sm:p-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              More Than Just Music
            </h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              With TunePoa, your ringback tone is not just music—it&apos;s a powerful tool for branding, advertising, and customer engagement.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white font-bold text-base px-10 h-12 rounded-2xl shadow-2xl shadow-teal-500/25 group transition-all duration-300 hover:-translate-y-1"
              onClick={() => {
                setAuthMode('register')
                setAuthDialogOpen(true)
              }}
            >
              Get Started
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BENEFITS SECTION
          ════════════════════════════════════════════════════════════════ */}
      <section id="benefits" className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Key Benefits
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Express Through Tones
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              TunePoa.com enables businesses to enhance their brand identity with custom ringback tones. Personalizing call experiences ensures every interaction is memorable and strengthens brand recognition. With RBT, businesses can share promotions, updates, or special offers, creating an engaging way to connect with customers and keep them informed while reinforcing their brand message.
            </p>
          </div>

          {/* Benefit grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefitCards.map((feature, idx) => (
              <div
                key={feature.title}
                className="glass-card group relative p-7 hover:-translate-y-1 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          INTEGRATIONS SECTION
          ════════════════════════════════════════════════════════════════ */}
      <section id="integrations" className="py-24 sm:py-32 bg-[#0a1628] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.08),transparent_60%)]" />
        <div className="absolute top-20 right-[10%] w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-[10%] w-[300px] h-[300px] bg-cyan-400/[0.04] rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              <Network className="h-3.5 w-3.5" />
              Integrations
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Stable Ringback Tones Across Africa...
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              With TunePoa, your custom Ringback Tones are seamlessly connected to local networks in key regions across Africa. This direct integration guarantees exceptional reliability, ensuring your brand&apos;s message reaches your audience with consistency and impact, every time they call.
            </p>
          </div>

          {/* Integration visual */}
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] to-cyan-500/[0.03]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

              <div className="relative">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 mb-8">
                  <Network className="h-10 w-10 text-teal-400" />
                </div>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {[
                    { icon: <MapPin className="h-5 w-5" />, label: 'Tanzania' },
                    { icon: <MapPin className="h-5 w-5" />, label: 'Kenya' },
                    { icon: <MapPin className="h-5 w-5" />, label: 'Uganda' },
                    { icon: <MapPin className="h-5 w-5" />, label: 'Nigeria' },
                    { icon: <MapPin className="h-5 w-5" />, label: 'Ghana' },
                    { icon: <MapPin className="h-5 w-5" />, label: 'South Africa' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-400 transition-all duration-300"
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Direct integration with local networks for seamless delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PRICING
          ════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
        {/* Dark green-blue background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f2d] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,178,207,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-[15%] w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-[10%] w-[300px] h-[300px] bg-cyan-400/[0.06] rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5 backdrop-blur-sm">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Affordable Pricing for Maximum Impact
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              With TunePoa, enjoy cost-effective and impactful custom Ringback Tones that enhance your brand, engage customers, and deliver advertising messages seamlessly during every call.
            </p>
          </div>

          {/* ── Package Cards ── */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {pricingCards.map((card) => (
              <div key={card.name} className={`glass-card group relative p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ${card.popular ? 'border-teal-500/30' : ''}`}>
                {/* Popular badge */}
                {card.badge && card.popular && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg shadow-amber-500/30">
                      <Star className="h-3 w-3" />
                      {card.badge}
                    </div>
                  </div>
                )}

                {/* Accent bar */}
                <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accentFrom} ${card.accentTo} mb-6`} />

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-xl ${card.iconBg} border border-teal-500/20 flex items-center justify-center ${card.iconColor}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{card.name}</h3>
                    <p className="text-xs text-slate-400">{card.subtitle}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{card.price}</span>
                    {card.price !== 'Custom' && (
                      <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {card.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => {
                    if (card.price === 'Custom') {
                      scrollTo('footer')
                    } else if (!isAuthenticated) {
                      window.dispatchEvent(new CustomEvent('open-auth', { detail: 'register' }))
                    } else {
                      navigate('packages')
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${card.btnStyle}`}
                >
                  {card.btnLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 sm:py-32 bg-[#0a1628] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              <Star className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Hear from our customers
            </h2>
          </div>

          {/* Testimonial cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass-card group relative p-8 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Quote mark decoration */}
                <div className="absolute top-6 right-8 text-7xl font-serif text-teal-500/10 leading-none select-none group-hover:text-teal-500/20 transition-colors duration-300">
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
                  <p className="text-[15px] text-slate-300 leading-relaxed mb-8 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3.5 pt-6 border-t border-white/[0.08]">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{t.business}</p>
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
      <section id="faq" className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,201,183,0.06),transparent_50%)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Still have more questions? Don&apos;t hesitate to contact us!
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/[0.06] last:border-0 px-6 sm:px-8">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-white hover:text-teal-400 hover:no-underline py-5 transition-colors duration-200">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-400 leading-relaxed pb-5 pr-10">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f2d] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.12),transparent_60%)]" />

        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/[0.03] rounded-full blur-[150px]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Your Ring Back Tone,{' '}
            <span className="bg-gradient-to-r from-[#00c9b7] via-[#4ab2cf] to-[#00c9b7] bg-clip-text text-transparent">
              your style
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Get started today and make every call memorable!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white font-bold text-base px-10 h-13 rounded-2xl shadow-2xl shadow-teal-500/25 group transition-all duration-300 hover:-translate-y-1"
              onClick={() => {
                setAuthMode('register')
                setAuthDialogOpen(true)
              }}
            >
              Get Started
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          AUTH DIALOG
          ════════════════════════════════════════════════════════════════ */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden glass-dark-strong shadow-2xl rounded-2xl">
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
      <footer id="footer" className="bg-[#060e1a] text-slate-400 relative">
        {/* Top gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand column */}
            <div>
              <div className="flex items-center mb-5">
                <Image src="/tunepoa-logo.png" alt="TunePoa" width={120} height={25} className="object-contain" />
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Your Ring Back Tone, your style. Transform every call into a memorable experience with TunePoa.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Company
              </h4>
              <ul className="space-y-3">
                {footerCompanyLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.action!)}
                      className="text-sm hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Product
              </h4>
              <ul className="space-y-3">
                {footerProductLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      className="text-sm hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other column */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">
                Other
              </h4>
              <ul className="space-y-3">
                {footerOtherLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => link.action ? scrollTo(link.action) : null}
                      className="text-sm hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; Tune Poa 2024 All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <a href="mailto:hello@tunepoa.co.tz" className="flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-200">
                <Mail className="h-3.5 w-3.5" />
                hello@tunepoa.co.tz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
