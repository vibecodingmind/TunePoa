'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { login, navigate } = useAppStore()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
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
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      login(data.user, data.token)
      toast({ title: 'Account created!', description: 'Welcome to TunePoa!' })
      navigate('dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@business.co.tz"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+2557XXXXXXXX"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="business">Business Name</Label>
        <Input
          id="business"
          placeholder="Your business name"
          value={form.businessName}
          onChange={(e) => updateField('businessName', e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min 6 chars"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="Re-enter"
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            required
            className="h-10"
          />
        </div>
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
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        Create Account
      </Button>

      <div className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          className="text-emerald-600 font-medium hover:underline"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </div>
    </form>
  )
}
