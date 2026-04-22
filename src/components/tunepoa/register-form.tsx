'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Briefcase,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

const businessCategories = [
  'Restaurant & Food',
  'Retail & Shopping',
  'Healthcare & Pharmacy',
  'Technology & IT',
  'Real Estate',
  'Education & Training',
  'Financial Services',
  'Transport & Logistics',
  'Hospitality & Tourism',
  'Agriculture',
  'Manufacturing',
  'Professional Services',
  'Other',
]

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score: 40, label: 'Fair', color: 'bg-orange-500' }
  if (score <= 3) return { score: 60, label: 'Good', color: 'bg-amber-500' }
  if (score <= 4) return { score: 80, label: 'Strong', color: 'bg-teal-500' }
  return { score: 100, label: 'Very Strong', color: 'bg-teal-600' }
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { setAuth } = useStore()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessCategory: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.name.trim()) {
      setError('Full name is required.')
      return
    }
    if (!form.email.trim()) {
      setError('Email address is required.')
      return
    }
    if (!form.phone.trim()) {
      setError('Phone number is required.')
      return
    }
    if (!form.businessName.trim()) {
      setError('Business name is required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!acceptTerms) {
      setError('You must accept the terms and conditions.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          businessCategory: form.businessCategory || null,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      // API returns { success: true, data: { user, token } }
      const user = data.data?.user
      const token = data.data?.token

      if (!user || !token) {
        setError(data.error || 'Registration succeeded but login failed. Please sign in manually.')
        return
      }

      // Auto-login after successful registration
      setAuth(user, token)
      toast({
        title: 'Account created!',
        description: 'Welcome to TunePoa! Your account is ready.',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Register fetch error:', msg)
      setError('Network error: ' + msg + '. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-6">
        <Image src="/logo-mark-48.png" alt="TunePoa" width={48} height={48} className="rounded-xl mb-3" />
        <h1 className="text-xl font-bold text-white">Create Your Account</h1>
        <p className="text-sm text-slate-400 mt-1">
          Start turning calls into marketing opportunities
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="reg-name" className="text-sm font-medium text-slate-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="reg-name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              autoComplete="name"
              className="h-11 pl-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-sm font-medium text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="reg-email"
              type="email"
              placeholder="you@business.co.tz"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              autoComplete="email"
              className="h-11 pl-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="reg-phone" className="text-sm font-medium text-slate-300">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="reg-phone"
              type="tel"
              placeholder="+255 7XX XXX XXX"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
              autoComplete="tel"
              className="h-11 pl-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
            />
          </div>
        </div>

        {/* Business Name + Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="reg-business" className="text-sm font-medium text-slate-300">
              Business Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="reg-business"
                placeholder="Your business"
                value={form.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                required
                className="h-11 pl-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-category" className="text-sm font-medium text-slate-300">
              Category
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <select
                id="reg-category"
                value={form.businessCategory}
                onChange={(e) => updateField('businessCategory', e.target.value)}
                className="h-11 w-full pl-10 pr-3 rounded-md border border-white/[0.08] bg-white/5 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2"
              >
                <option value="" className="bg-[#0a1628] text-slate-300">Select category</option>
                {businessCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0a1628] text-slate-300">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-sm font-medium text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              autoComplete="new-password"
              className="h-11 pl-10 pr-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength bar */}
          {form.password.length > 0 && (
            <div className="space-y-1">
              <Progress value={passwordStrength.score} className="h-1.5" />
              <p className={`text-xs ${passwordStrength.score >= 60 ? 'text-teal-400' : passwordStrength.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="reg-confirm" className="text-sm font-medium text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              required
              autoComplete="new-password"
              className={`h-11 pl-10 pr-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40 ${
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'border-red-500/30 focus-visible:ring-red-500/30'
                  : form.confirmPassword && form.password === form.confirmPassword
                    ? 'border-teal-500/30 focus-visible:ring-teal-500/30'
                    : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="accept-terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            className="mt-0.5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
          />
          <Label htmlFor="accept-terms" className="text-sm text-slate-400 leading-relaxed cursor-pointer">
            I agree to the{' '}
            <span className="text-teal-400 font-medium hover:underline cursor-pointer">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-teal-400 font-medium hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </Label>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </>
          )}
        </Button>

        {/* Switch to login */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            className="text-teal-400 font-medium hover:text-teal-300 transition-colors"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}
