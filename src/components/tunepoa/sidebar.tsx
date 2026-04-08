'use client'

import { useStore, useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
  CircleDollarSign,
} from 'lucide-react'

/* ─── Nav Item Type ─── */
interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
  managerOnly?: boolean
}

/* ─── Nav Section Type ─── */
interface NavSection {
  title: string
  items: NavItem[]
}

/* ─── Navigation Definition ─── */
const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { id: 'my-requests', label: 'Requests', icon: <FileText className="h-5 w-5" /> },
      { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-5 w-5" /> },
      { id: 'packages', label: 'Packages', icon: <Package className="h-5 w-5" /> },
      { id: 'new-request', label: 'New Request', icon: <PlusCircle className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
      { id: 'admin-requests', label: 'Requests', icon: <FileText className="h-5 w-5" />, adminOnly: true },
      { id: 'admin-subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-5 w-5" />, adminOnly: true },
      { id: 'admin-users', label: 'Users', icon: <Users className="h-5 w-5" />, adminOnly: true },
      { id: 'admin-packages', label: 'Packages', icon: <Shield className="h-5 w-5" />, adminOnly: true },
      { id: 'admin-mno', label: 'MNO', icon: <Radio className="h-5 w-5" />, adminOnly: true },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    ],
  },
]

/* ─── Sidebar Content (shared between desktop and mobile) ─── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentUser, currentView, navigate, logout, isAdmin, isStudioManager } = useAppStore()

  const handleNav = (viewId: string) => {
    navigate(viewId)
    onClose?.()
  }

  const showAdminSection = isAdmin || isStudioManager

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">TunePoa</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      {/* User info */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {currentUser?.businessName || currentUser?.email}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-6">
          {navSections.map((section) => {
            // Filter out admin section for non-admin users
            if (section.title === 'Admin' && !showAdminSection) return null

            // Filter items within admin section for manager-only items
            const items = section.items.filter((item) => {
              if (item.adminOnly && !isAdmin) return false
              if (item.managerOnly && !isAdmin && !isStudioManager) return false
              return true
            })

            if (items.length === 0) return null

            return (
              <div key={section.title}>
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = currentView === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent'
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-emerald-600' : 'text-slate-400')}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.adminOnly && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                            ADMIN
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Logout */}
      <div className="p-3 shrink-0">
        <Button
          variant="outline"
          className="w-full text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

/* ─── Main Sidebar Component ─── */
export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
