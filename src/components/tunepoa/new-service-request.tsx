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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select'
import {
 Loader2,
 Send,
 Megaphone,
 Award,
 Tag,
 Speaker,
 ArrowLeft,
 FileText,
 Lightbulb,
 CheckCircle2,
 Pencil,
 Users,
 Globe,
 AlertCircle,
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

const TARGET_AUDIENCES = [
 { value: 'General Public', label: 'General Public' },
 { value: 'Youth', label: 'Youth' },
 { value: 'Professionals', label: 'Professionals' },
 { value: 'Students', label: 'Students' },
 { value: 'Women', label: 'Women' },
 { value: 'Farmers', label: 'Farmers' },
 { value: 'Business Owners', label: 'Business Owners' },
]

const AD_TYPES = [
 {
 value: 'PROMO',
 label: 'Promotional Ad',
 description: 'Highlight special offers and promotions',
 icon: Megaphone,
 color: 'bg-amber-500/10 text-amber-600',
 activeColor: 'bg-teal-500/10 text-teal-400',
 border: 'border-teal-400/30 bg-teal-500/10/50',
 },
 {
 value: 'BRANDING',
 label: 'Brand Awareness',
 description: 'Build your brand identity and recognition',
 icon: Award,
 color: 'bg-violet-500/15 text-violet-400',
 activeColor: 'bg-teal-500/10 text-teal-400',
 border: 'border-teal-400/30 bg-teal-500/10/50',
 },
 {
 value: 'OFFER',
 label: 'Special Offer',
 description: 'Limited time deals and discounts',
 icon: Tag,
 color: 'bg-rose-500/15 text-rose-400',
 activeColor: 'bg-teal-500/10 text-teal-400',
 border: 'border-teal-400/30 bg-teal-500/10/50',
 },
 {
 value: 'ANNOUNCEMENT',
 label: 'Announcement',
 description: 'Important business announcements',
 icon: Speaker,
 color: 'bg-sky-500/15 text-sky-400',
 activeColor: 'bg-teal-500/10 text-teal-400',
 border: 'border-teal-400/30 bg-teal-500/10/50',
 },
]

const LANGUAGES = [
 { value: 'Swahili', label: 'Swahili' },
 { value: 'English', label: 'English' },
 { value: 'Both', label: 'Both (Swahili & English)' },
]

const MAX_SCRIPT_LENGTH = 500
const MIN_SCRIPT_LENGTH = 50

/* ========================================================================= */
/* Component */
/* ========================================================================= */

export function NewServiceRequest() {
 const { user, token, navigate } = useAppStore()
 const { toast } = useToast()

 const [loading, setLoading] = useState(false)
 const [editSection, setEditSection] = useState<
 'business' | 'ad' | 'instructions' | 'review' | null
 >('business')
 const [form, setForm] = useState({
 businessName: user?.businessName || '',
 businessCategory: user?.businessCategory || '',
 targetAudience: '',
 adType: 'PROMO',
 preferredLanguage: 'Swahili',
 adScript: '',
 specialInstructions: '',
 })

 const updateField = (field: string, value: string) => {
 setForm((prev) => ({ ...prev, [field]: value }))
 }

 /* ---- Validation ---- */

 const errors = useMemo(() => {
 const errs: Record<string, string> = {}
 if (!form.businessName.trim()) errs.businessName = 'Business name is required'
 if (!form.businessCategory) errs.businessCategory = 'Business category is required'
 if (!form.targetAudience) errs.targetAudience = 'Target audience is required'
 if (!form.adType) errs.adType = 'Ad type is required'
 if (!form.preferredLanguage) errs.preferredLanguage = 'Language is required'
 if (form.adScript.length > 0 && form.adScript.length < MIN_SCRIPT_LENGTH)
 errs.adScript = `Script must be at least ${MIN_SCRIPT_LENGTH} characters`
 if (form.adScript.length > MAX_SCRIPT_LENGTH)
 errs.adScript = `Script must be at most ${MAX_SCRIPT_LENGTH} characters`
 if (editSection === 'review' && !form.adScript.trim())
 errs.adScript = 'Ad script is required'
 return errs
 }, [form, editSection])

 const isFormComplete = useMemo(() => {
 return (
 form.businessName.trim() !== '' &&
 form.businessCategory !== '' &&
 form.targetAudience !== '' &&
 form.adType !== '' &&
 form.preferredLanguage !== '' &&
 form.adScript.trim() !== '' &&
 form.adScript.length >= MIN_SCRIPT_LENGTH
 )
 }, [form])

 /* ---- Submit ---- */

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()

 if (!isFormComplete) {
 toast({
 title: 'Incomplete Form',
 description: 'Please fill in all required fields before submitting.',
 variant: 'destructive',
 })
 return
 }

 if (!user || !token) return

 setLoading(true)
 try {
 const res = await fetch('/api/service-requests', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({
 businessName: form.businessName,
 businessCategory: form.businessCategory,
 targetAudience: form.targetAudience,
 adType: form.adType,
 preferredLanguage: form.preferredLanguage,
 adScript: form.adScript,
 specialInstructions: form.specialInstructions || null,
 }),
 })

 const data = await res.json()

 if (!res.ok || !data.success) {
 toast({
 title: 'Error',
 description: data.error || 'Failed to create service request',
 variant: 'destructive',
 })
 return
 }

 toast({
 title: 'Request Created',
 description: 'Your service request has been submitted successfully.',
 })
 navigate('my-requests')
 } catch {
 toast({
 title: 'Network Error',
 description: 'Please check your connection and try again.',
 variant: 'destructive',
 })
 } finally {
 setLoading(false)
 }
 }

 /* ---- Helpers ---- */

 const selectedAdType = AD_TYPES.find((a) => a.value === form.adType)
 const scriptPercentage = Math.min((form.adScript.length / MAX_SCRIPT_LENGTH) * 100, 100)
 const scriptColor =
 form.adScript.length === 0
 ? 'bg-white/[0.08]'
 : form.adScript.length < MIN_SCRIPT_LENGTH
 ? 'bg-amber-400'
 : 'bg-teal-500/100'

 const completedSteps = [
 { label: 'Business', done: form.businessName.trim() !== '' && form.businessCategory !== '' },
 { label: 'Ad Type', done: form.adType !== '' },
 { label: 'Script', done: form.adScript.length >= MIN_SCRIPT_LENGTH },
 ]

 /* ---- Render ---- */

 return (
 <div className="space-y-6 max-w-3xl mx-auto">
 {/* Page Header */}
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')} className="shrink-0">
 <ArrowLeft className="h-5 w-5" />
 </Button>
 <div className="flex-1">
 <h1 className="text-2xl font-bold text-white">New Service Request</h1>
 <p className="text-slate-400 text-sm mt-0.5">Create a new ringback tone ad for your business</p>
 </div>
 </div>

 {/* Progress indicator */}
 <div className="flex items-center gap-3">
 {completedSteps.map((step, i) => (
 <div key={step.label} className="flex items-center gap-3 flex-1">
 <div className="flex items-center gap-2 flex-1">
 <div
 className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${ step.done ? 'bg-tp-600 text-white' : 'bg-white/5 text-slate-400' }`}
 >
 {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
 </div>
 <span
 className={`text-xs font-medium hidden sm:inline ${ step.done ? 'text-teal-300' : 'text-slate-400' }`}
 >
 {step.label}
 </span>
 </div>
 {i < completedSteps.length - 1 && (
 <div className={`h-px flex-1 ${step.done ? 'bg-tp-300' : 'bg-white/[0.08]'}`} />
 )}
 </div>
 ))}
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* ================================================================ */}
 {/* Business Details Card */}
 {/* ================================================================ */}
 <Card className="border-0 shadow-sm">
 <CardHeader className="pb-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
 <FileText className="h-5 w-5 text-teal-400" />
 </div>
 <div>
 <CardTitle className="text-lg text-white">Business Details</CardTitle>
 <CardDescription>Information about your business</CardDescription>
 </div>
 </div>
 {editSection !== 'business' && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => setEditSection('business')}
 className="text-slate-400 hover:text-slate-300"
 >
 <Pencil className="h-3.5 w-3.5 mr-1" />
 Edit
 </Button>
 )}
 </div>
 </CardHeader>
 {(editSection === 'business' || editSection === null) && (
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="businessName">
 Business Name <span className="text-red-500">*</span>
 </Label>
 <Input
 id="businessName"
 value={form.businessName}
 onChange={(e) => updateField('businessName', e.target.value)}
 placeholder="Enter your business name"
 className={`h-11 bg-white/5 border-white/[0.08] text-white ${errors.businessName ? 'border-red-400 focus:ring-red-200' : ''}`}
 />
 {errors.businessName && (
 <p className="text-xs text-red-500 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.businessName}
 </p>
 )}
 </div>

 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="businessCategory">
 Business Category <span className="text-red-500">*</span>
 </Label>
 <Select
 value={form.businessCategory}
 onValueChange={(v) => updateField('businessCategory', v)}
 >
 <SelectTrigger
 id="businessCategory"
 className={`h-11 bg-white/5 border-white/[0.08] text-white ${errors.businessCategory ? 'border-red-400' : ''}`}
 >
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
 {errors.businessCategory && (
 <p className="text-xs text-red-500 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.businessCategory}
 </p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="targetAudience">
 Target Audience <span className="text-red-500">*</span>
 </Label>
 <Select
 value={form.targetAudience}
 onValueChange={(v) => updateField('targetAudience', v)}
 >
 <SelectTrigger
 id="targetAudience"
 className={`h-11 bg-white/5 border-white/[0.08] text-white ${errors.targetAudience ? 'border-red-400' : ''}`}
 >
 <SelectValue placeholder="Select audience" />
 </SelectTrigger>
 <SelectContent>
 {TARGET_AUDIENCES.map((aud) => (
 <SelectItem key={aud.value} value={aud.value}>
 {aud.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.targetAudience && (
 <p className="text-xs text-red-500 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.targetAudience}
 </p>
 )}
 </div>
 </div>
 </CardContent>
 )}
 </Card>

 {/* ================================================================ */}
 {/* Ad Details Card */}
 {/* ================================================================ */}
 <Card className="border-0 shadow-sm">
 <CardHeader className="pb-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
 <Megaphone className="h-5 w-5 text-teal-400" />
 </div>
 <div>
 <CardTitle className="text-lg text-white">Ad Details</CardTitle>
 <CardDescription>Choose your ad type and write your script</CardDescription>
 </div>
 </div>
 {editSection !== 'ad' && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => setEditSection('ad')}
 className="text-slate-400 hover:text-slate-300"
 >
 <Pencil className="h-3.5 w-3.5 mr-1" />
 Edit
 </Button>
 )}
 </div>
 </CardHeader>
 {(editSection === 'ad' || editSection === null) && (
 <CardContent className="space-y-6">
 {/* Ad Type Selection */}
 <div className="space-y-3">
 <Label className="text-white font-medium">Ad Type</Label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {AD_TYPES.map((type) => {
 const Icon = type.icon
 const isSelected = form.adType === type.value
 return (
 <button
 key={type.value}
 type="button"
 onClick={() => updateField('adType', type.value)}
 className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${ isSelected ? type.border : 'border-white/[0.08] hover:border-slate-300 ' }`}
 >
 <div className="flex items-start gap-3">
 <div
 className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${ isSelected ? type.activeColor : type.color }`}
 >
 <Icon className="h-5 w-5" />
 </div>
 <div>
 <p
 className={`font-semibold text-sm ${ isSelected ? 'text-teal-300' : 'text-white' }`}
 >
 {type.label}
 </p>
 <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>
 </div>
 </div>
 </button>
 )
 })}
 </div>
 </div>

 {/* Preferred Language */}
 <div className="space-y-2">
 <Label htmlFor="preferredLanguage" className="flex items-center gap-1.5">
 <Globe className="h-3.5 w-3.5 text-slate-400" />
 Preferred Language <span className="text-red-500">*</span>
 </Label>
 <Select
 value={form.preferredLanguage}
 onValueChange={(v) => updateField('preferredLanguage', v)}
 >
 <SelectTrigger
 id="preferredLanguage"
 className={`h-11 w-full sm:w-64 bg-white/5 border-white/[0.08] text-white ${errors.preferredLanguage ? 'border-red-400' : ''}`}
 >
 <SelectValue placeholder="Select language" />
 </SelectTrigger>
 <SelectContent>
 {LANGUAGES.map((lang) => (
 <SelectItem key={lang.value} value={lang.value}>
 {lang.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Ad Script */}
 <div className="space-y-2">
 <Label htmlFor="adScript">
 Ad Script <span className="text-red-500">*</span>
 </Label>
 <Textarea
 id="adScript"
 value={form.adScript}
 onChange={(e) => updateField('adScript', e.target.value)}
 placeholder={`Write your ringback tone ad script here.\n\nExample: "Karibu Kijani Bora! Where fresh meets flavour. Come enjoy our special nyama choma this weekend at an unbeatable price. Visit us at Kijangwa Road, Dar es Salaam."`}
 rows={6}
 className={`resize-none text-sm leading-relaxed bg-white/5 border-white/[0.08] text-white ${errors.adScript ? 'border-red-400' : ''}`}
 />
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 flex-1">
 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-xs">
 <div
 className={`h-full rounded-full transition-all duration-300 ${scriptColor}`}
 style={{ width: `${scriptPercentage}%` }}
 />
 </div>
 <span
 className={`text-xs font-medium ${ form.adScript.length === 0 ? 'text-slate-400' : form.adScript.length < MIN_SCRIPT_LENGTH ? 'text-amber-600' : 'text-teal-400' }`}
 >
 {form.adScript.length}/{MAX_SCRIPT_LENGTH}
 </span>
 </div>
 {form.adScript.length > 0 && form.adScript.length < MIN_SCRIPT_LENGTH && (
 <span className="text-xs text-amber-600">
 {MIN_SCRIPT_LENGTH - form.adScript.length} more needed
 </span>
 )}
 </div>
 {errors.adScript && (
 <p className="text-xs text-red-500 flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {errors.adScript}
 </p>
 )}
 </div>

 {/* Tips */}
 <div className="rounded-xl bg-teal-500/10 border border-teal-500/10 p-4">
 <div className="flex items-start gap-3">
 <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
 <Lightbulb className="h-4 w-4 text-teal-400" />
 </div>
 <div>
 <p className="text-sm font-semibold text-teal-300">Tips for a great ad script</p>
 <ul className="mt-1.5 space-y-1 text-xs text-teal-300">
 <li>Write a clear, catchy script that represents your business</li>
 <li>Keep it concise and memorable</li>
 <li>Include your business name, what you offer, and a call to action</li>
 </ul>
 </div>
 </div>
 </div>
 </CardContent>
 )}
 </Card>

 {/* ================================================================ */}
 {/* Special Instructions Card */}
 {/* ================================================================ */}
 <Card className="border-0 shadow-sm">
 <CardHeader className="pb-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
 <FileText className="h-5 w-5 text-teal-400" />
 </div>
 <div>
 <CardTitle className="text-lg text-white">Special Instructions</CardTitle>
 <CardDescription>Optional details for our production team</CardDescription>
 </div>
 </div>
 {editSection !== 'instructions' && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => setEditSection('instructions')}
 className="text-slate-400 hover:text-slate-300"
 >
 <Pencil className="h-3.5 w-3.5 mr-1" />
 Edit
 </Button>
 )}
 </div>
 </CardHeader>
 {(editSection === 'instructions' || editSection === null) && (
 <CardContent>
 <Textarea
 value={form.specialInstructions}
 onChange={(e) => updateField('specialInstructions', e.target.value)}
 placeholder="Any special requests? For example: 'Use an energetic voice', 'Include background music', 'Mention location'..."
 rows={3}
 className="resize-none text-sm bg-white/5 border-white/[0.08] text-white"
 />
 </CardContent>
 )}
 </Card>

 {/* ================================================================ */}
 {/* Review Card */}
 {/* ================================================================ */}
 {isFormComplete && editSection === null && (
 <Card className="border-0 shadow-sm border-l-4 border-l-tp-500">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-2">
 <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center">
 <CheckCircle2 className="h-4 w-4 text-teal-400" />
 </div>
 <div>
 <CardTitle className="text-lg text-white">Review Your Request</CardTitle>
 <CardDescription>Verify all details before submitting</CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-5">
 {/* Business Info Summary */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
 Business Name
 </p>
 <p className="text-sm text-white mt-0.5 font-medium">{form.businessName}</p>
 </div>
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
 Category
 </p>
 <p className="text-sm text-white mt-0.5 font-medium">{form.businessCategory}</p>
 </div>
 <div className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-slate-400" />
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
 Target Audience
 </p>
 <p className="text-sm text-white mt-0.5 font-medium">{form.targetAudience}</p>
 </div>
 </div>
 <div className="flex items-center gap-1.5">
 <Globe className="h-3.5 w-3.5 text-slate-400" />
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
 Language
 </p>
 <p className="text-sm text-white mt-0.5 font-medium">{form.preferredLanguage}</p>
 </div>
 </div>
 </div>

 <Separator />

 {/* Ad Type */}
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
 {selectedAdType && <selectedAdType.icon className="h-5 w-5 text-teal-400" />}
 </div>
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ad Type</p>
 <p className="text-sm text-white mt-0.5 font-medium">{selectedAdType?.label}</p>
 </div>
 </div>

 {/* Script Preview */}
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
 Ad Script
 </p>
 <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
 <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
 {form.adScript}
 </p>
 </div>
 <p className="text-xs text-slate-400 mt-1">{form.adScript.length} characters</p>
 </div>

 {/* Special Instructions */}
 {form.specialInstructions.trim() && (
 <div>
 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
 Special Instructions
 </p>
 <p className="text-sm text-slate-300">{form.specialInstructions}</p>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* ================================================================ */}
 {/* Submit */}
 {/* ================================================================ */}
 <Button
 type="submit"
 className="w-full bg-tp-600 hover:bg-tp-700 text-white h-12 font-medium text-base"
 disabled={loading}
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 Submitting Request...
 </>
 ) : (
 <>
 <Send className="h-4 w-4 mr-2" />
 Submit Service Request
 </>
 )}
 </Button>
 </form>

 {/* ================================================================= */}
 {/* Sidebar Info */}
 {/* ================================================================= */}
 <div className="grid sm:grid-cols-2 gap-4">
 <Card className="border-0 shadow-sm bg-teal-500/10">
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
 <FileText className="h-4 w-4 text-teal-400" />
 </div>
 <div>
 <h3 className="font-semibold text-teal-300 text-sm">What Happens Next?</h3>
 <ol className="mt-2 space-y-1.5 text-xs text-teal-300">
 <li className="flex items-start gap-2">
 <span className="font-bold text-teal-400 shrink-0">1.</span>
 Admin reviews your request
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-teal-400 shrink-0">2.</span>
 Once approved, subscription starts automatically
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-teal-400 shrink-0">3.</span>
 Make payment to activate your ringback tone
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-teal-400 shrink-0">4.</span>
 Your ad goes live on every incoming call!
 </li>
 </ol>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-0 shadow-sm bg-amber-500/10">
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
 <Lightbulb className="h-4 w-4 text-amber-600" />
 </div>
 <div>
 <h3 className="font-semibold text-amber-300 text-sm">Pro Tips</h3>
 <ul className="mt-2 space-y-1.5 text-xs text-amber-400">
 <li>Keep your message clear and concise</li>
 <li>Include a call to action</li>
 <li>Mention your location if possible</li>
 </ul>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 )
}
