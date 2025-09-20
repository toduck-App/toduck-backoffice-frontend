import { useState } from 'react'
import {
  Calendar,
  Users,
  FileX,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Clock,
  Settings2,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { StatisticsType, StatisticsConfig } from '@/types/statistics'

interface StatisticsControlPanelProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  selectedTypes: StatisticsType[]
  onTypesChange: (types: StatisticsType[]) => void
  isLoading?: boolean
}

const STATISTICS_CONFIGS: Record<StatisticsType, StatisticsConfig> = {
  NEW_USERS: {
    type: 'NEW_USERS',
    label: '신규 가입',
    color: '#10B981',
    icon: 'Users',
    description: '일일 신규 가입자 수',
  },
  DELETED_USERS: {
    type: 'DELETED_USERS',
    label: '탈퇴',
    color: '#EF4444',
    icon: 'UserX',
    description: '일일 탈퇴자 수',
  },
  NEW_ROUTINES: {
    type: 'NEW_ROUTINES',
    label: '새 루틴',
    color: '#8B5CF6',
    icon: 'Calendar',
    description: '일일 신규 루틴 생성 수',
  },
  NEW_DIARIES: {
    type: 'NEW_DIARIES',
    label: '새 다이어리',
    color: '#3B82F6',
    icon: 'FileText',
    description: '일일 신규 다이어리 작성 수',
  },
  NEW_SOCIAL_POSTS: {
    type: 'NEW_SOCIAL_POSTS',
    label: '새 소셜 게시글',
    color: '#F59E0B',
    icon: 'MessageSquare',
    description: '일일 신규 소셜 게시글 수',
  },
  NEW_COMMENTS: {
    type: 'NEW_COMMENTS',
    label: '새 댓글',
    color: '#06B6D4',
    icon: 'MessageSquare',
    description: '일일 신규 댓글 수',
  },
  NEW_SCHEDULES: {
    type: 'NEW_SCHEDULES',
    label: '새 스케줄',
    color: '#EC4899',
    icon: 'Clock',
    description: '일일 신규 스케줄 생성 수',
  },
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users':
      return <Users className="h-4 w-4" />
    case 'UserX':
      return <FileX className="h-4 w-4" />
    case 'Calendar':
      return <CalendarIcon className="h-4 w-4" />
    case 'FileText':
      return <FileText className="h-4 w-4" />
    case 'MessageSquare':
      return <MessageSquare className="h-4 w-4" />
    case 'Clock':
      return <Clock className="h-4 w-4" />
    default:
      return <Users className="h-4 w-4" />
  }
}

export function StatisticsControlPanel({
  dateRange,
  onDateRangeChange,
  selectedTypes,
  onTypesChange,
  isLoading = false,
}: StatisticsControlPanelProps) {
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false)

  const handleTypeToggle = (type: StatisticsType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    onTypesChange(newTypes)
  }

  const handleSelectAll = () => {
    onTypesChange(Object.keys(STATISTICS_CONFIGS) as StatisticsType[])
  }

  const handleSelectNone = () => {
    onTypesChange([])
  }

  const handleSelectPreset = (preset: StatisticsType[]) => {
    onTypesChange(preset)
  }

  const presets = {
    core: [
      'NEW_USERS',
      'DELETED_USERS',
      'NEW_DIARIES',
      'NEW_ROUTINES',
    ] as StatisticsType[],
    social: ['NEW_SOCIAL_POSTS', 'NEW_COMMENTS'] as StatisticsType[],
    planning: ['NEW_ROUTINES', 'NEW_SCHEDULES'] as StatisticsType[],
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Selected Metrics */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">필터</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">기간:</span>
            <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">지표:</span>
            <div className="flex flex-wrap gap-1">
              {selectedTypes.length === 0 ? (
                <span className="text-sm text-gray-400">선택된 지표 없음</span>
              ) : (
                selectedTypes.slice(0, 2).map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: STATISTICS_CONFIGS[type].color + '15',
                      color: STATISTICS_CONFIGS[type].color,
                      borderColor: STATISTICS_CONFIGS[type].color + '30',
                    }}
                  >
                    {STATISTICS_CONFIGS[type].label}
                  </Badge>
                ))
              )}
              {selectedTypes.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedTypes.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-2">
          <DropdownMenu open={isTypeMenuOpen} onOpenChange={setIsTypeMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-sm"
              >
                지표 선택
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>통계 지표 선택</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Quick Actions */}
              <div className="p-2 space-y-1">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex-1 h-8"
                  >
                    전체 선택
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectNone}
                    className="flex-1 h-8"
                  >
                    전체 해제
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectPreset(presets.core)}
                    className="flex-1 h-8 text-xs"
                  >
                    핵심 지표
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectPreset(presets.social)}
                    className="flex-1 h-8 text-xs"
                  >
                    소셜 지표
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectPreset(presets.planning)}
                    className="flex-1 h-8 text-xs"
                  >
                    계획 지표
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Individual Type Selection */}
              {Object.values(STATISTICS_CONFIGS).map((config) => (
                <DropdownMenuCheckboxItem
                  key={config.type}
                  checked={selectedTypes.includes(config.type)}
                  onCheckedChange={() => handleTypeToggle(config.type)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div style={{ color: config.color }}>
                      {getIcon(config.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {config.description}
                      </div>
                    </div>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export { STATISTICS_CONFIGS }
