'use client'

import { useStore, useAppStore, type ViewId } from '@/lib/store'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CreditCard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  X,
  Shield,
  ChevronRight,
  DollarSign,
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
const userNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'my-requests', label: 'Requests', icon: <FileText className="h-[18px] w-[18px]" /> },
  { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" /> },
  { id: 'packages', label: 'Packages', icon: <Package className="h-[18px] w-[18px]" /> },
  { id: 'new-request', label: 'New Request', icon: <PlusCircle className="h-[18px] w-[18px]" /> },
]

const adminNavItems: NavItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: <BarChart3 className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-requests', label: 'Requests', icon: <FileText className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-users', label: 'Users', icon: <Users className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-packages', label: 'Packages', icon: <Shield className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-pricing', label: 'Pricing', icon: <DollarSign className="h-[18px] w-[18px]" />, adminOnly: true },
]

const settingsNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
]

/* ─── Sidebar Content (shared between desktop and mobile) ─── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentUser, currentView, navigate, logout, isAdmin } = useAppStore()
  const { theme } = useStore()

  const handleNav = (viewId: string) => {
    navigate(viewId as ViewId)
    onClose?.()
  }

  const showAdminSection = isAdmin()

  // Show user nav items for business owners, admin nav items for admins
  const visibleNavSections: NavSection[] = showAdminSection
    ? [{ title: 'Administration', items: adminNavItems }, { title: 'Settings', items: settingsNavItems }]
    : [{ title: 'Main', items: userNavItems }, { title: 'Settings', items: settingsNavItems }]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo-square.png" alt="TunePoa" width={36} height={36} className="rounded-xl shadow-lg" />
          <div>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">TunePoa</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none -mt-0.5">Ringback Platform</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800" />

      {/* User info card */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-tp-500 to-ts-400 text-white flex items-center justify-center font-semibold text-sm shadow-md shadow-tp-500/15">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-tp-500 border-2 border-white dark:border-slate-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {currentUser?.businessName || currentUser?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-1">
        <nav className="space-y-5">
          {visibleNavSections.map((section) => {
            const items = section.items.filter((item) => {
              if (item.adminOnly && !isAdmin) return false
              return true
            })

            if (items.length === 0) return null

            return (
              <div key={section.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
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
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 text-left group',
                          isActive
                            ? 'bg-tp-500/10 dark:bg-tp-500/15 text-tp-600 dark:text-tp-400 font-medium border border-tp-500/20 shadow-sm shadow-tp-500/5'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-tp-50 dark:hover:bg-tp-900/30 border border-transparent'
                        )}
                      >
                        <span className={cn(
                          'shrink-0 transition-colors duration-200',
                          isActive
                            ? 'text-tp-600 dark:text-tp-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-tp-500/60" />
                        )}
                        {item.adminOnly && !isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-200/60 dark:border-amber-500/20">
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

      {/* Divider */}
      <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800" />

      {/* Sign out */}
      <div className="p-3 shrink-0">
        <Button
          variant="ghost"
          className="w-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 justify-start gap-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Bottom brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-tp-500 via-ts-400 to-tp-500 opacity-70 dark:opacity-50" />
    </div>
  )
}

/* ─── Main Sidebar Component ─── */
export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
