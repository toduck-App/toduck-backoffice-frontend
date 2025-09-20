import React from 'react'
import { useUIStore } from '@/stores/uiStore'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { ToastMessage } from '@/types/ui'

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getToastStyles = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 p-4 min-w-80 max-w-md rounded-lg border shadow-lg
            animate-in slide-in-from-right-full duration-300
            ${getToastStyles(toast.type)}
          `}
        >
          {getToastIcon(toast.type)}
          <div className="flex-1">
            <div className="font-medium">{toast.title}</div>
            {toast.message && (
              <div className="text-sm mt-1 opacity-90">{toast.message}</div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-1 hover:bg-black/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}