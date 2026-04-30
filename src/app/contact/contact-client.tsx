'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react'

export function ContactPageClient() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    setForm({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Get in <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Have a question or ready to get started? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <p className="text-slate-400 leading-relaxed">
                  Reach out to us through any of the channels below. Our team typically responds within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: <MapPin className="h-5 w-5" />, title: 'Office Address', detail: 'Ohio Street, City Centre\nDar es Salaam, Tanzania' },
                  { icon: <Mail className="h-5 w-5" />, title: 'Email', detail: 'info@tunepoa.co.tz', href: 'mailto:info@tunepoa.co.tz' },
                  { icon: <Phone className="h-5 w-5" />, title: 'Phone', detail: '+255 700 000 000', href: 'tel:+255700000000' },
                  { icon: <Clock className="h-5 w-5" />, title: 'Business Hours', detail: 'Mon - Fri: 8:00 AM - 5:00 PM\nSat: 9:00 AM - 1:00 PM' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors whitespace-pre-line">
                          {item.detail}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-400 whitespace-pre-line">{item.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#0a1628] to-[#0d1f2d] flex items-center justify-center border border-white/[0.06]">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-teal-400/40 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Dar es Salaam, Tanzania</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="glass-card p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-400 mb-6">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                    <Button onClick={() => setSuccess(false)} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Full Name</Label>
                        <Input
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Your full name"
                          className="h-11 glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Email Address</Label>
                        <Input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="h-11 glass-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Phone Number</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+255 7XX XXX XXX"
                        className="h-11 glass-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Message</Label>
                      <Textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us how we can help..."
                        className="glass-input resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-500/90 hover:to-cyan-500/90 text-white font-semibold h-12 rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
