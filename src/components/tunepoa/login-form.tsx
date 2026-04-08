'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, LogIn } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, navigate } = useAppStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        setError(data.error || 'Login failed')
        return
      }

      login(data.user, data.token)
      toast({ title: 'Welcome back!', description: `Signed in as ${data.user.name}` })
      navigate('dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@business.co.tz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4 mr-2" />
        )}
        Sign In
      </Button>

      <div className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="text-emerald-600 font-medium hover:underline"
          onClick={onSwitchToRegister}
        >
          Create one
        </button>
      </div>

      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
        <p className="text-xs text-emerald-700 font-medium mb-1">Demo Accounts:</p>
        <p className="text-xs text-emerald-600">Admin: admin@tunepoa.co.tz / admin123</p>
        <p className="text-xs text-emerald-600">Studio: studio@tunepoa.co.tz / studio123</p>
        <p className="text-xs text-emerald-600">User: fatima@kijanibora.tz / password123</p>
      </div>
    </form>
  )
}
