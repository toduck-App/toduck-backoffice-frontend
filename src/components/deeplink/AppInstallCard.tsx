import { APP_STORE_URL } from '@/utils/deeplink'

export function AppInstallCard() {
  const handleAppStoreClick = () => {
    window.location.href = APP_STORE_URL
  }

  return (
    <div className="deeplink-bg relative flex min-h-screen flex-col items-center justify-center px-6 pb-24">
      {/* 로고 */}
      <img
        src="/images/deeplink-logo.png"
        alt="토덕 로고"
        className="mb-8 h-28 w-28 rounded-2xl"
      />

      {/* 제목 */}
      <h1 className="mb-4 text-center text-3xl font-bold text-neutral-900">
        토덕 To.duck
      </h1>
      {/* 구분선 */}
      <div className="mb-4 h-px w-full max-w-xs bg-neutral-200" />
      {/* 설명 */}
      <p className="mb-12 text-center text-lg text-neutral-600">
        성인 ADHD인을 위한 토닥임
      </p>

      {/* App Store 배지 */}
      <button
        onClick={handleAppStoreClick}
        className="transition-opacity hover:opacity-80"
      >
        <img
          src="/images/app-store-badge.svg"
          alt="Download on the App Store"
          className="h-14"
        />
      </button>

      {/* 푸터 */}
      <p className="absolute bottom-8 text-sm text-neutral-400">
        Copyright © 2026 To.duck Team
      </p>
    </div>
  )
}
