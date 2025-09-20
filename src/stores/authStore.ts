import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, LoginCredentials, AdminUser } from '@/types/auth'
import { authService } from '@/services/auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authService.login(credentials)
          const { accessToken, userId } = response

          // Store token and login timestamp
          localStorage.setItem('authToken', accessToken)
          localStorage.setItem('loginTime', Date.now().toString())

          // Get user info
          const userInfo = await authService.getMyInfo()

          set({
            user: userInfo,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || '로그인에 실패했습니다.',
          })
          throw error
        }
      },

      logout: async () => {
        try {
          // Call logout API if authenticated
          if (get().isAuthenticated) {
            await authService.logout()
          }
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        } finally {
          // Clear local storage and state
          localStorage.removeItem('authToken')
          localStorage.removeItem('loginTime')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('authToken')

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }

        set({ isLoading: true })

        try {
          const userInfo = await authService.getMyInfo()
          set({
            user: userInfo,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('loginTime')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist essential data, not loading states
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)