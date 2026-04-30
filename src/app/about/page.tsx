import type { Metadata } from 'next'
import { AboutPageClient } from './about-client'

export const metadata: Metadata = {
  title: 'About TunePoa - Our Story & Mission',
  description: 'Learn about TunePoa, Tanzania\'s leading ringback tone advertising platform. Our mission, vision, and the team behind the service.',
}

export default function AboutPage() {
  return <AboutPageClient />
}
