'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CreditCard,
  Users,
  Package,
  Radio,
  BarChart3,
  Settings,
  LogOut,
  X,
  Shield,
  Music2,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'new-request', label: 'New Request', icon: <PlusCircle className="h-5 w-5" /> },
  { id: 'my-requests', label: 'My Requests', icon: <FileText className="h-5 w-5" /> },
  { id: 'packages', label: 'Packages', icon: <Package className="h-5 w-5" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'admin-dashboard', label: 'Admin Overview', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
  { id: 'admin-requests', label: 'All Requests', icon: <FileText className="h-5 w-5" />, adminOnly: true },
  { id: 'admin-subscriptions', label: 'All Subscriptions', icon: <CreditCard className="h-5 w-5" />, adminOnly: true },
  { id: 'admin-users', label: 'Manage Users', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { id: 'admin-packages', label: 'Manage Packages', icon: <Shield className="h-5 w-5" />, adminOnly: true },
  { id: 'admin-mno', label: 'MNO Providers', icon: <Radio className="h-5 w-5" />, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
]

export function Sidebar() {
  const { currentUser, currentView, navigate, logout, isSidebarOpen, setSidebarOpen } = useAppStore()

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN'

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin)

  const handleNav = (viewId: string) => {
    navigate(viewId)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-emerald-700">TunePoa</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {filteredItems.map(item => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 text-sm',
                  currentView === item.id
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                onClick={() => handleNav(item.id)}
              >
                {item.icon}
                {item.label}
                {item.adminOnly && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                    ADMIN
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.businessName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
