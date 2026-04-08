'use client'

import { useStore, useAppStore } from '@/lib/store'
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
  Radio,
  BarChart3,
  Settings,
  LogOut,
  X,
  Shield,
  Music2,
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
const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { id: 'my-requests', label: 'Requests', icon: <FileText className="h-[18px] w-[18px]" /> },
      { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" /> },
      { id: 'packages', label: 'Packages', icon: <Package className="h-[18px] w-[18px]" /> },
      { id: 'new-request', label: 'New Request', icon: <PlusCircle className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: <BarChart3 className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-requests', label: 'Requests', icon: <FileText className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-users', label: 'Users', icon: <Users className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-packages', label: 'Packages', icon: <Shield className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-pricing', label: 'Pricing', icon: <DollarSign className="h-[18px] w-[18px]" />, adminOnly: true },
      { id: 'admin-mno', label: 'MNO', icon: <Radio className="h-[18px] w-[18px]" />, adminOnly: true },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
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
    <div className="flex flex-col h-full bg-slate-950">
      {/* Logo area with gradient accent */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight">TunePoa</span>
            <p className="text-[10px] text-slate-500 leading-none -mt-0.5">Ringback Platform</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-500 hover:text-white hover:bg-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Divider with gradient */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* User info */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-md shadow-emerald-500/10">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {currentUser?.businessName || currentUser?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2 scrollbar-dark">
        <nav className="space-y-5">
          {navSections.map((section) => {
            if (section.title === 'Admin' && !showAdminSection) return null

            const items = section.items.filter((item) => {
              if (item.adminOnly && !isAdmin) return false
              if (item.managerOnly && !isAdmin && !isStudioManager) return false
              return true
            })

            if (items.length === 0) return null

            return (
              <div key={section.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
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
                            ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                        )}
                      >
                        <span className={cn(
                          'shrink-0 transition-colors duration-200',
                          isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-emerald-500/60" />
                        )}
                        {item.adminOnly && !isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500/80 font-semibold border border-amber-500/10">
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
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* Logout */}
      <div className="p-3 shrink-0">
        <Button
          variant="ghost"
          className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 justify-start gap-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Bottom gradient accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 opacity-60" />
    </div>
  )
}

/* ─── Main Sidebar Component ─── */
export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 h-screen sticky top-0 bg-slate-950 border-r border-slate-900">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-slate-950 border-slate-800">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
