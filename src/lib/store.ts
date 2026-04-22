import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string
  name: string
  email: string
  phone: string
  businessName: string
  businessCategory: string
  role: string
  status: string
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

export type ViewId =
  | 'landing'
  | 'dashboard'
  | 'new-request'
  | 'my-requests'
  | 'packages'
  | 'subscriptions'
  | 'notifications'
  | 'profile'
  | 'audio-library'
  | 'my-invoices'
  | 'admin-dashboard'
  | 'admin-requests'
  | 'admin-subscriptions'
  | 'admin-users'
  | 'admin-packages'
  | 'admin-pricing'
  | 'admin-activity-logs'
  | 'admin-analytics'
  | 'admin-audio'
  | 'admin-invoices'
  | 'settings'

export type AuthMode = 'login' | 'register'

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export interface AppState {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Navigation
  currentView: ViewId

  // UI state
  isSidebarOpen: boolean
  isGlobalLoading: boolean
  authMode: AuthMode
  theme: 'light' | 'dark'

  // Notifications
  unreadCount: number

  // Actions
  setAuth: (user: User, token: string) => void
  logout: () => void
  navigate: (view: ViewId) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setGlobalLoading: (loading: boolean) => void
  setAuthMode: (mode: AuthMode) => void
  setTheme: (theme: 'light' | 'dark') => void

  // Notification actions
  setUnreadCount: (count: number | ((prev: number) => number)) => void
  incrementUnreadCount: () => void

  // Role helpers
  isAdmin: () => boolean
  isBusinessOwner: () => boolean
}

// ---------------------------------------------------------------------------
// Token helpers (client-side)
// ---------------------------------------------------------------------------

interface TokenPayload {
  userId: string
  email: string
  role: string
  name: string
  exp: number
}

const TOKEN_KEY = 'tunepoa_token'
const USER_KEY = 'tunepoa_user'
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Decode a TunePoa token on the client.
 * Format: "tp_<base64url_payload>.<hex_hmac>"
 * The client does NOT verify the HMAC (that happens server-side).
 * It only decodes the payload for role-based routing and expiry checks.
 * Returns null if the token is missing, malformed, or expired (24 h).
 */
function decodeClientToken(token: string): TokenPayload | null {
  try {
    if (!token.startsWith('tp_')) return null
    const rest = token.slice(3)
    const dotIndex = rest.lastIndexOf('.')
    if (dotIndex === -1) return null
    const encoded = rest.slice(0, dotIndex)
    // base64url may use - and _ instead of + and /; replace for atob
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const payload: TokenPayload = JSON.parse(json)
    if (!payload.userId || !payload.email || !payload.role) return null
    if (payload.exp && payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/**
 * Check if a token will expire within the given buffer (default 1 hour).
 * Returns true if token is valid and not about to expire.
 */
export function isTokenFresh(token: string, bufferMs = 60 * 60 * 1000): boolean {
  try {
    if (!token.startsWith('tp_')) return false
    const rest = token.slice(3)
    const dotIndex = rest.lastIndexOf('.')
    if (dotIndex === -1) return false
    const encoded = rest.slice(0, dotIndex)
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const payload: TokenPayload = JSON.parse(json)
    if (!payload.exp) return false
    return payload.exp - Date.now() > bufferMs
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Initial state (hydrates from localStorage on the client)
// ---------------------------------------------------------------------------

function getInitialState(): Pick<
  AppState,
  'user' | 'token' | 'isAuthenticated' | 'currentView'
> {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false, currentView: 'landing' }
  }

  const savedToken = localStorage.getItem(TOKEN_KEY)
  const savedUser = localStorage.getItem(USER_KEY)

  if (savedToken && savedUser) {
    const payload = decodeClientToken(savedToken)
    if (payload) {
      try {
        const user: User = JSON.parse(savedUser)

        // Determine default view based on role
        let defaultView: ViewId = 'dashboard'
        if (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN') {
          defaultView = 'admin-dashboard'
        }

        return { user, token: savedToken, isAuthenticated: true, currentView: defaultView }
      } catch {
        // Corrupted user JSON -- fall through to clear
      }
    }

    // Token expired or invalid -- clear stale data
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { user: null, token: null, isAuthenticated: false, currentView: 'landing' }
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

const hydrated = getInitialState()

export const useStore = create<AppState>((set, get) => ({
  // --- State ---
  user: hydrated.user,
  token: hydrated.token,
  isAuthenticated: hydrated.isAuthenticated,
  currentView: hydrated.currentView,
  isSidebarOpen: false,
  isGlobalLoading: false,
  authMode: 'login',
  theme: 'dark' as const,
  unreadCount: 0,

  // --- Auth actions ---

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }

    // Determine default view based on role
    let defaultView: ViewId = 'dashboard'
    const role = user.role
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      defaultView = 'admin-dashboard'
    }

    set({
      user,
      token,
      isAuthenticated: true,
      currentView: defaultView,
      isSidebarOpen: false,
    })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentView: 'landing',
      isSidebarOpen: false,
      authMode: 'login',
    })
  },

  // --- Navigation ---

  navigate: (view) => {
    set({ currentView: view, isSidebarOpen: false })
  },

  // --- Sidebar ---

  toggleSidebar: () => {
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open })
  },

  // --- Misc ---

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setTheme: () => {
    // Always dark — no-op to prevent accidental light mode
    document.documentElement.classList.add('dark')
  },

  // --- Notification actions ---

  setUnreadCount: (count) => set({ unreadCount: typeof count === 'function' ? count(get().unreadCount) : count }),
  incrementUnreadCount: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  // --- Role helpers ---

  isAdmin: () => {
    const role = get().user?.role
    return (ADMIN_ROLES as readonly string[]).includes(role ?? '')
  },

  isBusinessOwner: () => {
    return get().user?.role === 'BUSINESS_OWNER'
  },
}))

// ---------------------------------------------------------------------------
// Backward-compatible alias
//
// Many existing components import `useAppStore` and access `currentUser`,
// `isLoggedIn`, and `login`. This wrapper maps those names to the canonical
// store properties so we don't need to rewrite every component at once.
// ---------------------------------------------------------------------------

export function useAppStore() {
  const store = useStore()
  return {
    ...store,
    currentUser: store.user,
    isLoggedIn: store.isAuthenticated,
    login: store.setAuth,
  }
}
