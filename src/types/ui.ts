import { ReactNode } from 'react'

// UI Component Types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface TableState {
  page: number
  pageSize: number
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  filters: Record<string, any>
  searchQuery: string
}

export interface ModalState {
  isOpen: boolean
  type: string | null
  data?: any
}

// UI Store State
export interface UIState {
  // Loading states
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Toast notifications
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Modal states
  modals: Record<string, ModalState>
  openModal: (type: string, data?: any) => void
  closeModal: (type: string) => void
  closeAllModals: () => void

  // Sidebar state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

// Component Props Types
export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export interface LoadingSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

// Form validation error type
export interface FormError {
  field: string
  message: string
}

// Common component variant types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'
export type InputVariant = 'default' | 'error'
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'