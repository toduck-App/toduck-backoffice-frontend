// Base API Response Types
export interface ApiResponse<T> {
  code: number
  content: T | null
  message: string | null
}

export interface ErrorResponse {
  code: number // 40000+ range
  content: null
  message: string
}

// API Error Codes
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 40101,
  ACCOUNT_SUSPENDED: 40210,
  USER_NOT_FOUND: 40201,
  CANNOT_SUSPEND_SELF: 40211,
  CANNOT_CANCEL_NOTIFICATION: 40702,
} as const

// Frontend-specific types
export interface TableParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
}

// Environment configuration
export interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
}

export const getApiConfig = (): ApiConfig => {
  const isDevelopment = import.meta.env.MODE === 'development'
  return {
    baseURL: isDevelopment
      ? 'http://localhost:8080'
      : 'https://backoffice-toduck.seol.pro',
    timeout: 10000,
    retries: 3,
  }
}

// API endpoint paths
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/v1/auth/login',
  LOGOUT: '/v1/users/logout',
  MY_PAGE: '/v1/my-page/nickname',

  // User Management
  USERS: '/api/v1/backoffice/users',
  USER_STATISTICS: '/api/v1/backoffice/users/statistics',
  SUSPEND_USER: (id: number) => `/api/v1/backoffice/users/${id}/suspend`,
  UNSUSPEND_USER: (id: number) => `/api/v1/backoffice/users/${id}/unsuspend`,
  DELETION_LOGS: '/api/v1/backoffice/users/deletion-logs',
  DELETION_STATISTICS: '/api/v1/backoffice/users/deletion-logs/statistics',

  // Notifications
  NOTIFICATIONS: '/api/v1/backoffice/broadcast-notifications',
  CANCEL_NOTIFICATION: (id: number) => `/api/v1/backoffice/broadcast-notifications/${id}`,
  NOTIFICATION_STATISTICS: '/api/v1/backoffice/users/notifications/statistics',

  // Statistics
  STATISTICS_OVERALL: '/api/v1/backoffice/statistics/overall',
  STATISTICS_DAILY: '/api/v1/backoffice/statistics/daily',
  STATISTICS_PERIOD: '/api/v1/backoffice/statistics/period',
  STATISTICS_MULTI_DATE: '/api/v1/backoffice/statistics/multi-date',
} as const