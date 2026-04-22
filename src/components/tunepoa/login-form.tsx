'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
  ArrowLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { setAuth, navigate } = useStore()
  const { toast } = useToast()

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 2FA state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorError, setTwoFactorError] = useState('')

  const handleBackToLogin = () => {
    setTwoFactorRequired(false)
    setTwoFactorUserId(null)
    setTwoFactorCode('')
    setTwoFactorError('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        return
      }

      // Check if 2FA is required
      if (data.data?.twoFactorRequired) {
        setTwoFactorRequired(true)
        setTwoFactorUserId(data.data.userId)
        return
      }

      // Normal login flow
      const user = data.data?.user
      const token = data.data?.token

      if (!user || !token) {
        setError(data.error || data.data?.error || 'Login failed. Please check your credentials.')
        return
      }

      setAuth(user, token)
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.name}`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Login fetch error:', msg)
      setError('Network error: ' + msg + '. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setTwoFactorError('')

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter the full 6-digit code.')
      return
    }

    if (!twoFactorUserId) return

    setTwoFactorLoading(true)

    try {
      // Step 1: Verify the 2FA code
      const verifyRes = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: twoFactorUserId, code: twoFactorCode }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok || !verifyData.success) {
        setTwoFactorError('Invalid code. Please try again.')
        return
      }

      // Step 2: Call login again to get the token (2FA secret was cleared by verify)
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json()

      if (!loginRes.ok || !loginData.success) {
        setTwoFactorError('Verification succeeded but login failed. Please try again.')
        return
      }

      const user = loginData.data?.user
      const token = loginData.data?.token

      if (!user || !token) {
        setTwoFactorError('Verification succeeded but login failed. Please try again.')
        return
      }

      setAuth(user, token)
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.name}`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('2FA verify error:', msg)
      setTwoFactorError('Network error. Please try again.')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  // ─── 2FA Verification Screen ────────────────────────────────────────────

  if (twoFactorRequired) {
    return (
      <div className="p-6 sm:p-8">
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Two-Factor Authentication</h1>
          <p className="text-sm text-slate-400 mt-1">Enter the 6-digit code sent to you</p>
        </div>

        {/* 2FA Form */}
        <form onSubmit={handleVerify2FA} className="space-y-4">
          {/* Code input */}
          <div className="space-y-2">
            <Label htmlFor="two-factor-code" className="text-sm font-medium text-slate-300">
              Verification Code
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="two-factor-code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setTwoFactorCode(val)
                  if (twoFactorError) setTwoFactorError('')
                }}
                className="h-11 pl-10 pr-4 bg-white/5 border-white/[0.08] text-white text-center text-lg tracking-[0.3em] placeholder:text-slate-500 placeholder:tracking-normal focus:border-teal-500/40"
                autoFocus
              />
            </div>
          </div>

          {/* Error message */}
          {twoFactorError && (
            <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">
              {twoFactorError}
            </div>
          )}

          {/* Verify button */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
            disabled={twoFactorLoading || twoFactorCode.length !== 6}
          >
            {twoFactorLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          {/* Back to login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        </form>
      </div>
    )
  }

  // ─── Normal Login Screen ────────────────────────────────────────────────

  return (
    <div className="p-6 sm:p-8">
      {/* Logo and header */}
      <div className="text-center mb-6">
        <Image src="/logo-mark-48.png" alt="TunePoa" width={48} height={48} className="rounded-xl mb-3" />
        <h1 className="text-xl font-bold text-white">Welcome Back</h1>
        <p className="text-sm text-slate-400 mt-1">Sign in to your TunePoa account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-sm font-medium text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@business.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 pl-10 bg-white/5 border-white/[0.08] text-white placeholder:text-slate-500 focus:border-teal-500/40"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-sm font-medium text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        </div>

        {/* Remember me + Forgot password row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
            />
            <Label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-sm text-teal-400 hover:text-teal-300 font-medium"
            onClick={(e) => {
              e.preventDefault()
              toast({
                title: 'Password Reset',
                description: 'Please contact support to reset your password.',
              })
            }}
          >
            Forgot password?
          </a>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-slate-500">or</span>
          </div>
        </div>

        {/* Switch to register */}
        <p className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="text-teal-400 font-medium hover:text-teal-300 transition-colors"
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  )
}
