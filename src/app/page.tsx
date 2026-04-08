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
import { AdminMno } from '@/components/tunepoa/admin-mno'
import { SettingsPage } from '@/components/tunepoa/settings-page'
import { MyRequests } from '@/components/tunepoa/my-requests'
import { MySubscriptions } from '@/components/tunepoa/my-subscriptions'
import { Music2 } from 'lucide-react'

/* ─── Branded Loading Screen ─── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-5 animate-fade-in-scale">
        {/* Logo */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center animate-logo-pulse">
            <Music2 className="h-8 w-8 text-white" />
          </div>
          {/* Orbiting ring */}
          <div className="absolute -inset-3 rounded-3xl border-2 border-emerald-200/50 animate-spin-slow" />
        </div>
        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">TunePoa</h1>
          <p className="text-sm text-slate-400 mt-0.5">Loading your experience...</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── View Router ─── */
function ViewRouter() {
  const { currentView } = useAppStore()

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
    case 'admin-mno':
      return <AdminMno />
    case 'settings':
      return <SettingsPage />
    default:
      return <UserDashboard />
  }
}

/* ─── Authenticated App Layout ─── */
function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 bg-dot-pattern">
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
