'use client'

import { useAppStore } from '@/lib/store'
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
  'admin-mno': 'MNO Providers',
  settings: 'Settings',
}

export function Topbar() {
  const { currentUser, currentView, toggleSidebar, navigate, logout } = useAppStore()

  const pageTitle = viewTitles[currentView] || 'Dashboard'
  const userInitials = currentUser?.name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 gap-3 shrink-0 glass-strong border-b border-slate-200/60">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="font-semibold text-slate-900 text-[15px] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search placeholder */}
      <div className="hidden md:flex items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-64 h-9 pl-9 pr-4 text-sm bg-slate-100/60 border-slate-200/80 focus:bg-white focus:border-emerald-300 transition-all duration-200 placeholder:text-slate-400"
            readOnly
          />
        </div>
      </div>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {/* Notification dot */}
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
      </Button>

      {/* Separator */}
      <div className="hidden sm:block h-6 w-px bg-slate-200/80" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2 hover:bg-slate-100/60 rounded-xl transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center text-xs font-semibold shadow-sm shadow-emerald-500/20">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-slate-700 block leading-tight max-w-[120px] truncate">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1.5 rounded-xl border-slate-200/80 shadow-lg">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-slate-900">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px]"
          >
            <UserIcon className="mr-2 h-4 w-4 text-slate-400" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px]"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg mx-1 px-2 text-[13px]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
