import { create } from 'zustand'
import { UIState, ToastMessage, ModalState } from '@/types/ui'

export const useUIStore = create<UIState>((set, get) => ({
  // Global loading state
  globalLoading: false,
  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading })
  },

  // Toast notifications
  toasts: [],
  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  // Modal management
  modals: {},
  openModal: (type: string, data?: any) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [type]: {
          isOpen: true,
          type,
          data,
        },
      },
    }))
  },

  closeModal: (type: string) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [type]: {
          isOpen: false,
          type: null,
          data: null,
        },
      },
    }))
  },

  closeAllModals: () => {
    const { modals } = get()
    const closedModals: Record<string, ModalState> = {}

    Object.keys(modals).forEach((key) => {
      closedModals[key] = {
        isOpen: false,
        type: null,
        data: null,
      }
    })

    set({ modals: closedModals })
  },

  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    }))
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed })
  },
}))

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    useUIStore.getState().addToast({
      type: 'success',
      title,
      message,
    })
  },

  error: (title: string, message?: string) => {
    useUIStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Keep error toasts longer
    })
  },

  warning: (title: string, message?: string) => {
    useUIStore.getState().addToast({
      type: 'warning',
      title,
      message,
    })
  },

  info: (title: string, message?: string) => {
    useUIStore.getState().addToast({
      type: 'info',
      title,
      message,
    })
  },
}