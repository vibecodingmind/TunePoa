'use client'

import { useState, useMemo } from 'react'
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
 Clock,
 CheckCircle2,
 Mail,
 Phone,
 Building2,
 MapPin,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/* ========================================================================= */
/* Constants */
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
/* Password Strength Helper */
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
/* Password Toggle Component */
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
 className={`h-11 pr-10 ${ errorBorder ? 'border-red-400 focus:ring-red-200' : successBorder ? 'border-teal-400/30 focus:ring-tp-200' : '' }`}
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
/* Main Component */
/* ========================================================================= */

export function SettingsPage() {
 const { user, token } = useAppStore()
 const { toast } = useToast()

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

 /* ---- Computed ---- */

 const passwordStrength = useMemo(
 () => getPasswordStrength(securityForm.newPassword),
 [securityForm.newPassword],
 )
 const passwordsMatch = securityForm.newPassword === securityForm.confirmPassword
 const initials = user?.name
 ?.split('')
 .map((n) => n[0])
 .join('')
 .toUpperCase()
 .slice(0, 2) || 'U'

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

 /* ---- Render ---- */

 return (
 <div className="space-y-6 max-w-2xl">
 {/* Page Header */}
 <div>
 <h1 className="text-2xl font-bold text-white">Settings</h1>
 <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
 </div>

 <Tabs defaultValue="profile" className="space-y-6">
 <TabsList className="w-full sm:w-auto">
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
 {user?.role?.replace(/_/g, '')}
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

 {/* Two-Factor Auth placeholder */}
 <Card className="border-0 shadow-sm">
 <CardHeader>
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
 <Smartphone className="h-5 w-5 text-slate-400" />
 </div>
 <div>
 <CardTitle className="text-lg text-white">Two-Factor Authentication</CardTitle>
 <CardDescription>Add an extra layer of security to your account</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
 <Shield className="h-5 w-5 text-slate-400" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-300">Coming Soon</p>
 <p className="text-xs text-slate-400">
 Two-factor authentication will be available in a future update.
 </p>
 </div>
 </div>
 <Badge variant="outline" className="text-slate-400 border-white/[0.08] shrink-0">
 <Clock className="h-3 w-3 mr-1" />
 Planned
 </Badge>
 </div>
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
 </Tabs>
 </div>
 )
}

/* ========================================================================= */
/* Utility */
/* ========================================================================= */

function formatDateShort(dateStr: string): string {
 return new Date(dateStr).toLocaleDateString('en-US', {
 month: 'short',
 year: 'numeric',
 })
}
