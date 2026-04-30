'use client'

import { useStore, useAppStore, type ViewId } from '@/lib/store'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
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
  Bell,
  UserCircle,
  Music,
  ScrollText,
  Headphones,
  Receipt,
  Download,
} from 'lucide-react'

/* ─── Nav Item Type ─── */
interface NavItem {
  id: string
  label: string
  i18nKey: string
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
  { id: 'dashboard', label: 'Dashboard', i18nKey: 'nav.dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'my-requests', label: 'Requests', i18nKey: 'nav.requests', icon: <FileText className="h-[18px] w-[18px]" /> },
  { id: 'subscriptions', label: 'Subscriptions', i18nKey: 'nav.subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" /> },
  { id: 'packages', label: 'Packages', i18nKey: 'nav.packages', icon: <Package className="h-[18px] w-[18px]" /> },
  { id: 'new-request', label: 'New Request', i18nKey: 'nav.newRequest', icon: <PlusCircle className="h-[18px] w-[18px]" /> },
  { id: 'notifications', label: 'Notifications', i18nKey: 'nav.notifications', icon: <Bell className="h-[18px] w-[18px]" /> },
  { id: 'profile', label: 'My Profile', i18nKey: 'nav.profile', icon: <UserCircle className="h-[18px] w-[18px]" /> },
  { id: 'audio-library', label: 'Audio Library', i18nKey: 'nav.audioLibrary', icon: <Music className="h-[18px] w-[18px]" /> },
  { id: 'my-invoices', label: 'Invoices', i18nKey: 'nav.invoices', icon: <FileText className="h-[18px] w-[18px]" /> },
]

const adminNavItems: NavItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', i18nKey: 'nav.admin.dashboard', icon: <BarChart3 className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-requests', label: 'Requests', i18nKey: 'nav.admin.requests', icon: <FileText className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-subscriptions', label: 'Subscriptions', i18nKey: 'nav.admin.subscriptions', icon: <CreditCard className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-users', label: 'Users', i18nKey: 'nav.admin.users', icon: <Users className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-packages', label: 'Packages', i18nKey: 'nav.admin.packages', icon: <Shield className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-pricing', label: 'Pricing', i18nKey: 'nav.admin.pricing', icon: <DollarSign className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-activity-logs', label: 'Activity Logs', i18nKey: 'nav.admin.activityLogs', icon: <ScrollText className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-audio', label: 'Audio Library', i18nKey: 'nav.admin.audio', icon: <Headphones className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-invoices', label: 'Invoices', i18nKey: 'nav.admin.invoices', icon: <Receipt className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-sample-tunes', label: 'RBT Samples', i18nKey: 'nav.admin.sampleTunes', icon: <Music className="h-[18px] w-[18px]" />, adminOnly: true },
  { id: 'admin-export', label: 'Data Export', i18nKey: 'common.export', icon: <Download className="h-[18px] w-[18px]" />, adminOnly: true },
]

const settingsNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', i18nKey: 'nav.settings', icon: <Settings className="h-[18px] w-[18px]" /> },
]

/* ─── Sidebar Content (shared between desktop and mobile) ─── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentUser, currentView, navigate, logout, isAdmin, unreadCount } = useAppStore()
  const { locale } = useStore()

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
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark-36.png" alt="TunePoa" width={36} height={36} className="rounded-lg shadow-md" />
          <div>
            <span className="font-bold text-base text-white tracking-tight">TunePoa</span>
            <p className="text-[10px] text-slate-500 leading-none -mt-0.5">Ringback Platform</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-slate-200 hover:bg-white/5"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

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
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = currentView === item.id
                    const displayLabel = t(item.i18nKey, locale as Locale)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 text-left group',
                          isActive
                            ? 'bg-teal-500/15 text-teal-400 font-medium border border-teal-500/20 shadow-sm shadow-teal-500/5'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        )}
                      >
                        <span className={cn(
                          'shrink-0 transition-colors duration-200',
                          isActive
                            ? 'text-teal-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{displayLabel}</span>
                        {item.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto mr-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-teal-500/60" />
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
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Sign out */}
      <div className="p-3 shrink-0">
        <Button
          variant="ghost"
          className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 justify-start gap-2.5 rounded-xl text-[13px] font-medium transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {t('nav.signOut', locale as Locale)}
        </Button>
      </div>

      {/* Bottom brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 opacity-50" />
    </div>
  )
}

/* ─── Main Sidebar Component ─── */
export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useStore()

  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 h-screen sticky top-0 glass-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar - Sheet overlay */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 glass-sidebar border-none">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
