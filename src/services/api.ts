import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse, ErrorResponse, getApiConfig } from '@/types/api'

class ApiClient {
  private client: AxiosInstance
  private privilegeErrorHandled: boolean = false

  constructor() {
    const config = getApiConfig()

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        // Check if response has the expected API format
        if (response.data && typeof response.data.code === 'number') {
          // Success codes are in 20000 range
          if (response.data.code >= 20000 && response.data.code < 30000) {
            return response
          } else {
            // API returned error in success response
            return Promise.reject(new ApiError(response.data.message || 'API Error', response.data.code))
          }
        }
        return response
      },
      (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Clear auth token on 401
          localStorage.removeItem('authToken')
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }

        const message = error.response?.data?.message || error.message || 'Network error'
        const code = error.response?.data?.code || error.response?.status || 0

        // Handle insufficient privilege error (40102)
        if (code === 40102 && !this.privilegeErrorHandled) {
          this.privilegeErrorHandled = true
          this.handlePrivilegeError()
        }

        return Promise.reject(new ApiError(message, code))
      }
    )
  }

  // Generic GET request
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
    return response.data.content as T
  }

  // Generic POST request
  async post<T, D = any>(url: string, data?: D): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data)
    return response.data.content as T
  }

  // Generic PUT request
  async put<T, D = any>(url: string, data?: D): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data)
    return response.data.content as T
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url)
    return response.data.content as T
  }

  // Handle privilege error (40102)
  private handlePrivilegeError() {
    // Store privilege error flag for login page to show notification
    localStorage.setItem('privilegeError', 'true')

    // Immediately logout and redirect to login
    this.logoutUser()
  }

  // Show privilege notification
  private showPrivilegeNotification() {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-2'
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      <span>관리자 권한이 필요합니다. 관리자 승격을 요청해주세요.</span>
    `

    document.body.appendChild(notification)

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  // Logout user by clearing auth and redirecting
  private logoutUser() {
    localStorage.removeItem('authToken')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  // Raw axios client for special cases
  getClient(): AxiosInstance {
    return this.client
  }
}

// Custom API Error class
export class ApiError extends Error {
  public code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient