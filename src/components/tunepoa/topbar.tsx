'use client'

import { useEffect } from 'react'
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
  Sun,
  Moon,
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
  const { currentUser, currentView, toggleSidebar, navigate, logout, theme, setTheme } = useAppStore()

  const pageTitle = viewTitles[currentView] || 'Dashboard'
  const userInitials = currentUser?.name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const isDark = theme === 'dark'

  // Sync theme class on document
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('tunepoa_theme', theme)
    } catch {}
  }, [theme, isDark])

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 gap-3 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search placeholder */}
      <div className="hidden md:flex items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-tp-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-64 h-9 pl-9 pr-4 text-sm bg-slate-100/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 focus:border-tp-300 dark:focus:border-tp-600 text-slate-900 dark:text-white transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            readOnly
          />
        </div>
      </div>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-300"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-tp-500 ring-2 ring-white dark:ring-slate-900" />
      </Button>

      {/* Separator */}
      <div className="hidden sm:block h-6 w-px bg-slate-200/80 dark:bg-slate-700/60" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-xl transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-tp-500 to-ts-400 text-white flex items-center justify-center text-xs font-semibold shadow-sm shadow-tp-500/20">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block leading-tight max-w-[120px] truncate">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block leading-tight capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1.5 rounded-xl border-slate-200/80 dark:border-slate-700/60 shadow-lg bg-white dark:bg-slate-800">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700/60" />
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px] text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700/60"
          >
            <UserIcon className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('settings')}
            className="cursor-pointer rounded-lg mx-1 px-2 text-[13px] text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700/60"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700/60" />
          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg mx-1 px-2 text-[13px] focus:bg-red-50 dark:focus:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
