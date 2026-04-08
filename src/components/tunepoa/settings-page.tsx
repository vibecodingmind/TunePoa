'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SettingsPage() {
  const { currentUser } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    businessName: currentUser?.businessName || '',
    businessCategory: currentUser?.businessCategory || 'general',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Demo: just show a toast since we don't have a user update endpoint
    toast({ title: 'Success', description: 'Profile updated successfully (demo)' })
    setLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setLoading(true)
    toast({ title: 'Success', description: 'Password changed successfully (demo)' })
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and business information</p>
      </div>

      {/* Profile */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Business Category</Label>
                <Select value={form.businessCategory} onValueChange={(v) => updateField('businessCategory', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="restaurant">Restaurant & Food</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Account ID</span>
            <span className="font-mono text-gray-700">{currentUser?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-700">{currentUser?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${currentUser?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>{currentUser?.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Member Since</span>
            <span className="text-gray-700">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
