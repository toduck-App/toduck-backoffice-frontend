import { useState } from 'react'
import {
  Users,
  FileX,
  Calendar as CalendarIcon,
  MessageSquare,
  FileText,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatisticsType } from '@/types/statistics'
import { cn } from '@/lib/utils'

interface SimpleStatisticsFilterProps {
  selectedTypes: StatisticsType[]
  onTypesChange: (types: StatisticsType[]) => void
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

const getIcon = (iconName: string) => {
  const props = { className: "h-3 w-3" }
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

export function SimpleStatisticsFilter({
  selectedTypes,
  onTypesChange,
  isLoading = false,
}: SimpleStatisticsFilterProps) {
  const handleTypeToggle = (type: StatisticsType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    onTypesChange(newTypes)
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      {/* Selected indicators */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-muted-foreground">지표:</span>
        <div className="flex flex-wrap gap-1">
          {selectedTypes.length === 0 ? (
            <span className="text-sm text-muted-foreground">선택된 지표 없음</span>
          ) : (
            selectedTypes.map(type => (
              <Badge
                key={type}
                variant="secondary"
                className="text-xs px-2 py-1 cursor-pointer hover:bg-muted transition-colors"
                style={{
                  borderColor: STATISTICS_CONFIGS[type].color + '40',
                  backgroundColor: STATISTICS_CONFIGS[type].color + '15',
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

      {/* Add/Remove indicators dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="text-sm h-8"
          >
            지표 선택
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(STATISTICS_CONFIGS).map(([type, config]) => (
            <DropdownMenuItem
              key={type}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleTypeToggle(type as StatisticsType)}
            >
              <Checkbox
                checked={selectedTypes.includes(type as StatisticsType)}
                readOnly
              />
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="flex-1">{config.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}