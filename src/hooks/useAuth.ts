import { useAuthStore } from '@/stores/authStore'
import { LoginCredentials } from '@/types/auth'

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  } = useAuthStore()

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '로그인에 실패했습니다.'
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '로그아웃에 실패했습니다.'
      }
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,

    // Helper computed values
    isAdmin: isAuthenticated, // For now, all authenticated users are admins
    userName: user?.nickname || '관리자',
  }
}