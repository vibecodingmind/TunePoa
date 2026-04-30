import type { Metadata } from 'next'
import { PublicLayout } from '@/components/tunepoa/public-layout'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - TunePoa',
  description: 'TunePoa terms of service - the rules and guidelines for using our ringback tone advertising platform.',
}

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,183,0.1),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[#0b1929]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
            <div className="glass-card p-8 sm:p-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p>By accessing or using TunePoa&apos;s website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
                <p>TunePoa provides ringback tone (RBT) advertising services that allow businesses to replace the standard ringing sound heard by callers with customized music, branded messages, or promotional content. Services are provided on a subscription basis with various pricing tiers.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">3. Account Registration</h2>
                <p>To use our services, you must register an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">4. Content Guidelines</h2>
                <p>You agree that all content you submit for ringback tone production complies with applicable laws and does not contain any material that is defamatory, obscene, offensive, or infringes on the intellectual property rights of third parties. TunePoa reserves the right to reject any content that violates these guidelines.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">5. Payment Terms</h2>
                <p>Subscription fees are billed in advance according to the pricing plan you select. All prices are quoted in Tanzanian Shillings (TZS) unless otherwise stated. Payment is processed through our secure payment gateways. Refunds are handled on a case-by-case basis.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">6. Service Availability</h2>
                <p>We strive to provide uninterrupted service, but we do not guarantee that our services will be available at all times. Ringback tone deployment depends on mobile network operator infrastructure and may be subject to temporary interruptions.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
                <p>All content, branding, and materials on the TunePoa platform are our intellectual property or used with permission. You retain ownership of the content you submit but grant TunePoa a license to use, reproduce, and distribute it solely for the purpose of providing our services.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
                <p>TunePoa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use our services. Our total liability shall not exceed the amount paid by you for the service in the preceding 12 months.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">9. Termination</h2>
                <p>Either party may terminate this agreement at any time. Upon termination, your ringback tones will be deactivated and your account may be closed. Outstanding subscription fees for the current billing period are non-refundable.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
                <p>These Terms of Service shall be governed by and construed in accordance with the laws of the United Republic of Tanzania. Any disputes shall be resolved in the courts of Dar es Salaam, Tanzania.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
                <p>For questions about these Terms, please contact us at legal@tunepoa.co.tz or call +255 700 000 000.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
