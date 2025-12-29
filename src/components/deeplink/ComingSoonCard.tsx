export function ComingSoonCard() {
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

      {/* 준비중 안내 */}
      <div className="rounded-xl bg-neutral-100 px-6 py-4 text-center">
        <p className="text-neutral-500">
          현재 iOS에서만 이용 가능합니다.
          <br />
          다른 플랫폼은 준비 중이에요!
        </p>
      </div>

      {/* 푸터 */}
      <p className="absolute bottom-8 text-sm text-neutral-400">
        Copyright © 2026 To.duck Team
      </p>
    </div>
  )
}
