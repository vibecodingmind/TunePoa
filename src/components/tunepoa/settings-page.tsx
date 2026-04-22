'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Save,
  User,
  Shield,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  MapPin,
  CreditCard,
  Wallet,
  Upload,
  X,
  Copy,
  Image as ImageIcon,
  Send,
  RefreshCw,
  AlertTriangle,
  Palette,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Constants
/* ========================================================================= */

const BUSINESS_CATEGORIES = [
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Media', label: 'Media' },
  { value: 'Other', label: 'Other' },
]

/* ========================================================================= */
/* Password Strength Helper
/* ========================================================================= */

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
  textColor: string
} {
  if (!password)
    return { score: 0, label: '', color: '', textColor: '' }

  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  switch (true) {
    case score <= 1:
      return { score: 20, label: 'Weak', color: 'bg-red-500/100', textColor: 'text-red-600' }
    case score === 2:
      return { score: 40, label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-600' }
    case score === 3:
      return { score: 60, label: 'Good', color: 'bg-amber-500/100', textColor: 'text-amber-600' }
    case score === 4:
      return { score: 80, label: 'Strong', color: 'bg-teal-500/100', textColor: 'text-teal-400' }
    default:
      return {
        score: 100,
        label: 'Very Strong',
        color: 'bg-tp-600',
        textColor: 'text-teal-300',
      }
  }
}

/* ========================================================================= */
/* Password Toggle Component
/* ========================================================================= */

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  errorBorder,
  successBorder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
  errorBorder?: boolean
  successBorder?: boolean
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 pr-10 ${errorBorder ? 'border-red-400 focus:ring-red-200' : successBorder ? 'border-teal-400/30 focus:ring-tp-200' : ''}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

/* ========================================================================= */
/* Main Component
/* ========================================================================= */

export function SettingsPage() {
  const { user, token, isAdmin: isAdminUser } = useAppStore()
  const { toast } = useToast()
  const isAdmin = isAdminUser()

  /* ---- Profile form ---- */
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
  })

  /* ---- Security form ---- */
  const [securityLoading, setSecurityLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  /* ---- Business form ---- */
  const [businessLoading, setBusinessLoading] = useState(false)
  const [businessForm, setBusinessForm] = useState({
    businessName: user?.businessName || '',
    businessCategory: user?.businessCategory || '',
    businessDescription: '',
    businessAddress: '',
  })

  /* ---- 2FA State ---- */
  const [tfaEnabled, setTfaEnabled] = useState(false)
  const [tfaLoading, setTfaLoading] = useState(true)
  const [tfaToggling, setTfaToggling] = useState(false)
  const [tfaBackupCode, setTfaBackupCode] = useState<string | null>(null)

  /* ---- Payment Gateways State ---- */
  const [gateways, setGateways] = useState<Array<{
    id: string
    name: string
    description: string
    enabled: boolean
  }>>([])
  const [gatewaysLoading, setGatewaysLoading] = useState(true)
  const [gatewayToggling, setGatewayToggling] = useState<string | null>(null)

  /* ---- Branding State ---- */
  const [appName, setAppName] = useState('TunePoa')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoChecking, setLogoChecking] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  /* ---- Email Templates State ---- */
  const [emailTemplates, setEmailTemplates] = useState<Array<{
    id: string
    key: string
    subject: string
    description: string | null
    isActive: boolean
  }>>([])
  const [emailsLoading, setEmailsLoading] = useState(true)
  const [testEmailTo, setTestEmailTo] = useState('')
  const [testEmailSending, setTestEmailSending] = useState(false)

  /* ---- Computed ---- */

  const passwordStrength = useMemo(
    () => getPasswordStrength(securityForm.newPassword),
    [securityForm.newPassword],
  )
  const passwordsMatch = securityForm.newPassword === securityForm.confirmPassword
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  /* ========================================================================= */
  /* Data Fetchers
  /* ========================================================================= */

  const fetch2faStatus = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/2fa', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTfaEnabled(data.data?.enabled ?? false)
      }
    } catch {
      // Silently fail
    } finally {
      setTfaLoading(false)
    }
  }, [token])

  const fetchGateways = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch('/api/payments/gateways')
      if (res.ok) {
        const data = await res.json()
        setGateways(data.data?.gateways ?? [])
      }
    } catch {
      // Silently fail
    } finally {
      setGatewaysLoading(false)
    }
  }, [isAdmin])

  const checkLogoExists = useCallback(async () => {
    setLogoChecking(true)
    try {
      const res = await fetch('/uploads/logo.png', { method: 'HEAD' })
      if (res.ok) {
        setLogoPreview('/uploads/logo.png')
      } else {
        setLogoPreview(null)
      }
    } catch {
      setLogoPreview(null)
    } finally {
      setLogoChecking(false)
    }
  }, [])

  const fetchEmailTemplates = useCallback(async () => {
    if (!isAdmin || !token) return
    try {
      const res = await fetch('/api/emails/templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEmailTemplates(data.data?.templates ?? [])
      }
    } catch {
      // Silently fail
    } finally {
      setEmailsLoading(false)
    }
  }, [isAdmin, token])

  useEffect(() => {
    fetch2faStatus()
  }, [fetch2faStatus])

  useEffect(() => {
    fetchGateways()
  }, [fetchGateways])

  useEffect(() => {
    if (isAdmin) {
      checkLogoExists()
      fetchEmailTemplates()
    }
  }, [isAdmin, checkLogoExists, fetchEmailTemplates])

  /* ========================================================================= */
  /* Handlers
  /* ========================================================================= */

  /* ---- Profile update ---- */

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) return

    if (!profileForm.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }

    setProfileLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          businessName: profileForm.businessName,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update profile',
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' })
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  /* ---- Password update ---- */

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) return

    if (!securityForm.currentPassword) {
      toast({ title: 'Error', description: 'Current password is required', variant: 'destructive' })
      return
    }

    if (securityForm.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    if (!passwordsMatch) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }

    setSecurityLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update password',
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' })
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setSecurityLoading(false)
    }
  }

  /* ---- Business info update ---- */

  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) return

    if (!businessForm.businessName.trim()) {
      toast({
        title: 'Error',
        description: 'Business name is required',
        variant: 'destructive',
      })
      return
    }

    setBusinessLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: businessForm.businessName,
          businessCategory: businessForm.businessCategory,
          businessDescription: businessForm.businessDescription || undefined,
          businessAddress: businessForm.businessAddress || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update business info',
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Business Updated', description: 'Your business information has been saved.' })
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setBusinessLoading(false)
    }
  }

  /* ---- 2FA Toggle ---- */

  const handle2faToggle = async () => {
    if (!token) return
    setTfaToggling(true)
    setTfaBackupCode(null)
    try {
      if (!tfaEnabled) {
        // Enable 2FA
        const res = await fetch('/api/2fa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setTfaEnabled(true)
          if (data.data?.backupCode) {
            setTfaBackupCode(data.data.backupCode)
          }
          toast({ title: '2FA Enabled', description: 'Two-factor authentication is now active.' })
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to enable 2FA',
            variant: 'destructive',
          })
        }
      } else {
        // Disable 2FA
        const res = await fetch('/api/2fa', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setTfaEnabled(false)
          toast({ title: '2FA Disabled', description: 'Two-factor authentication has been turned off.' })
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to disable 2FA',
            variant: 'destructive',
          })
        }
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setTfaToggling(false)
    }
  }

  /* ---- Gateway Toggle ---- */

  const handleGatewayToggle = async (gatewayId: string, enabled: boolean) => {
    if (!isAdmin || !token) return
    setGatewayToggling(gatewayId)
    try {
      const res = await fetch('/api/payments/gateways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gatewayId, enabled }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setGateways((prev) =>
          prev.map((g) => (g.id === gatewayId ? { ...g, enabled } : g)),
        )
        toast({
          title: `${gatewayId.charAt(0).toUpperCase() + gatewayId.slice(1)} ${enabled ? 'Enabled' : 'Disabled'}`,
          description: data.data?.message || 'Gateway updated.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update gateway',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setGatewayToggling(null)
    }
  }

  /* ---- Logo Upload ---- */

  const handleLogoUpload = async (file: File) => {
    if (!isAdmin) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please upload an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Maximum file size is 5MB.', variant: 'destructive' })
      return
    }

    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'Logo Uploaded', description: 'Your custom logo has been saved.' })
        checkLogoExists()
      } else {
        toast({
          title: 'Upload Failed',
          description: data.error || 'Failed to upload logo',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setLogoUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleLogoUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleLogoUpload(file)
  }

  /* ---- Test Email ---- */

  const handleTestEmail = async (template: { id: string; key: string; subject: string }) => {
    if (!isAdmin || !token) return
    if (!testEmailTo.trim()) {
      toast({ title: 'Error', description: 'Please enter a recipient email address.', variant: 'destructive' })
      return
    }

    setTestEmailSending(true)
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: testEmailTo,
          templateId: template.id,
          templateKey: template.key,
          subject: `[Test] ${template.subject}`,
          body: `<p>This is a test email for template <strong>${template.key}</strong>.</p><p>If you received this, the email service is working correctly.</p>`,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'Email Sent', description: `Test email sent to ${testEmailTo}` })
      } else {
        toast({
          title: 'Send Failed',
          description: data.error || 'Failed to send test email',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setTestEmailSending(false)
    }
  }

  /* ---- Copy Backup Code ---- */

  const copyBackupCode = () => {
    if (tfaBackupCode) {
      navigator.clipboard.writeText(tfaBackupCode).then(() => {
        toast({ title: 'Copied', description: 'Backup code copied to clipboard.' })
      }).catch(() => {
        toast({ title: 'Copy Failed', description: 'Could not copy to clipboard.', variant: 'destructive' })
      })
    }
  }

  /* ========================================================================= */
  /* Gateway Icon Helper
  /* ========================================================================= */

  const getGatewayIcon = (id: string) => {
    switch (id) {
      case 'pesapal':
        return <Smartphone className="h-6 w-6" />
      case 'stripe':
        return <CreditCard className="h-6 w-6" />
      case 'paypal':
        return <Wallet className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  /* ========================================================================= */
  /* Render
  /* ========================================================================= */

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-1.5 flex-1 sm:flex-none">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 flex-1 sm:flex-none">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-1.5 flex-1 sm:flex-none">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="payments" className="gap-1.5 flex-1 sm:flex-none">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-1.5 flex-1 sm:flex-none">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-1.5 flex-1 sm:flex-none">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Emails</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ================================================================ */}
        {/* Profile Tab */}
        {/* ================================================================ */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-tp-400 to-tp-600 flex items-center justify-center border-4 border-teal-500/10 shadow-sm">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-sm text-slate-400 capitalize">
                    {user?.role?.replace(/_/g, ' ')}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs border-white/[0.08] text-slate-400">
                    Member since {user?.createdAt ? formatDateShort(user.createdAt) : 'N/A'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="profileName" className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Full Name
                    </Label>
                    <Input
                      id="profileName"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profileEmail" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Email
                    </Label>
                    <Input
                      id="profileEmail"
                      value={user?.email || ''}
                      readOnly
                      className="h-11 bg-white/[0.03] text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">Contact support to change your email</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePhone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Phone
                    </Label>
                    <Input
                      id="profilePhone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+255 7XX XXX XXX"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profileBusiness" className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Business Name
                    </Label>
                    <Input
                      id="profileBusiness"
                      value={profileForm.businessName}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, businessName: e.target.value }))
                      }
                      placeholder="Your business name"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="bg-tp-600 hover:bg-tp-700 text-white h-10 px-6"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Security Tab */}
        {/* ================================================================ */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <PasswordInput
                      id="currentPassword"
                      value={securityForm.currentPassword}
                      onChange={(v) =>
                        setSecurityForm((p) => ({ ...p, currentPassword: v }))
                      }
                      placeholder="Enter your current password"
                      show={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>
                    <PasswordInput
                      id="newPassword"
                      value={securityForm.newPassword}
                      onChange={(v) => setSecurityForm((p) => ({ ...p, newPassword: v }))}
                      placeholder="Enter new password"
                      show={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                      errorBorder={!!(
                        securityForm.confirmPassword && !passwordsMatch && securityForm.confirmPassword
                      )}
                    />
                    {/* Strength indicator */}
                    {securityForm.newPassword && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={passwordStrength.score}
                            className="h-2 flex-1"
                          />
                          <span className={`text-xs font-semibold ${passwordStrength.textColor}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={securityForm.confirmPassword}
                      onChange={(v) =>
                        setSecurityForm((p) => ({ ...p, confirmPassword: v }))
                      }
                      placeholder="Re-enter new password"
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      errorBorder={!!(
                        securityForm.confirmPassword && !passwordsMatch
                      )}
                      successBorder={!!(
                        passwordsMatch && securityForm.confirmPassword.length > 0
                      )}
                    />
                    {securityForm.confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        Passwords do not match
                      </p>
                    )}
                    {securityForm.confirmPassword && passwordsMatch && (
                      <p className="text-xs text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Security note */}
                  <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10 p-4">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-300">Security Tip</p>
                      <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                        Use a strong password with at least 6 characters, including uppercase letters,
                        numbers, and special characters for maximum security.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="bg-tp-600 hover:bg-tp-700 text-white h-10 px-6"
                      disabled={securityLoading}
                    >
                      {securityLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tfaEnabled ? 'bg-teal-500/15' : 'bg-white/5'}`}>
                    <Smartphone className={`h-5 w-5 ${tfaEnabled ? 'text-teal-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tfaLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tfaEnabled ? 'bg-teal-500/15' : 'bg-white/5'}`}>
                          <Shield className={`h-5 w-5 ${tfaEnabled ? 'text-teal-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            Two-Factor Authentication
                          </p>
                          <p className="text-xs text-slate-400">
                            {tfaEnabled
                              ? 'Your account is protected with an additional verification step.'
                              : 'Enable 2FA to add an extra security layer to your account.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${tfaEnabled ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' : 'border-white/[0.08] text-slate-400'}`}
                        >
                          {tfaEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={handle2faToggle}
                          disabled={tfaToggling}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                            tfaEnabled ? 'bg-teal-500' : 'bg-slate-600'
                          } ${tfaToggling ? 'opacity-60 cursor-wait' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              tfaEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Backup Code Display */}
                    {tfaBackupCode && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-300">
                              Save your backup code
                            </p>
                            <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                              Save this code — it won&apos;t be shown again. You can use it to recover
                              access to your account if you lose your 2FA device.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg bg-black/30 border border-amber-500/15 px-4 py-3 font-mono text-lg tracking-widest text-amber-200 text-center">
                            {tfaBackupCode}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyBackupCode}
                            className="shrink-0 h-11 w-11 border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Business Tab */}
        {/* ================================================================ */}
        <TabsContent value="business">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Business Information</CardTitle>
                  <CardDescription>Update your business details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessUpdate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="bizName" className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Business Name
                  </Label>
                  <Input
                    id="bizName"
                    value={businessForm.businessName}
                    onChange={(e) =>
                      setBusinessForm((p) => ({ ...p, businessName: e.target.value }))
                    }
                    placeholder="Your business name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizCategory" className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    Business Category
                  </Label>
                  <Select
                    value={businessForm.businessCategory}
                    onValueChange={(v) =>
                      setBusinessForm((p) => ({ ...p, businessCategory: v }))
                    }
                  >
                    <SelectTrigger id="bizCategory" className="h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizDescription" className="text-sm font-medium">
                    Business Description
                  </Label>
                  <Textarea
                    id="bizDescription"
                    value={businessForm.businessDescription}
                    onChange={(e) =>
                      setBusinessForm((p) => ({ ...p, businessDescription: e.target.value }))
                    }
                    placeholder="Describe your business, products, and services..."
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bizAddress" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Business Address
                  </Label>
                  <Input
                    id="bizAddress"
                    value={businessForm.businessAddress}
                    onChange={(e) =>
                      setBusinessForm((p) => ({ ...p, businessAddress: e.target.value }))
                    }
                    placeholder="e.g., Kijangwa Road, Dar es Salaam"
                    className="h-11"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="bg-tp-600 hover:bg-tp-700 text-white h-10 px-6"
                    disabled={businessLoading}
                  >
                    {businessLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Business Info
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* Payment Gateways Tab (Admin Only) */}
        {/* ================================================================ */}
        {isAdmin && (
          <TabsContent value="payments">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Payment Gateways</CardTitle>
                      <CardDescription>Manage and configure payment methods</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gatewaysLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <>
                      {/* Gateway Cards */}
                      <div className="space-y-3">
                        {gateways.map((gateway) => (
                          <div
                            key={gateway.id}
                            className={`glass-card rounded-xl p-4 transition-all duration-300 ${
                              gateway.enabled
                                ? 'border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.08)]'
                                : 'border-white/[0.06] opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    gateway.enabled
                                      ? 'bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400'
                                      : 'bg-slate-700/50 text-slate-500'
                                  }`}
                                >
                                  {getGatewayIcon(gateway.id)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-white truncate">
                                      {gateway.name}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 shrink-0 ${
                                        gateway.enabled
                                          ? 'border-teal-500/30 text-teal-400 bg-teal-500/10'
                                          : 'border-white/[0.08] text-slate-500'
                                      }`}
                                    >
                                      {gateway.enabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    {gateway.description}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleGatewayToggle(gateway.id, !gateway.enabled)
                                  }
                                  disabled={gatewayToggling === gateway.id}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                                    gateway.enabled ? 'bg-teal-500' : 'bg-slate-600'
                                  } ${
                                    gatewayToggling === gateway.id
                                      ? 'opacity-60 cursor-wait'
                                      : ''
                                  }`}
                                >
                                  {gatewayToggling === gateway.id ? (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                                    </span>
                                  ) : (
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        gateway.enabled
                                          ? 'translate-x-5'
                                          : 'translate-x-0'
                                      }`}
                                    />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Note */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                        <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          <Info className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-300">Environment Note</p>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Gateway activation is controlled by server environment variables.
                            Toggling here updates the server configuration. Ensure the required API
                            keys are set in your deployment environment for gateways to function
                            properly.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ================================================================ */}
        {/* Branding Tab (Admin Only) */}
        {/* ================================================================ */}
        {isAdmin && (
          <TabsContent value="branding">
            <div className="space-y-6">
              {/* Logo Upload */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Custom Logo</CardTitle>
                      <CardDescription>Upload your organization&apos;s logo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Logo Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Logo</Label>
                    {logoChecking ? (
                      <div className="flex items-center justify-center h-32 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    ) : logoPreview ? (
                      <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className="h-20 w-20 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/[0.06]">
                          <img
                            src={logoPreview}
                            alt="Current logo"
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">logo.png</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Custom logo is active
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Note: Removing the logo requires server access. Contact your system administrator.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center gap-3 text-slate-400">
                          <ImageIcon className="h-5 w-5" />
                          <p className="text-sm">No custom logo uploaded. Using default branding.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Area */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload New Logo</Label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`glass-card rounded-xl p-6 border-dashed cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-teal-500/40 bg-teal-500/5'
                          : 'border-white/[0.08] hover:border-teal-500/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-2 text-center">
                        {logoUploading ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                            <p className="text-sm text-slate-300">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-300">
                                {isDragging ? 'Drop your image here' : 'Drag & drop or click to upload'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PNG, JPG, or SVG up to 5MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* App Name */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">App Name</CardTitle>
                      <CardDescription>Customize the application name displayed to users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName" className="flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-slate-400" />
                      Application Name
                    </Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="TunePoa"
                      className="h-11"
                    />
                    <p className="text-xs text-slate-400">
                      This name appears in the login page, emails, and notifications.
                    </p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      className="bg-tp-600 hover:bg-tp-700 text-white h-10 px-6"
                      onClick={() => {
                        toast({
                          title: 'App Name Updated',
                          description: `Application name set to "${appName}".`,
                        })
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Name
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ================================================================ */}
        {/* Email Notifications Tab (Admin Only) */}
        {/* ================================================================ */}
        {isAdmin && (
          <TabsContent value="emails">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Email Templates</CardTitle>
                      <CardDescription>Manage notification email templates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emailsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : emailTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                        <Mail className="h-6 w-6 text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400">No email templates found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Templates will appear here once created.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                        {emailTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="glass-subtle rounded-xl p-4 border border-white/[0.06] transition-colors hover:border-white/[0.1]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {template.key}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                                      template.isActive
                                        ? 'border-teal-500/30 text-teal-400 bg-teal-500/10'
                                        : 'border-white/[0.08] text-slate-500'
                                    }`}
                                  >
                                    {template.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 truncate">
                                  {template.subject}
                                </p>
                                {template.description && (
                                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                                    {template.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestEmail(template)}
                                disabled={testEmailSending || !testEmailTo.trim()}
                                className="shrink-0 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:text-white h-8 text-xs"
                              >
                                {testEmailSending ? (
                                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3 mr-1.5" />
                                )}
                                Test
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Test Email Input */}
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5 text-slate-400" />
                          Send Test Email
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            value={testEmailTo}
                            onChange={(e) => setTestEmailTo(e.target.value)}
                            placeholder="recipient@example.com"
                            className="h-10 flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (emailTemplates.length > 0) {
                                handleTestEmail(emailTemplates[0])
                              }
                            }}
                            disabled={testEmailSending || !testEmailTo.trim() || emailTemplates.length === 0}
                            className="shrink-0 border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:text-white h-10"
                          >
                            {testEmailSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1.5" />
                                Send Test
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                          Enter a recipient email and click &quot;Test&quot; on any template above to send a test email.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

/* ========================================================================= */
/* Utility
/* ========================================================================= */

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}
