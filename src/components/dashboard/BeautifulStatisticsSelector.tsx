import { useState } from 'react'
import {
  Users,
  FileX,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Clock,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatisticsType, StatisticsConfig } from '@/types/statistics'
import { cn } from '@/lib/utils'

interface BeautifulStatisticsSelectorProps {
  selectedTypes: StatisticsType[]
  onTypesChange: (types: StatisticsType[]) => void
  isLoading?: boolean
}

const STATISTICS_CONFIGS: Record<StatisticsType, StatisticsConfig & { gradient: string }> = {
  NEW_USERS: {
    type: 'NEW_USERS',
    label: '신규 가입',
    color: '#10B981',
    icon: 'Users',
    description: '일일 신규 가입자 수',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  DELETED_USERS: {
    type: 'DELETED_USERS',
    label: '탈퇴',
    color: '#EF4444',
    icon: 'UserX',
    description: '일일 탈퇴자 수',
    gradient: 'from-red-500 to-red-600',
  },
  NEW_ROUTINES: {
    type: 'NEW_ROUTINES',
    label: '새 루틴',
    color: '#8B5CF6',
    icon: 'Calendar',
    description: '일일 신규 루틴 생성 수',
    gradient: 'from-violet-500 to-violet-600',
  },
  NEW_DIARIES: {
    type: 'NEW_DIARIES',
    label: '새 다이어리',
    color: '#3B82F6',
    icon: 'FileText',
    description: '일일 신규 다이어리 작성 수',
    gradient: 'from-blue-500 to-blue-600',
  },
  NEW_SOCIAL_POSTS: {
    type: 'NEW_SOCIAL_POSTS',
    label: '새 소셜 게시글',
    color: '#F59E0B',
    icon: 'MessageSquare',
    description: '일일 신규 소셜 게시글 수',
    gradient: 'from-amber-500 to-amber-600',
  },
  NEW_COMMENTS: {
    type: 'NEW_COMMENTS',
    label: '새 댓글',
    color: '#06B6D4',
    icon: 'MessageSquare',
    description: '일일 신규 댓글 수',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  NEW_SCHEDULES: {
    type: 'NEW_SCHEDULES',
    label: '새 스케줄',
    color: '#EC4899',
    icon: 'Clock',
    description: '일일 신규 스케줄 생성 수',
    gradient: 'from-pink-500 to-pink-600',
  },
}

const getIcon = (iconName: string) => {
  const iconProps = { className: "h-4 w-4" }
  switch (iconName) {
    case 'Users': return <Users {...iconProps} />
    case 'UserX': return <FileX {...iconProps} />
    case 'Calendar': return <CalendarIcon {...iconProps} />
    case 'FileText': return <FileText {...iconProps} />
    case 'MessageSquare': return <MessageSquare {...iconProps} />
    case 'Clock': return <Clock {...iconProps} />
    default: return <Users {...iconProps} />
  }
}

const PRESETS = {
  core: {
    name: '핵심 지표',
    description: '주요 서비스 지표',
    types: ['NEW_USERS', 'DELETED_USERS', 'NEW_DIARIES', 'NEW_ROUTINES'] as StatisticsType[],
    gradient: 'from-blue-500 to-purple-600',
  },
  social: {
    name: '소셜 지표',
    description: '커뮤니티 활동',
    types: ['NEW_SOCIAL_POSTS', 'NEW_COMMENTS'] as StatisticsType[],
    gradient: 'from-pink-500 to-rose-600',
  },
  planning: {
    name: '계획 지표',
    description: '일정 관리',
    types: ['NEW_ROUTINES', 'NEW_SCHEDULES'] as StatisticsType[],
    gradient: 'from-green-500 to-teal-600',
  },
}

export function BeautifulStatisticsSelector({
  selectedTypes,
  onTypesChange,
  isLoading = false,
}: BeautifulStatisticsSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  const handleTypeToggle = (type: StatisticsType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    onTypesChange(newTypes)
  }

  const handlePresetSelect = (presetTypes: StatisticsType[]) => {
    onTypesChange(presetTypes)
  }

  const handleSelectAll = () => {
    onTypesChange(Object.keys(STATISTICS_CONFIGS) as StatisticsType[])
  }

  const handleSelectNone = () => {
    onTypesChange([])
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">분석 지표 선택</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              차트에 표시할 지표를 선택하세요
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              전체 선택
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              전체 해제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected indicators summary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium">선택된 지표</h4>
            <Badge variant="secondary" className="text-xs">
              {selectedTypes.length}개
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">선택된 지표가 없습니다</p>
            ) : (
              selectedTypes.map(type => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors"
                  style={{
                    borderColor: STATISTICS_CONFIGS[type].color + '40',
                    backgroundColor: STATISTICS_CONFIGS[type].color + '10',
                    color: STATISTICS_CONFIGS[type].color,
                  }}
                  onClick={() => handleTypeToggle(type)}
                >
                  <span className="mr-1">{getIcon(STATISTICS_CONFIGS[type].icon)}</span>
                  {STATISTICS_CONFIGS[type].label}
                  <span className="ml-1 opacity-60">×</span>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <h4 className="text-sm font-medium mb-3">빠른 선택</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Card
                key={key}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                  selectedTypes.length > 0 &&
                  preset.types.every(type => selectedTypes.includes(type)) &&
                  selectedTypes.length === preset.types.length
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handlePresetSelect(preset.types)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{preset.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.types.map(type => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: STATISTICS_CONFIGS[type].color + '20',
                              color: STATISTICS_CONFIGS[type].color,
                            }}
                          >
                            {getIcon(STATISTICS_CONFIGS[type].icon)}
                            <span className="hidden sm:inline">{STATISTICS_CONFIGS[type].label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Individual selections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">개별 지표</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="h-8 text-xs"
            >
              {showAll ? '간단히 보기' : '전체 보기'}
            </Button>
          </div>
          <div className={cn(
            "grid gap-3 transition-all duration-300",
            showAll ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
          )}>
            {Object.values(STATISTICS_CONFIGS).map(config => (
              <Card
                key={config.type}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-2 group",
                  selectedTypes.includes(config.type)
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handleTypeToggle(config.type)}
              >
                <CardContent className={cn(
                  "p-3 relative",
                  showAll ? "space-y-2" : "text-center"
                )}>
                  {selectedTypes.includes(config.type) && (
                    <div className="absolute top-2 right-2">
                      <div
                        className="h-4 w-4 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "flex items-center gap-2",
                    showAll ? "" : "flex-col"
                  )}>
                    <div
                      className={cn(
                        "p-2 rounded-lg text-white transition-all duration-200",
                        selectedTypes.includes(config.type) ? "shadow-lg" : "group-hover:shadow-md"
                      )}
                      style={{ backgroundColor: config.color }}
                    >
                      {getIcon(config.icon)}
                    </div>
                    <div className={cn("flex-1", showAll ? "text-left" : "text-center")}>
                      <h5 className={cn(
                        "font-medium",
                        showAll ? "text-sm" : "text-xs leading-tight"
                      )}>
                        {config.label}
                      </h5>
                      {showAll && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}