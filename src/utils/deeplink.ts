// 딥링크 유틸리티 함수
// iOS 유니버셜 링크 및 앱 scheme 처리

export const APP_SCHEME = 'toduck://'
export const APP_STORE_URL =
  'https://apps.apple.com/us/app/%ED%86%A0%EB%8D%95-to-duck-%EC%84%B1%EC%9D%B8-adhd%EC%9D%B8%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%A0%EB%8B%A5%EC%9E%84/id6502951629'
export const TODUCK_DOMAIN = 'toduck.app'

// 유효한 딥링크 호스트 목록
export const VALID_HOSTS = [
  'profile',
  'post',
  'createPost',
  'todo',
  'diary',
  'home',
  'notification',
] as const

export type DeepLinkHost = (typeof VALID_HOSTS)[number]

// 딥링크 파라미터 타입
export interface DeepLinkParams {
  host: DeepLinkHost
  queryParams: URLSearchParams
}

/**
 * 디바이스가 iOS인지 확인
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

/**
 * 디바이스가 Android인지 확인 (미래 확장용)
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return /android/.test(userAgent)
}

/**
 * 현재 도메인이 toduck.app인지 확인
 */
export function isToduckDomain(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  return hostname === TODUCK_DOMAIN || hostname === `www.${TODUCK_DOMAIN}`
}

/**
 * URL 경로에서 딥링크 파라미터 추출
 * 예: /_ul/profile?userId=123 -> { host: 'profile', queryParams: URLSearchParams }
 */
export function parseDeepLinkPath(pathname: string, search: string): DeepLinkParams | null {
  // /_ul/ 접두사 제거
  const pathWithoutPrefix = pathname.replace(/^\/_ul\/?/, '')

  if (!pathWithoutPrefix) {
    return null
  }

  // 첫 번째 세그먼트가 host
  const host = pathWithoutPrefix.split('/')[0] as DeepLinkHost

  // 유효한 host인지 확인
  if (!VALID_HOSTS.includes(host)) {
    return null
  }

  const queryParams = new URLSearchParams(search)

  return { host, queryParams }
}

/**
 * 딥링크 파라미터로 앱 scheme URL 생성
 * 예: { host: 'profile', queryParams: 'userId=123' } -> 'toduck://profile?userId=123'
 */
export function buildAppSchemeUrl(params: DeepLinkParams): string {
  const { host, queryParams } = params
  const queryString = queryParams.toString()

  if (queryString) {
    return `${APP_SCHEME}${host}?${queryString}`
  }

  return `${APP_SCHEME}${host}`
}

/**
 * 딥링크 필수 파라미터 검증
 */
export function validateRequiredParams(params: DeepLinkParams): boolean {
  const { host, queryParams } = params

  switch (host) {
    case 'profile':
      return queryParams.has('userId')
    case 'post':
      return queryParams.has('postId')
    default:
      return true
  }
}

/**
 * 앱 열기 시도
 * iframe을 사용하여 custom scheme 호출 (사파리 호환)
 */
export function tryOpenApp(schemeUrl: string): void {
  // iframe 방식으로 앱 스킴 호출 시도
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = schemeUrl
  document.body.appendChild(iframe)

  // 약간의 지연 후 iframe 제거
  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 100)

  // location.href로도 시도 (일부 브라우저 호환성)
  setTimeout(() => {
    window.location.href = schemeUrl
  }, 50)
}

/**
 * App Store 열기
 */
export function openAppStore(): void {
  window.location.href = APP_STORE_URL
}

/**
 * 딥링크 타입별 한글 설명 반환
 */
export function getDeepLinkDescription(host: DeepLinkHost): string {
  const descriptions: Record<DeepLinkHost, string> = {
    profile: '프로필',
    post: '게시글',
    createPost: '게시글 작성',
    todo: 'TODO',
    diary: '다이어리',
    home: '홈',
    notification: '알림',
  }

  return descriptions[host] || '콘텐츠'
}
