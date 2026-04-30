import type { Metadata } from 'next'
import { ContactPageClient } from './contact-client'

export const metadata: Metadata = {
  title: 'Contact TunePoa - Get in Touch',
  description: 'Contact TunePoa for ringback tone services in Tanzania. Reach us via email, phone, or visit our office in Dar es Salaam.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
