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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { setAuth, navigate } = useStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      // data is from API: { success, data: { token, user } } or { success: false, error }
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

  return (
    <div className="p-6 sm:p-8">
      {/* Logo and header */}
      <div className="text-center mb-6">
        <Image src="/logo-square.png" alt="TunePoa" width={48} height={48} className="rounded-xl mb-3" />
        <h1 className="text-xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your TunePoa account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="login-email"
              type="email"
              placeholder="you@business.co.tz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="data-[state=checked]:bg-tp-600 data-[state=checked]:border-tp-600"
            />
            <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-sm text-tp-600 hover:text-tp-700 font-medium"
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
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 bg-tp-600 hover:bg-tp-700 text-white font-medium"
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
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">or</span>
          </div>
        </div>

        {/* Switch to register */}
        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="text-tp-600 font-medium hover:text-tp-700 transition-colors"
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  )
}
