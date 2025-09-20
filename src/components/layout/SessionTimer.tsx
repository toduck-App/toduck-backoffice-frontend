import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const { logout } = useAuthStore()

  useEffect(() => {
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem('loginTime')

      if (!loginTime) {
        setTimeLeft(0)
        return
      }

      const loginTimestamp = parseInt(loginTime)
      const now = Date.now()
      const elapsed = now - loginTimestamp
      const sessionDuration = 30 * 60 * 1000 // 30분 in milliseconds
      const remaining = sessionDuration - elapsed

      if (remaining <= 0) {
        // Session expired, logout
        logout()
        setTimeLeft(0)
      } else {
        setTimeLeft(Math.floor(remaining / 1000)) // Convert to seconds
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [logout])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (timeLeft <= 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
      </svg>
      <span>세션 만료: {formatTime(timeLeft)}</span>
    </div>
  )
}