import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  fullName: string
  email?: string
  role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'pharmacist'
  createdBy?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        try {
          const user = await window.api.users.authenticate(username, password)
          if (user) {
            set({ user, isAuthenticated: true })
            await window.api.auditLogs.create({
              userId: user.id,
              action: 'login',
              entityType: 'user',
              entityId: user.id
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
