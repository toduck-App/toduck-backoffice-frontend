import { ReactNode, useEffect } from 'react'
import { TODUCK_DOMAIN } from '@/utils/deeplink'

interface DomainGuardProps {
  children: ReactNode
  /** 허용할 도메인 ('toduck.app' 또는 'backoffice') */
  allowedDomain: 'toduck.app' | 'backoffice'
}

/**
 * 현재 호스트가 toduck.app인지 확인
 */
function isToduckAppDomain(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  return hostname === TODUCK_DOMAIN || hostname === `www.${TODUCK_DOMAIN}`
}

/**
 * 개발 환경인지 확인 (localhost)
 */
function isLocalDevelopment(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/**
 * 도메인 기반 접근 제어 컴포넌트
 *
 * toduck.app 도메인:
 *   - /_ul/* 경로만 허용
 *   - 그 외 경로는 /_ul로 리다이렉트
 *
 * 백오피스 도메인:
 *   - 백오피스 기능 정상 사용
 *   - /_ul/* 접근 시 toduck.app/_ul/*로 리다이렉트
 */
export function DomainGuard({ children, allowedDomain }: DomainGuardProps) {
  const isToduck = isToduckAppDomain()
  const isLocal = isLocalDevelopment()

  useEffect(() => {
    // 개발 환경에서는 리다이렉트 안함
    if (isLocal) return

    // toduck.app에서 백오피스 경로 접근 시 → /_ul로 리다이렉트
    if (allowedDomain === 'backoffice' && isToduck) {
      window.location.href = `https://${TODUCK_DOMAIN}/_ul`
      return
    }

    // 백오피스 도메인에서 /_ul 접근 시 → 홈으로 리다이렉트 (무시)
    if (allowedDomain === 'toduck.app' && !isToduck) {
      window.location.href = '/'
      return
    }
  }, [allowedDomain, isToduck, isLocal])

  // 개발 환경에서는 모든 접근 허용
  if (isLocal) {
    return <>{children}</>
  }

  // 정상 접근인 경우
  if (
    (allowedDomain === 'toduck.app' && isToduck) ||
    (allowedDomain === 'backoffice' && !isToduck)
  ) {
    return <>{children}</>
  }

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p className="text-neutral-600">이동 중...</p>
      </div>
    </div>
  )
}
