'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'

export function ContactPageClient() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <MessageSquare className="h-3.5 w-3.5" />
            Contact Us
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Get in <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Have a question, need a custom solution, or ready to transform how your callers experience your brand? We&apos;d love to hear from you. Our dedicated team is here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.04),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Let&apos;s Start a Conversation</h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Whether you&apos;re exploring ringback tones for the first time or looking to scale your existing setup, our team is ready to provide personalized guidance. Reach out through any of the channels below, and we&apos;ll respond within 24 hours.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: <MapPin className="h-5 w-5" />, title: 'Visit Our Office', detail: '10636, Sokoine Rd, ACU Building\nArusha, Tanzania' },
                  { icon: <Mail className="h-5 w-5" />, title: 'Email Us', detail: 'hello@tunepoa.com', href: 'mailto:hello@tunepoa.com' },
                  { icon: <Phone className="h-5 w-5" />, title: 'Call Us', detail: '+255 741 0 17 0 17', href: 'tel:+255741017017' },
                  { icon: <Clock className="h-5 w-5" />, title: 'Business Hours', detail: 'Mon - Fri: 8:00 AM - 5:00 PM\nSat: 9:00 AM - 1:00 PM' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-500/15 group-hover:border-teal-500/30 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div className="pt-1">
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

              {/* Quick Response Promise */}
              <div className="glass-card p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">Quick Response Guarantee</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We understand the importance of timely communication. Our support team reviews every inquiry and responds within one business day, ensuring you never have to wait long for the answers you need.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="glass-card p-8 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Send Us a Message</h2>
                <p className="text-slate-400 text-sm mb-8">Fill out the form below and we&apos;ll get back to you promptly.</p>

                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Message Sent Successfully!</h3>
                    <p className="text-slate-400 mb-6">Thank you for reaching out to TunePoa. Our team will review your message and get back to you within 24 hours.</p>
                    <Button onClick={() => setSuccess(false)} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-8 h-11 rounded-xl">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Full Name <span className="text-red-400">*</span></Label>
                        <Input
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Your full name"
                          className="h-11 glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Email Address <span className="text-red-400">*</span></Label>
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
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Phone Number</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+255 7XX XXX XXX"
                          className="h-11 glass-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Subject</Label>
                        <Input
                          value={form.subject}
                          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                          placeholder="How can we help?"
                          className="h-11 glass-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-sm">Message <span className="text-red-400">*</span></Label>
                      <Textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us about your business and how we can help..."
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
