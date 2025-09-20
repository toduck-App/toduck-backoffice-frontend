import { useState } from 'react'
import {
  Users,
  FileX,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Clock,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatisticsType } from '@/types/statistics'
import { cn } from '@/lib/utils'

interface ModernStatisticsFilterProps {
  selectedTypes: StatisticsType[]
  onTypesChange: (types: StatisticsType[]) => void
  timeRange: string
  onTimeRangeChange: (range: string) => void
  isLoading?: boolean
}

const STATISTICS_CONFIGS: Record<StatisticsType, { label: string; color: string; icon: string }> = {
  NEW_USERS: { label: '신규 가입', color: '#10B981', icon: 'Users' },
  DELETED_USERS: { label: '탈퇴', color: '#EF4444', icon: 'UserX' },
  NEW_ROUTINES: { label: '새 루틴', color: '#8B5CF6', icon: 'Calendar' },
  NEW_DIARIES: { label: '새 다이어리', color: '#3B82F6', icon: 'FileText' },
  NEW_SOCIAL_POSTS: { label: '새 소셜 게시글', color: '#F59E0B', icon: 'MessageSquare' },
  NEW_COMMENTS: { label: '새 댓글', color: '#06B6D4', icon: 'MessageSquare' },
  NEW_SCHEDULES: { label: '새 스케줄', color: '#EC4899', icon: 'Clock' },
}

const TIME_RANGES = [
  { value: "7d", label: "최근 1주일" },
  { value: "14d", label: "최근 2주일" },
  { value: "30d", label: "최근 한달" },
]

const getIcon = (iconName: string) => {
  const props = { className: "h-3.5 w-3.5" }
  switch (iconName) {
    case 'Users': return <Users {...props} />
    case 'UserX': return <FileX {...props} />
    case 'Calendar': return <CalendarIcon {...props} />
    case 'FileText': return <FileText {...props} />
    case 'MessageSquare': return <MessageSquare {...props} />
    case 'Clock': return <Clock {...props} />
    default: return <Users {...props} />
  }
}

export function ModernStatisticsFilter({
  selectedTypes,
  onTypesChange,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: ModernStatisticsFilterProps) {
  const handleTypeToggle = (type: StatisticsType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    onTypesChange(newTypes)
  }

  const handleRemoveType = (type: StatisticsType) => {
    onTypesChange(selectedTypes.filter(t => t !== type))
  }

  const handleSelectAll = () => {
    onTypesChange(Object.keys(STATISTICS_CONFIGS) as StatisticsType[])
  }

  const handleClearAll = () => {
    onTypesChange([])
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">분석 필터</h3>
            <p className="text-sm text-gray-500">차트에 표시할 지표와 기간을 선택하세요</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">기간:</span>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Indicators */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">선택된 지표</span>
            <Badge variant="outline" className="text-xs">
              {selectedTypes.length}개
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading}
              className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              전체 선택
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || selectedTypes.length === 0}
              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              전체 해제
            </Button>
          </div>
        </div>

        <div className="min-h-[60px] p-4 bg-white rounded-lg border border-gray-200">
          {selectedTypes.length === 0 ? (
            <div className="flex items-center justify-center h-12">
              <p className="text-sm text-gray-400">선택된 지표가 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map(type => (
                <Badge
                  key={type}
                  variant="secondary"
                  className={cn(
                    "text-xs px-3 py-1.5 cursor-pointer transition-all duration-200",
                    "hover:shadow-md border-2 group relative"
                  )}
                  style={{
                    borderColor: STATISTICS_CONFIGS[type].color + '30',
                    backgroundColor: STATISTICS_CONFIGS[type].color + '10',
                    color: STATISTICS_CONFIGS[type].color,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    {getIcon(STATISTICS_CONFIGS[type].icon)}
                    <span className="font-medium">{STATISTICS_CONFIGS[type].label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-red-100 rounded-full opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveType(type)
                      }}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Indicators */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">지표 추가</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="h-9 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 text-gray-600 hover:text-blue-600 transition-all duration-200"
            >
              <span className="mr-2">지표 선택</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              사용 가능한 지표
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {Object.entries(STATISTICS_CONFIGS).map(([type, config]) => {
              const isSelected = selectedTypes.includes(type as StatisticsType)
              return (
                <DropdownMenuItem
                  key={type}
                  className={cn(
                    "flex items-center space-x-3 cursor-pointer p-3",
                    isSelected && "bg-blue-50"
                  )}
                  onClick={() => handleTypeToggle(type as StatisticsType)}
                >
                  <Checkbox
                    checked={isSelected}
                    readOnly
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <div className="text-white">
                      {getIcon(config.icon)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{config.label}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {type === 'NEW_USERS' && '일일 신규 가입자 수'}
                      {type === 'DELETED_USERS' && '일일 탈퇴자 수'}
                      {type === 'NEW_DIARIES' && '일일 신규 다이어리 작성 수'}
                      {type === 'NEW_ROUTINES' && '일일 신규 루틴 생성 수'}
                      {type === 'NEW_SOCIAL_POSTS' && '일일 신규 소셜 게시글 수'}
                      {type === 'NEW_COMMENTS' && '일일 신규 댓글 수'}
                      {type === 'NEW_SCHEDULES' && '일일 신규 스케줄 생성 수'}
                    </p>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}