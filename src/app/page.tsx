'use client'

import { useSyncExternalStore } from 'react'
import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/tunepoa/sidebar'
import { Topbar } from '@/components/tunepoa/topbar'
import { LandingPage } from '@/components/tunepoa/landing-page'
import { UserDashboard } from '@/components/tunepoa/user-dashboard'
import { NewServiceRequest } from '@/components/tunepoa/new-service-request'
import { PackagesPage } from '@/components/tunepoa/packages-page'
import { AdminDashboard } from '@/components/tunepoa/admin-dashboard'
import { AdminRequests } from '@/components/tunepoa/admin-requests'
import { AdminSubscriptions } from '@/components/tunepoa/admin-subscriptions'
import { AdminUsers } from '@/components/tunepoa/admin-users'
import { AdminPackages } from '@/components/tunepoa/admin-packages'
import { AdminPricing } from '@/components/tunepoa/admin-pricing'
import { SettingsPage } from '@/components/tunepoa/settings-page'
import { MyRequests } from '@/components/tunepoa/my-requests'
import { MySubscriptions } from '@/components/tunepoa/my-subscriptions'
import { NotificationsPage } from '@/components/tunepoa/notifications-page'
import { ProfilePage } from '@/components/tunepoa/profile-page'
import { AudioLibraryPage } from '@/components/tunepoa/audio-library-page'
import { MyInvoicesPage } from '@/components/tunepoa/my-invoices-page'
import { AdminAnalyticsPage } from '@/components/tunepoa/admin-analytics-page'
import { AdminActivityLogs } from '@/components/tunepoa/admin-activity-logs'
import { AdminAudioPage } from '@/components/tunepoa/admin-audio-page'
import { AdminInvoicesPage } from '@/components/tunepoa/admin-invoices-page'
import { AdminExportPage } from '@/components/tunepoa/admin-export-page'
import Image from 'next/image'

/* ─── Branded Loading Screen ─── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
      <div className="flex flex-col items-center gap-5 animate-fade-in-scale">
        {/* Logo */}
        <div className="relative">
          <div className="animate-logo-pulse">
            <Image src="/logo-mark-64.png" alt="TunePoa" width={64} height={64} className="rounded-xl" />
          </div>
          {/* Orbiting ring */}
          <div className="absolute -inset-3 rounded-3xl border-2 border-teal-500/30 animate-spin-slow" />
        </div>
        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">TunePoa</h1>
          <p className="text-sm text-slate-500 mt-0.5">Loading your experience...</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Role-based view guard ─── */
// Admin-only views that business owners cannot access
const ADMIN_VIEWS = new Set([
  'admin-dashboard', 'admin-requests', 'admin-subscriptions',
  'admin-users', 'admin-packages', 'admin-pricing',
  'admin-analytics', 'admin-activity-logs', 'admin-audio', 'admin-invoices', 'admin-export',
])
// User-only views that admins should not land on
const USER_VIEWS = new Set([
  'dashboard', 'new-request', 'my-requests', 'packages', 'subscriptions',
  'notifications', 'profile', 'audio-library', 'my-invoices',
])

/* ─── View Router ─── */
function ViewRouter() {
  const { currentView, user, navigate } = useAppStore()
  const role = user?.role || ''
  const isAdminUser = role === 'SUPER_ADMIN' || role === 'ADMIN'

  // Business owner trying to access admin view → redirect to their dashboard
  if (!isAdminUser && ADMIN_VIEWS.has(currentView)) {
    navigate('dashboard')
    return <UserDashboard />
  }

  // Admin trying to access user-only view → redirect to admin dashboard
  if (isAdminUser && USER_VIEWS.has(currentView)) {
    navigate('admin-dashboard')
    return <AdminDashboard />
  }

  switch (currentView) {
    case 'dashboard':
      return <UserDashboard />
    case 'new-request':
      return <NewServiceRequest />
    case 'my-requests':
      return <MyRequests />
    case 'packages':
      return <PackagesPage />
    case 'subscriptions':
      return <MySubscriptions />
    case 'admin-dashboard':
      return <AdminDashboard />
    case 'admin-requests':
      return <AdminRequests />
    case 'admin-subscriptions':
      return <AdminSubscriptions />
    case 'admin-users':
      return <AdminUsers />
    case 'admin-packages':
      return <AdminPackages />
    case 'admin-pricing':
      return <AdminPricing />
    case 'settings':
      return <SettingsPage />
    case 'notifications':
      return <NotificationsPage />
    case 'profile':
      return <ProfilePage />
    case 'audio-library':
      return <AudioLibraryPage />
    case 'my-invoices':
      return <MyInvoicesPage />
    case 'admin-analytics':
      return <AdminAnalyticsPage />
    case 'admin-activity-logs':
      return <AdminActivityLogs />
    case 'admin-audio':
      return <AdminAudioPage />
    case 'admin-invoices':
      return <AdminInvoicesPage />
    case 'admin-export':
      return <AdminExportPage />
    default:
      return isAdminUser ? <AdminDashboard /> : <UserDashboard />
  }
}

/* ─── Authenticated App Layout ─── */
function AppLayout() {
  return (
    <div className="min-h-screen flex bg-[#0a1628] bg-dot-pattern">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ViewRouter />
        </main>
      </div>
    </div>
  )
}

/* ─── Hydration-safe mounted check ─── */
const emptySubscribe = () => () => {}

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

/* ─── Root Page ─── */
export default function Home() {
  const { isLoggedIn, currentView } = useAppStore()
  const mounted = useHydrated()

  // Show branded loading screen before hydration to prevent double-site
  if (!mounted) {
    return <LoadingScreen />
  }

  if (!isLoggedIn || currentView === 'landing') {
    return <LandingPage />
  }

  return <AppLayout />
}
