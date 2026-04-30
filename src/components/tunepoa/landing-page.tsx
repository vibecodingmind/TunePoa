'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Headphones,
  Music,
  MapPin,
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
  {
    q: 'Is my payment information secure with TunePoa?',
    a: 'Absolutely. TunePoa uses industry-standard encryption and secure payment gateways to ensure your financial information is fully protected. We take your security and privacy seriously.',
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
      'TunePoa transformed the way our customers perceive our brand. Every time someone calls us, they hear our custom ringback tone and it leaves a professional impression. Our caller engagement has noticeably improved since we started using the service.',
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

/* ─── Benefit Cards ─── */
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

/* ─── Pricing Cards ─── */
const monthlyPricing = [
  {
    name: 'Starter',
    price: '20,000',
    subtitle: 'Per Month',
    badge: null,
    description: 'Perfect for individuals and small businesses getting started with custom ringback tones.',
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    accentFrom: 'from-teal-500',
    accentTo: 'to-cyan-400',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    btnLabel: 'Select Plan',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
  {
    name: 'Pro',
    price: '57,000',
    subtitle: 'Per Month',
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
    btnLabel: 'Contact Sales',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
]

const annualPricing = [
  {
    name: 'Starter',
    price: '199,000',
    subtitle: 'Per Year',
    badge: null,
    description: 'Perfect for individuals and small businesses getting started with custom ringback tones.',
    icon: <Sparkles className="h-6 w-6" />,
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    accentFrom: 'from-teal-500',
    accentTo: 'to-cyan-400',
    features: ['Customizable Tones', 'High-quality Experience', 'Scheduled Tones'],
    btnLabel: 'Select Plan',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
  {
    name: 'Pro',
    price: '499,000',
    subtitle: 'Per Year',
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
    btnLabel: 'Contact Sales',
    btnStyle: 'bg-white/[0.08] border border-white/[0.12] hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500/50',
  },
]

/* ─── Footer Links ─── */
const footerCompanyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Features', action: 'benefits' },
  { label: 'Pricing', href: '/packages' },
  { label: 'Why TunePoa', action: 'benefits' },
  { label: 'Contact', href: '/contact' },
]

const footerProductLinks = [
  { label: 'API', href: '#' },
  { label: 'Partnership', href: '#' },
  { label: 'Coverage', href: '#' },
  { label: 'Support Desk', href: '/contact' },
  { label: 'Blog', href: '#' },
]

const footerOtherLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms Of Services', href: '/terms' },
  { label: 'Refund Policy', href: '#' },
  { label: 'Cookies Policy', href: '#' },
  { label: 'FAQ', action: 'faq' },
]

/* ─── Nav Links ─── */
const navLinks = [
  { label: 'About', id: 'about' },
  { label: 'Benefits', id: 'benefits' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Sample Tunes', href: '/sample-tunes' },
  { label: 'Contact', id: 'footer' },
]

export function LandingPage() {
  const { isAuthenticated, authMode, setAuthMode } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const pricingCards = pricingPeriod === 'monthly' ? monthlyPricing : annualPricing

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isAuthenticated) return null

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }, [])

  const handleNavClick = (link: typeof navLinks[number]) => {
    if (link.href) {
      window.location.href = link.href
    } else if (link.id) {
      scrollTo(link.id)
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* ════════════════════════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-nav' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/">
              <Image src="/tunepoa-logo.png" alt="TunePoa" width={120} height={25} className="object-contain" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
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
                onClick={() => { setAuthMode('login'); setAuthDialogOpen(true) }}
              >
                Sign In
              </Button>
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center">
              <button
                className="p-2.5 rounded-xl text-white/70 hover:bg-white/10 transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/[0.08] glass-strong py-4 space-y-1 animate-fade-in-down rounded-b-2xl">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 px-2 border-t border-white/[0.08]">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white h-11"
                  onClick={() => { setAuthMode('login'); setAuthDialogOpen(true); setMobileMenuOpen(false) }}
                >
                  Sign In
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f2d] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,178,207,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-teal-500/[0.08] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-cyan-400/[0.06] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-[30%] w-[300px] h-[300px] bg-teal-500/[0.04] rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Sound wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-[2px] h-16 opacity-[0.04]" aria-hidden="true">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="w-[2px] bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t"
              style={{ height: `${Math.max(8, Math.sin(i * 0.3) * 50 + Math.cos(i * 0.15) * 30 + 30)}%` }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-md text-teal-400 text-xs font-bold uppercase tracking-[0.15em] mb-8 animate-fade-in-down">
              <Volume2 className="h-3.5 w-3.5" />
              <span>Ringback Tones</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-7 leading-[1.08] tracking-tight animate-fade-in-up">
              Make It{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#00c9b7] via-[#4ab2cf] to-[#00c9b7] bg-clip-text text-transparent">
                  Ring
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 3 100 3 150 6C180 8 195 5 198 7" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00c9b7" />
                      <stop offset="1" stopColor="#4ab2cf" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-300 mb-7 animate-fade-in-up animation-delay-100">
              Revolutionize the call-waiting experience!
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              TunePoa&apos;s RBT replaces boring beeps with delightful melodies, transforming call experiences while driving revenue and enhancing satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ABOUT TUNEPOA
          ════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 sm:py-32 bg-[#0a1628] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.06),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
              <Megaphone className="h-3.5 w-3.5" />
              About TunePoa
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
              Turn Every Call into an Opportunity
            </h2>
            <p className="text-slate-400 leading-relaxed text-base sm:text-lg">
              TunePoa is a cutting-edge Ringback Tone (RBT) platform designed to transform the way businesses connect with their customers. Instead of the standard &quot;ring ring&quot; that callers hear while waiting for a connection, TunePoa replaces it with customized music, branded messages, or promotional content that reflects your unique identity. Whether you&apos;re looking to enhance brand recognition, engage your audience, or create an unforgettable caller experience, TunePoa provides the tools to make every call count. Our easy-to-use platform, seamless integration with mobile networks, and professional tone production services ensure that your business stands out from the moment a customer dials your number.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BENEFITS INTRO
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              More Than Just Music
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Why Choose TunePoa?
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              Discover how custom ringback tones can transform your business communications and create meaningful connections with every call.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefitCards.map((feature, idx) => (
              <div
                key={feature.title}
                className="glass-card group relative p-7 hover:-translate-y-1 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          EXPRESS THROUGH TONES
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#0a1628] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.06),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
              <Music className="h-3.5 w-3.5" />
              Express Through Tones
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">
              Let Your Brand Speak Through Music
            </h2>
            <div className="space-y-4 text-slate-400 text-base sm:text-lg leading-relaxed">
              <p>
                Your ringback tone is more than just sound — it&apos;s an extension of your brand identity. With TunePoa, you can choose from a wide range of professionally produced tones or work with our team to create something entirely unique. From upbeat melodies that energize callers to calm tunes that create a soothing wait, the right tone sets the perfect mood.
              </p>
              <p>
                Whether you want to promote a new product, share a seasonal greeting, or simply create a memorable calling experience, TunePoa gives you the creative freedom to express yourself. Update your tones as often as you like, schedule them for specific times, and let every call tell your story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PRICING
          ════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f2d] to-[#0a1628]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,178,207,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-[15%] w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-[10%] w-[300px] h-[300px] bg-cyan-400/[0.06] rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
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

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {pricingCards.map((card) => (
              <div key={card.name} className={`glass-card group relative p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ${card.popular ? 'border-teal-500/30' : ''}`}>
                {card.badge && card.popular && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-bl-xl shadow-lg shadow-amber-500/30">
                      <Star className="h-3 w-3" />
                      {card.badge}
                    </div>
                  </div>
                )}
                <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accentFrom} ${card.accentTo} mb-6`} />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-xl ${card.iconBg} border border-teal-500/20 flex items-center justify-center ${card.iconColor}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{card.name}</h3>
                    <p className="text-xs text-slate-400">{card.subtitle}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{card.price}</span>
                    {card.price !== 'Custom' && <span className="text-sm font-medium text-slate-400 ml-1">TZS</span>}
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{card.description}</p>
                <ul className="space-y-3 mb-8">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (card.price === 'Custom') {
                      window.location.href = '/contact'
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
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              <Star className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Hear from Our Customers
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card group relative p-8 hover:-translate-y-1 transition-all duration-500">
                <div className="absolute top-6 right-8 text-7xl font-serif text-teal-500/10 leading-none select-none group-hover:text-teal-500/20 transition-colors duration-300">
                  &ldquo;
                </div>
                <div className="relative">
                  <div className="flex gap-1 mb-5">
                    {[...Array(t.rating)].map((_, si) => (
                      <Star key={si} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-[15px] text-slate-300 leading-relaxed mb-8 font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Frequently Asked Questions
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
          CTA BANNER
          ════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Your Ring Back Tone, your style
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
            Get started today and make every call memorable!
          </p>
          <Link href="/sample-tunes">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-bold text-base px-10 h-13 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-transparent"
            >
              Need Samples
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
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
        <div className="h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand column */}
            <div>
              <Link href="/">
                <div className="flex items-center mb-5">
                  <Image src="/tunepoa-logo.png" alt="TunePoa" width={120} height={25} className="object-contain" />
                </div>
              </Link>
              <p className="text-sm leading-relaxed mb-6">
                Your Ring Back Tone, your style. Transform every call into a memorable experience with TunePoa.
              </p>
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
                    {link.href ? (
                      <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors duration-200">
                        {link.label}
                      </Link>
                    ) : link.action ? (
                      <button onClick={() => scrollTo(link.action)} className="text-sm hover:text-teal-400 transition-colors duration-200">
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm">{link.label}</span>
                    )}
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
                    {link.href ? (
                      <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors duration-200">
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-sm">{link.label}</span>
                    )}
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
                    {link.href ? (
                      <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors duration-200">
                        {link.label}
                      </Link>
                    ) : link.action ? (
                      <button onClick={() => scrollTo(link.action)} className="text-sm hover:text-teal-400 transition-colors duration-200">
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Contact info */}
              <div className="mt-8 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-300 mb-3 uppercase tracking-[0.15em]">Contact</h4>
                <a href="mailto:hello@tunepoa.com" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors duration-200">
                  <Mail className="h-4 w-4" />
                  hello@tunepoa.com
                </a>
                <a href="tel:+255741017017" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors duration-200">
                  <Phone className="h-4 w-4" />
                  +255 741 0 17 0 17
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; Tune Poa {new Date().getFullYear()} All Rights Reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Arusha, Tanzania
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
