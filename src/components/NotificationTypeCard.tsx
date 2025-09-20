import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NotificationTypeCardProps {
  title: string
  totalCount: number
  types: {
    label: string
    count: number
    color: string
    icon: React.ReactNode
  }[]
  className?: string
}

export function NotificationTypeCard({
  title,
  totalCount,
  types,
  className,
}: NotificationTypeCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const sortedTypes = [...types].sort((a, b) => b.count - a.count)

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 전체 개수 */}
          <div>
            <p className="text-2xl font-bold">{formatNumber(totalCount)}</p>
            <p className="text-xs text-muted-foreground mt-1">전체 발송 건수</p>
          </div>

          {/* 상위 3개 타입 표시 */}
          <div className="space-y-2">
            {sortedTypes.slice(0, 3).map((type) => {
              const percentage = totalCount > 0 ? ((type.count / totalCount) * 100).toFixed(1) : '0'

              return (
                <div key={type.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div style={{ color: type.color }} className="flex-shrink-0">
                      {type.icon}
                    </div>
                    <span className="text-sm truncate">{type.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0"
                      style={{
                        backgroundColor: type.color + '15',
                        color: type.color,
                        border: `1px solid ${type.color}30`
                      }}
                    >
                      {percentage}%
                    </Badge>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatNumber(type.count)}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* 나머지 타입들 요약 */}
            {sortedTypes.length > 3 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>기타 {sortedTypes.length - 3}개 유형</span>
                  <span className="font-medium">
                    {formatNumber(sortedTypes.slice(3).reduce((sum, type) => sum + type.count, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}