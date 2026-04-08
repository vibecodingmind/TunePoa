'use client'

import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/tunepoa/sidebar'
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
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar, currentView } = useAppStore()

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      'new-request': 'New Service Request',
      'my-requests': 'My Requests',
      packages: 'Packages',
      subscriptions: 'My Subscriptions',
      'admin-dashboard': 'Admin Dashboard',
      'admin-requests': 'Service Requests',
      'admin-subscriptions': 'Subscriptions',
      'admin-users': 'Users',
      'admin-packages': 'Packages',
      'admin-mno': 'MNO Providers',
      settings: 'Settings',
    }
    return titles[currentView] || 'Dashboard'
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900 text-lg hidden sm:block">{getPageTitle()}</h1>
          <div className="flex-1" />
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function renderView(view: string) {
  switch (view) {
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

export default function Home() {
  const { isLoggedIn, currentView } = useAppStore()

  if (!isLoggedIn || currentView === 'landing') {
    return <LandingPage />
  }

  return (
    <AppLayout>
      {renderView(currentView)}
    </AppLayout>
  )
}
