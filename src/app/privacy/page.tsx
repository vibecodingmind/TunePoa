import type { Metadata } from 'next'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - TunePoa',
  description: 'TunePoa privacy policy - how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#0b1929]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
            <div className="glass-card p-8 sm:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
                <p>TunePoa (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website tunepoa.co.tz and use our ringback tone services.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
                <p className="mb-2">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-1 text-slate-400">
                  <li><strong className="text-slate-300">Personal Information:</strong> Name, email address, phone number, business name, and business category provided during registration.</li>
                  <li><strong className="text-slate-300">Usage Data:</strong> Information about how you use our services, including pages visited, features used, and interaction patterns.</li>
                  <li><strong className="text-slate-300">Audio Content:</strong> Audio files you upload for ringback tone production and deployment.</li>
                  <li><strong className="text-slate-300">Payment Information:</strong> Payment method details processed through secure third-party payment gateways. We do not store full card details on our servers.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1 text-slate-400">
                  <li>Provide, maintain, and improve our ringback tone services</li>
                  <li>Process and fulfill your service requests and subscriptions</li>
                  <li>Communicate with you about your account, orders, and updates</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Detect, prevent, and address fraud and security issues</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing and Disclosure</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1 text-slate-400">
                  <li><strong className="text-slate-300">Mobile Network Operators:</strong> To deploy and manage your ringback tones on your phone numbers.</li>
                  <li><strong className="text-slate-300">Payment Processors:</strong> To process your payments securely.</li>
                  <li><strong className="text-slate-300">Service Providers:</strong> Trusted third parties that help us operate our platform.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
                <p>We implement industry-standard security measures to protect your personal information, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal information. You may also opt out of promotional communications at any time by contacting us at privacy@tunepoa.co.tz.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
                <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">8. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website with a revised &quot;Last Updated&quot; date.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p className="mt-2">Email: privacy@tunepoa.co.tz<br />Phone: +255 700 000 000<br />Address: Ohio Street, City Centre, Dar es Salaam, Tanzania</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
