'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { usePolling } from '@/hooks/use-polling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react'

/* ─── View title map ─── */
const viewTitles: Record<string, string> = {
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
  'admin-pricing': 'Pricing',
  settings: 'Settings',
}

export function Topbar() {
  const { currentUser, currentView, toggleSidebar, navigate, logout, unreadCount, isAdmin: isAdminUser } = useAppStore()

  // Enable real-time polling for notification updates
  usePolling(30000)

  // Check for custom logo
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check if a custom logo exists
    const checkLogo = async () => {
      try {
        const res = await fetch('/uploads/logo.png', { method: 'HEAD' })
        if (res.ok) {
          setCustomLogoUrl('/uploads/logo.png')
        }
      } catch {
        // Default logo will be used
      }
    }
    checkLogo()
  }, [])

  const pageTitle = viewTitles[currentView] || 'Dashboard'
  const userInitials = currentUser?.name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 gap-3 shrink-0 glass-nav transition-colors duration-300">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-400 hover:text-slate-200 hover:bg-white/5"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Custom or default logo (visible on md+) */}
      {customLogoUrl && (
        <div className="hidden md:flex items-center">
          <img
            src={customLogoUrl}
            alt="TunePoa"
            className="h-7 w-7 rounded-md object-contain"
          />
        </div>
      )}

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="font-semibold text-white text-[15px] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search placeholder */}
      <div className="hidden md:flex items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-64 h-9 pl-9 pr-4 text-sm bg-white/5 border-white/[0.08] focus:bg-white/[0.08] focus:border-teal-500/40 text-white transition-all duration-200 placeholder:text-slate-500"
            readOnly
          />
        </div>
      </div>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-tp-500 text-[10px] font-bold text-white ring-2 ring-[#0a1628] animate-fade-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-tp-500 ring-2 ring-[#0a1628]" />
        )}
      </Button>

      {/* Separator */}
      <div className="hidden sm:block h-6 w-px bg-white/[0.08]" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2 hover:bg-white/5 rounded-xl transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-tp-500 to-ts-400 text-white flex items-center justify-center text-xs font-semibold shadow-sm shadow-tp-500/20">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-slate-200 block leading-tight max-w-[120px] truncate">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1.5 rounded-xl border-white/[0.08] shadow-lg glass-dark">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px] text-slate-300 hover:bg-white/5 focus:bg-white/5"
          >
            <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px] text-slate-300 hover:bg-white/5 focus:bg-white/5"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-red-400 focus:text-red-400 rounded-lg mx-1 px-2 text-[13px] focus:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
