'use client'

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
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <ViewRouter />
        </main>
      </div>
    </div>
  )
}

/* ─── Root Page ─── */
export default function Home() {
  const { isLoggedIn, currentView } = useAppStore()

  if (!isLoggedIn || currentView === 'landing') {
    return <LandingPage />
  }

  return <AppLayout />
}
