import { create } from 'zustand'

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

interface AppState {
  currentUser: User | null
  token: string | null
  currentView: string
  isLoggedIn: boolean
  isSidebarOpen: boolean
  login: (user: User, token: string) => void
  logout: () => void
  navigate: (view: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('tunepoa_token') : null,
  currentView: typeof window !== 'undefined' && localStorage.getItem('tunepoa_token') ? 'dashboard' : 'landing',
  isLoggedIn: typeof window !== 'undefined' ? !!localStorage.getItem('tunepoa_token') : false,
  isSidebarOpen: false,
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tunepoa_token', token)
      localStorage.setItem('tunepoa_user', JSON.stringify(user))
    }
    set({ currentUser: user, token, isLoggedIn: true, currentView: 'dashboard' })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tunepoa_token')
      localStorage.removeItem('tunepoa_user')
    }
    set({ currentUser: null, token: null, isLoggedIn: false, currentView: 'landing', isSidebarOpen: false })
  },
  navigate: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}))

// Initialize from localStorage on client side
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('tunepoa_user')
  const savedToken = localStorage.getItem('tunepoa_token')
  if (savedUser && savedToken) {
    try {
      const user = JSON.parse(savedUser)
      useAppStore.setState({ currentUser: user, token: savedToken, isLoggedIn: true, currentView: 'dashboard' })
    } catch {
      localStorage.removeItem('tunepoa_user')
      localStorage.removeItem('tunepoa_token')
    }
  }
}
