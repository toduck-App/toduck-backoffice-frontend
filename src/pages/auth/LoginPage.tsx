import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { isAuthenticated, clearError } = useAuthStore()
  const [showTips, setShowTips] = useState(true)

  useEffect(() => {
    // Clear any previous errors when entering login page
    clearError()

    // Check for privilege error flag and show notification
    const privilegeError = localStorage.getItem('privilegeError')
    if (privilegeError === 'true') {
      localStorage.removeItem('privilegeError')
      showPrivilegeNotification()
    }

    // Check if tips should be hidden for today
    const hideTipsUntil = localStorage.getItem('hideTipsUntil')
    if (hideTipsUntil && new Date().getTime() < parseInt(hideTipsUntil)) {
      setShowTips(false)
    }
  }, [clearError])

  const showPrivilegeNotification = () => {
    const notification = document.createElement('div')
    notification.className =
      'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-2'
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

  const tips = [
    {
      description:
        '토덕 애플리케이션에 회원가입 후 전화번호를 관리자에게 알려주시면 백오피스 권한 승격이 가능해요.',
    },
    {
      description:
        '소셜 로그인 계정(카카오, 애플)으로는 백오피스에 로그인할 수 없어요.',
    },
    {
      description:
        '로그인 후 세션 유지 기간은 30분이에요. 회원가입 및 비밀번호 재설정은 모바일 앱에서 진행해주세요.',
    },
  ]

  const hideTipsForToday = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    localStorage.setItem('hideTipsUntil', tomorrow.getTime().toString())
    setShowTips(false)
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center [background:radial-gradient(ellipse_90%_80%_at_top,_theme(colors.primary.200),_theme(colors.primary.100)_60%,_white_100%)] p-4">
      <div className="w-full max-w-md relative" style={{ width: '400px' }}>
        <LoginForm />

        {/* Info Tooltip */}
        {showTips && (
          <div className="hidden lg:block absolute left-full ml-8 top-0 w-80">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative">
              {/* Tooltip Arrow */}
              <div className="absolute left-0 top-8 transform -translate-x-full">
                <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  이용 안내
                </h3>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* All Tips */}
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hide for today button */}
              <div className="mt-6 text-right">
                <button
                  onClick={hideTipsForToday}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  오늘 하루 보지 않기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">토덕 백오피스 v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
