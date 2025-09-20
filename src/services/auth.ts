import { apiClient } from './api'
import { API_ENDPOINTS } from '@/types/api'
import { LoginCredentials, LoginResponse, AdminUser } from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials)
  }

  async logout(): Promise<void> {
    return apiClient.get<void>(API_ENDPOINTS.LOGOUT)
  }

  async getMyInfo(): Promise<AdminUser> {
    return apiClient.get<AdminUser>(API_ENDPOINTS.MY_PAGE)
  }
}

export const authService = new AuthService()
export default authService