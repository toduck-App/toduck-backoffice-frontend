import { useCallback, useEffect, useRef } from 'react'

export type DeepLinkOptions = {
  onIgnored?: () => void
  onFallback?: () => void
  onReturn?: () => void
  dialogTimeoutMs?: number
}

export type UseDeepLinkerResult = {
  openUrl: (url: string) => void
}

/**
 * 딥링크 처리 훅
 * - onIgnored: 브라우저가 딥링크를 무시함 (다이얼로그 없음)
 * - onFallback: 다이얼로그 닫힘 / 딥링크 실패
 * - onReturn: 네이티브 앱에서 돌아옴
 */
export function useDeepLinker(options: DeepLinkOptions): UseDeepLinkerResult {
  const hasFocusRef = useRef(true)
  const didHideRef = useRef(false)
  const optionsRef = useRef<DeepLinkOptions>(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const onBlur = () => {
      hasFocusRef.current = false
    }

    const onVisibilityChange = (e: Event) => {
      const target = e.target as Document | null
      if (target && target.visibilityState === 'hidden') {
        didHideRef.current = true
      }
    }

    const onFocus = () => {
      const { onFallback, onReturn } = optionsRef.current

      if (didHideRef.current) {
        // 네이티브 앱에서 돌아옴
        if (onReturn) {
          onReturn()
        }
        didHideRef.current = false
      } else {
        // iOS 13.3+ 에서 중복 focus 무시
        if (!hasFocusRef.current && onFallback) {
          window.setTimeout(() => {
            if (!didHideRef.current) {
              onFallback()
            }
          }, 1000)
        }
      }

      hasFocusRef.current = true
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const openUrl = useCallback((url: string) => {
    if (typeof window === 'undefined') return

    const { onIgnored, dialogTimeoutMs = 500 } = optionsRef.current

    // 다이얼로그가 나타나는지 확인
    window.setTimeout(() => {
      if (hasFocusRef.current && onIgnored) {
        onIgnored()
      }
    }, dialogTimeoutMs)

    // 딥링크 트리거
    window.location.href = url
  }, [])

  return { openUrl }
}
