import React from 'react'
import { Badge } from '@/components/ui/badge'

interface AppleVersionCardProps {
  latestVersion: string
  totalVersions: number
}

export function AppleVersionCard({ latestVersion, totalVersions }: AppleVersionCardProps) {
  const handleClick = () => {
    window.open('https://apps.apple.com/us/app/%ED%86%A0%EB%8D%95-to-duck-%EC%84%B1%EC%9D%B8-adhd%EC%9D%B8%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%A0%EB%8B%A5%EC%9E%84/id6502951629', '_blank')
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer"
        style={{ backgroundColor: '#1d1d1f' }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          {/* 애플 로고 위치 - 여기에 이미지를 넣으세요 */}
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/images/apple-logo.png"
              alt="Apple"
              className="w-14 h-14 object-contain brightness-0 invert"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">iOS 최신 버전</h3>
              <Badge className="bg-white bg-opacity-10 text-white border-white border-opacity-20 text-xs">
                서비스 중
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-1">
              {latestVersion || '-'}
            </div>
            <p className="text-sm text-white text-opacity-70">
              총 {totalVersions}개 버전
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}