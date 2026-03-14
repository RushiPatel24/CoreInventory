import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: ({ user, token }) => set({ user, token }),

      logout: () => {
        set({ user: null, token: null })
      },

      isAuthenticated: () => !!get().token,
      isManager: () => get().user?.role === 'manager',
    }),
    {
      name: 'coreinventory-auth',
    }
  )
)

export default useAuthStore
