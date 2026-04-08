'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music2, Megaphone, CheckCircle2, Headphones, Star, Zap, Globe } from 'lucide-react'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { useState } from 'react'

const steps = [
  {
    icon: <Megaphone className="h-8 w-8" />,
    title: 'Create Your Ad',
    description: 'Tell us about your business and what you want callers to hear. Choose from promos, branding, offers, or announcements.',
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: 'We Record It',
    description: 'Our professional studio team creates a polished ringback tone in your preferred language.',
  },
  {
    icon: <CheckCircle2 className="h-8 w-8" />,
    title: 'You Approve',
    description: 'Preview your ringback tone via WhatsApp and give us the green light.',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Go Live!',
    description: 'Your custom ringback tone is activated on your chosen mobile network. Reach thousands daily!',
  },
]

const stats = [
  { value: '10,000+', label: 'Active Ads' },
  { value: '500+', label: 'Businesses' },
  { value: '3', label: 'MNO Partners' },
  { value: '99.9%', label: 'Uptime' },
]

export function LandingPage() {
  const { navigate, isLoggedIn } = useAppStore()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  if (isLoggedIn) return null

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-emerald-700">TunePoa</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-gray-600 hidden sm:flex" onClick={() => setAuthMode('login')}>
                Sign In
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setAuthMode('register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMEgydjRoMzR6TTIgMjBoMzR2LTJIMHZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Globe className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">Tanzania&apos;s #1 Ringback Tone Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Turn Every Call Into an{' '}
              <span className="text-yellow-300">Opportunity</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              TunePoa lets Tanzanian businesses create custom ringback tones that promote their brand,
              offers, and services to every person who calls them. Poa sana!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-8 h-12 rounded-xl shadow-lg"
                onClick={() => setAuthMode('register')}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-xl text-base px-8 h-12"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Get your custom ringback tone live in 4 simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mb-2">STEP {index + 1}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Choose the plan that fits your business. All prices in Tanzanian Shillings.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Bronze', price: '10,000', duration: '1 month', color: 'bg-orange-50 border-orange-200', features: ['One ringback tone ad', 'Basic script writing', '15-second duration', 'Email support'] },
              { name: 'Silver', price: '25,000', duration: '3 months', color: 'bg-gray-50 border-gray-200', features: ['Two ringback tone ads', 'Professional script', '25-second duration', 'Priority support', 'WhatsApp verification'], popular: true },
              { name: 'Gold', price: '50,000', duration: '6 months', color: 'bg-yellow-50 border-yellow-200', features: ['Three ringback tone ads', 'Premium script writing', '30-second duration', '24/7 support', 'Advanced analytics', 'Multi-language'] },
              { name: 'Platinum', price: '100,000', duration: '12 months', color: 'bg-emerald-50 border-emerald-200', features: ['Unlimited ads', 'Premium voice actors', '45-second duration', 'Dedicated manager', 'Enterprise analytics', 'A/B testing'], best: true },
            ].map((pkg) => (
              <Card key={pkg.name} className={`relative ${pkg.color} border ${pkg.best || pkg.popular ? 'ring-2 ring-emerald-500' : ''}`}>
                {pkg.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                )}
                {pkg.popular && !pkg.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className={`h-4 w-4 ${pkg.name === 'Platinum' ? 'text-emerald-600 fill-emerald-600' : pkg.name === 'Gold' ? 'text-yellow-500 fill-yellow-500' : pkg.name === 'Silver' ? 'text-gray-400 fill-gray-400' : 'text-orange-400 fill-orange-400'}`} />
                    <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">TZS {pkg.price}</span>
                    <span className="text-sm text-gray-500 ml-1">/ {pkg.duration}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${pkg.best ? 'bg-emerald-600 hover:bg-emerald-700' : pkg.popular ? 'bg-gray-800 hover:bg-gray-900' : ''}`}
                    variant={pkg.best || pkg.popular ? 'default' : 'outline'}
                    onClick={() => setAuthMode('register')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-gray-500">
              {authMode === 'login'
                ? 'Sign in to manage your ringback tones'
                : 'Join hundreds of Tanzanian businesses on TunePoa'}
            </p>
          </div>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              {authMode === 'login' ? (
                <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Music2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">TunePoa</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} TunePoa Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
