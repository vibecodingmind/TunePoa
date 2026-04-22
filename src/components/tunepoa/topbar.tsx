'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { usePolling } from '@/hooks/use-polling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Globe,
  Loader2,
  X,
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
  'admin-export': 'Data Export',
  settings: 'Settings',
}

/* ─── Search result type ─── */
interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: string
  viewId: string
}

export function Topbar() {
  const { currentUser, currentView, toggleSidebar, navigate, logout, unreadCount, isAdmin: isAdminUser, token } = useAppStore()
  const { locale, setLocale } = useAppStore()

  // Enable real-time polling for notification updates
  usePolling(30000)

  // Check for custom logo
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

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

  // ── Search logic ──
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || !token) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      if (isAdminUser()) {
        // Admin: search users
        const res = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const results: SearchResult[] = (data.users || []).map((u: any) => ({
            id: u.id,
            title: u.name,
            subtitle: u.email,
            type: 'User',
            viewId: 'admin-users',
          }))
          setSearchResults(results)
          setShowSearchResults(true)
        }
      } else {
        // Business owner: search service requests
        const res = await fetch(`/api/service-requests?search=${encodeURIComponent(query)}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const results: SearchResult[] = (data.requests || data.data || []).map((r: any) => ({
            id: r.id,
            title: r.title || r.businessName || r.name || 'Request',
            subtitle: r.status || '',
            type: 'Request',
            viewId: 'my-requests',
          }))
          setSearchResults(results)
          setShowSearchResults(true)
        }
      }
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [token, isAdminUser])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!value.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)
  }, [performSearch])

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close search on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleResultClick = (result: SearchResult) => {
    navigate(result.viewId as any)
    setShowSearchResults(false)
    setSearchQuery('')
  }

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

      {/* Functional Search */}
      <div className="hidden md:flex items-center">
        <div className="relative group" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <Input
            type="search"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchResults(true)
            }}
            className="w-64 h-9 pl-9 pr-8 text-sm bg-white/5 border-white/[0.08] focus:bg-white/[0.08] focus:border-teal-500/40 text-white transition-all duration-200 placeholder:text-slate-500"
          />
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
                setShowSearchResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search results dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/[0.08] shadow-xl glass-dark overflow-hidden z-50">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-sm">
                  No results found
                </div>
              ) : (
                <div className="py-1 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/10 text-slate-400 bg-white/5 shrink-0">
                        {result.type}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors duration-200"
            aria-label="Switch language"
          >
            <Globe className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 mt-1.5 rounded-xl border-white/[0.08] shadow-lg glass-dark">
          <DropdownMenuLabel className="font-normal px-3 py-2 text-xs text-slate-500">
            Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem
            onClick={() => setLocale('en')}
            className={`cursor-pointer rounded-lg mx-1 px-2 text-[13px] hover:bg-white/5 focus:bg-white/5 ${locale === 'en' ? 'text-teal-400 font-medium' : 'text-slate-300'}`}
          >
            <span className="mr-2 text-xs font-semibold w-6">EN</span>
            English
            {locale === 'en' && (
              <span className="ml-auto text-[10px] text-teal-500">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocale('sw')}
            className={`cursor-pointer rounded-lg mx-1 px-2 text-[13px] hover:bg-white/5 focus:bg-white/5 ${locale === 'sw' ? 'text-teal-400 font-medium' : 'text-slate-300'}`}
          >
            <span className="mr-2 text-xs font-semibold w-6">SW</span>
            Kiswahili
            {locale === 'sw' && (
              <span className="ml-auto text-[10px] text-teal-500">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
