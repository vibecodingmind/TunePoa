'use client'

import Image from 'next/image'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Sparkles, Shield, Volume2, Zap, CheckCircle2, Target, Heart, Lightbulb } from 'lucide-react'

const values = [
  { icon: <Shield className="h-5 w-5" />, title: 'Trust & Reliability', desc: 'We build lasting relationships with our clients through transparent, dependable service delivery.' },
  { icon: <Lightbulb className="h-5 w-5" />, title: 'Innovation', desc: 'We continuously push boundaries to offer cutting-edge ringback tone solutions for businesses.' },
  { icon: <Heart className="h-5 w-5" />, title: 'Customer First', desc: 'Every decision we make is guided by the impact it has on our customers\' success.' },
  { icon: <Volume2 className="h-5 w-5" />, title: 'Quality', desc: 'We deliver crystal-clear, professionally produced ringback tones that represent your brand perfectly.' },
]

const team = [
  { name: 'Amani M.', role: 'Founder & CEO', avatar: 'AM' },
  { name: 'Farida J.', role: 'Head of Operations', avatar: 'FJ' },
  { name: 'Joseph K.', role: 'Lead Producer', avatar: 'JK' },
  { name: 'Grace L.', role: 'Customer Success', avatar: 'GL' },
]

export function AboutPageClient() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            About TunePoa
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Transforming How Businesses{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Connect with Callers</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            TunePoa is Tanzania&apos;s premier ringback tone advertising platform, helping businesses turn every incoming call into a branding opportunity.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">Our Story</h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  TunePoa was born out of a simple observation: every day, businesses across Tanzania miss thousands of branding opportunities. When customers call and hear the standard &quot;ring ring&quot;, that valuable airtime goes to waste.
                </p>
                <p>
                  We set out to change that. By partnering with mobile network operators, we built a platform that lets businesses replace the standard ring sound with customized music, branded messages, and promotional content.
                </p>
                <p>
                  Since our launch, we&apos;ve helped hundreds of businesses — from small startups to large enterprises — create memorable caller experiences that boost brand recognition and drive customer engagement.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden glass-card p-2">
              <Image src="/about-team.png" alt="TunePoa Team" width={600} height={400} className="w-full h-auto rounded-xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,201,183,0.06),transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="glass-card p-8 sm:p-10">
              <div className="h-12 w-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed">
                To empower businesses across Tanzania and Africa with innovative ringback tone solutions that transform every phone call into a powerful branding and marketing opportunity.
              </p>
            </div>
            <div className="glass-card p-8 sm:p-10">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To be the leading ringback tone advertising platform in Africa, known for quality, innovation, and measurable impact on our clients&apos; business growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">What Makes TunePoa Different</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We combine technology, creativity, and local expertise to deliver results.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: 'Local Expertise', desc: 'Deep understanding of the Tanzanian market and mobile ecosystem.' },
              { title: 'Professional Production', desc: 'In-house team of audio producers creating broadcast-quality tones.' },
              { title: 'Easy Management', desc: 'Self-service dashboard to manage your ringback tones and track performance.' },
              { title: 'Scalable Solutions', desc: 'From single numbers to enterprise deployments with thousands of lines.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 glass-card p-6">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,201,183,0.06),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="glass-card group relative p-7 hover:-translate-y-1 transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 sm:py-32 bg-[#0b1929] relative">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">Meet Our Team</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The passionate people behind TunePoa.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="glass-card p-6 text-center group hover:-translate-y-1 transition-all duration-500">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                  {member.avatar}
                </div>
                <h3 className="font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-slate-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
