'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { useStore } from '@/lib/store'
import {
  Menu,
  X,
  ArrowRight,
  Volume2,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Benefits', href: '/#benefits' },
  { label: 'Pricing', href: '/packages' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Sample Tunes', href: '/sample-tunes' },
  { label: 'Contact', href: '/contact' },
]

const footerCompanyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Benefits', href: '/#benefits' },
  { label: 'Pricing', href: '/packages' },
  { label: 'Sample Tunes', href: '/sample-tunes' },
  { label: 'Contact', href: '/contact' },
]

const footerLegalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authMode, setAuthMode } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-nav' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/">
              <Image src="/tunepoa-logo.png" alt="TunePoa" width={120} height={25} className="object-contain" />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[13px] font-semibold uppercase tracking-wider transition-all duration-300 px-4 py-2 rounded-lg ${
                    scrolled
                      ? 'text-slate-400 hover:text-teal-400 hover:bg-white/[0.06]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                className="font-semibold text-sm text-slate-300 hover:text-teal-400 hover:bg-white/[0.06] transition-all duration-300"
                onClick={() => { setAuthMode('login'); setAuthDialogOpen(true) }}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white shadow-lg shadow-teal-500/25 font-semibold text-sm px-6 h-10 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5"
                onClick={() => { setAuthMode('register'); setAuthDialogOpen(true) }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="lg:hidden flex items-center">
              <button className="p-2.5 rounded-xl text-white/70 hover:bg-white/10 transition-all duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
                {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/[0.08] glass-strong py-4 space-y-1 animate-fade-in-down rounded-b-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-4 px-2 border-t border-white/[0.08]">
                <Button variant="outline" className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white h-11" onClick={() => { setAuthMode('login'); setAuthDialogOpen(true); setMobileMenuOpen(false) }}>
                  Sign In
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl h-11 font-semibold" onClick={() => { setAuthMode('register'); setAuthDialogOpen(true); setMobileMenuOpen(false) }}>
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-[72px]">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#060e1a] text-slate-400 relative">
        <div className="h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
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
                {[
                  { icon: <Twitter className="h-4 w-4" />, href: '#' },
                  { icon: <Linkedin className="h-4 w-4" />, href: '#' },
                  { icon: <Facebook className="h-4 w-4" />, href: '#' },
                  { icon: <Instagram className="h-4 w-4" />, href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all duration-300">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">Company</h4>
              <ul className="space-y-3">
                {footerCompanyLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors duration-200">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-300 mb-5 uppercase tracking-[0.15em]">Legal</h4>
              <ul className="space-y-3">
                {footerLegalLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-teal-400 transition-colors duration-200">{link.label}</Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-300 mb-3 uppercase tracking-[0.15em]">Contact</h4>
                <a href="mailto:info@tunepoa.co.tz" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors duration-200">
                  <Mail className="h-4 w-4" />
                  info@tunepoa.co.tz
                </a>
                <a href="tel:+255700000000" className="flex items-center gap-2 text-sm hover:text-teal-400 transition-colors duration-200">
                  <Phone className="h-4 w-4" />
                  +255 700 000 000
                </a>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} TunePoa. All Rights Reserved.</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Dar es Salaam, Tanzania
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH DIALOG */}
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
    </div>
  )
}
