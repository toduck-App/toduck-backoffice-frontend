import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AppInstallCard } from '@/components/deeplink/AppInstallCard'
import { ComingSoonCard } from '@/components/deeplink/ComingSoonCard'
import { useDeepLinker } from '@/hooks/useDeepLinker'
import { APP_SCHEME, openAppStore, isIOS } from '@/utils/deeplink'

export default function DeepLinkPage() {
  const location = useLocation()
  const ios = isIOS()
  const hasTriggered = useRef(false)

  const { openUrl } = useDeepLinker({
    onIgnored: () => {
      // 브라우저가 딥링크 무시 (다이얼로그 없음) → 앱스토어로
      openAppStore()
    },
    onFallback: () => {
      // 다이얼로그에서 취소 또는 딥링크 실패 → 앱스토어로
      openAppStore()
    },
    onReturn: () => {
      // 앱에서 돌아옴 → 아무것도 안 함
    },
  })

  useEffect(() => {
    // iOS만 앱 열기 시도
    if (!ios || hasTriggered.current) return
    hasTriggered.current = true

    // /_ul/path?query → toduck://path?query 변환
    const path = location.pathname.replace(/^\/_ul\/?/, '')
    const schemeUrl = `${APP_SCHEME}${path}${location.search}`

    // 딥링크 열기 시도
    openUrl(schemeUrl)
  }, [location.pathname, location.search, ios, openUrl])

  // iOS: 앱 설치 안내
  if (ios) {
    return <AppInstallCard />
  }

  // Android/웹/기타: 준비중
  return <ComingSoonCard />
}
