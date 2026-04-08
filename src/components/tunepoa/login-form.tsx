'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Music2,
  Mail,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  UserCircle,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

const demoAccounts = [
  { role: 'Super Admin', email: 'admin@tunepoa.co.tz', password: 'admin123', icon: <Shield className="h-3.5 w-3.5 text-amber-600" /> },
  { role: 'Admin', email: 'manager@tunepoa.co.tz', password: 'manager123', icon: <Shield className="h-3.5 w-3.5 text-slate-500" /> },
  { role: 'Studio Manager', email: 'studio@tunepoa.co.tz', password: 'studio123', icon: <Music2 className="h-3.5 w-3.5 text-emerald-600" /> },
  { role: 'Business Owner', email: 'fatima@kijanibora.tz', password: 'password123', icon: <UserCircle className="h-3.5 w-3.5 text-emerald-600" /> },
]

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { setAuth, navigate } = useStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)

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

      setAuth(data.user, data.token)
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${data.user.name}`,
      })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div>
      {/* Logo and header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-600 mb-3">
          <Music2 className="h-7 w-7 text-white" />
        </div>
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
              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
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

        {/* Demo accounts collapsible */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span>Demo Accounts</span>
            {showDemo ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showDemo && (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
              <div className="space-y-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-left"
                  >
                    {acc.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">{acc.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {acc.email} / {acc.password}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Switch to register */}
        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      </form>
    </div>
  )
}
