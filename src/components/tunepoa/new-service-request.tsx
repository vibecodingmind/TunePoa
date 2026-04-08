'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const adTypes = [
  { value: 'PROMO', label: 'Promotional Ad', desc: 'Promote a specific product, service, or offer' },
  { value: 'BRANDING', label: 'Branding', desc: 'Build brand awareness with a catchy message' },
  { value: 'OFFER', label: 'Special Offer', desc: 'Highlight a time-limited discount or deal' },
  { value: 'ANNOUNCEMENT', label: 'Announcement', desc: 'Share important news or updates' },
]

export function NewServiceRequest() {
  const { currentUser, navigate } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    businessName: currentUser?.businessName || '',
    businessCategory: currentUser?.businessCategory || 'general',
    adType: 'PROMO',
    targetAudience: '',
    adScript: '',
    preferredLanguage: 'swahili',
    specialInstructions: '',
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.adScript.trim()) {
      toast({ title: 'Error', description: 'Ad script is required', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create request', variant: 'destructive' })
        return
      }

      toast({ title: 'Request Created!', description: 'Your service request has been submitted successfully.' })
      navigate('dashboard')
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const selectedAdType = adTypes.find(a => a.value === form.adType)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
          <p className="text-gray-500 text-sm">Create a new ringback tone ad for your business</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Business Details</CardTitle>
                <CardDescription>Information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input
                      value={form.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Category</Label>
                    <Select value={form.businessCategory} onValueChange={(v) => updateField('businessCategory', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="restaurant">Restaurant & Food</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="media">Media & Entertainment</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ad Type */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Ad Type</CardTitle>
                <CardDescription>What kind of ringback tone ad do you need?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {adTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateField('adType', type.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.adType === type.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Target Audience</CardTitle>
                <CardDescription>Who do you want to reach?</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={form.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  placeholder="e.g., Young professionals aged 25-40, parents, students..."
                />
              </CardContent>
            </Card>

            {/* Ad Script */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Ad Script</CardTitle>
                <CardDescription>
                  Write the message you want callers to hear. {selectedAdType && `Keep it concise for ${selectedAdType.label.toLowerCase()}.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.adScript}
                  onChange={(e) => updateField('adScript', e.target.value)}
                  placeholder="Write your ringback tone ad script here. For example: &#10;&#10;'Karibu Kijani Bora! Where fresh meets flavour. Come enjoy our special nyama choma this weekend at an unbeatable price.'"
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {form.adScript.length} characters • Aim for 100-200 characters for best results
                </p>
              </CardContent>
            </Card>

            {/* Language & Instructions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select value={form.preferredLanguage} onValueChange={(v) => updateField('preferredLanguage', v)}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="swahili">Swahili</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="both">Both (Swahili & English)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Special Instructions (Optional)</Label>
                  <Textarea
                    value={form.specialInstructions}
                    onChange={(e) => updateField('specialInstructions', e.target.value)}
                    placeholder="Any special requests? e.g., 'Use an energetic voice', 'Include background music', 'Mention location'..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('dashboard')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Request
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm bg-emerald-50 border-emerald-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-emerald-800 mb-2">Tips for a Great Ad</h3>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  Keep your message clear and concise
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  Include a call to action
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  Mention your location if possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  Consider your target audience&apos;s language
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  Keep scripts under 30 seconds for best results
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">What Happens Next?</h3>
              <ol className="space-y-2 text-sm text-yellow-700">
                <li>1. We review your request</li>
                <li>2. Studio team creates your ad</li>
                <li>3. Preview via WhatsApp</li>
                <li>4. Approve and go live!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
