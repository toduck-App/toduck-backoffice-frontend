// Authentication Types
export interface LoginCredentials {
  loginId: string // 5-20 chars, lowercase+numbers+_-
  password: string // 8+ chars, letters+numbers+special
}

export interface LoginResponse {
  accessToken: string
  userId: number
}

export interface AdminUser {
  nickname: string
}

// Form validation schemas (for use with react-hook-form + zod)
export interface LoginFormData {
  loginId: string
  password: string
}

// Auth Store State
export interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => Promise<void>
}