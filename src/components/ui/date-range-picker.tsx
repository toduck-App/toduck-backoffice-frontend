import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DateRange {
  startDate: string
  endDate: string
  label?: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const PRESET_RANGES = [
  {
    label: '오늘',
    getValue: () => {
      const today = new Date()
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: '오늘',
      }
    },
  },
  {
    label: '어제',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
        label: '어제',
      }
    },
  },
  {
    label: '최근 7일',
    getValue: () => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 6)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: '최근 7일',
      }
    },
  },
  {
    label: '최근 30일',
    getValue: () => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 29)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: '최근 30일',
      }
    },
  },
  {
    label: '최근 3개월',
    getValue: () => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 3)
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        label: '최근 3개월',
      }
    },
  },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    value.startDate ? new Date(value.startDate) : undefined
  )
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    value.endDate ? new Date(value.endDate) : undefined
  )
  const [startMonth, setStartMonth] = useState(new Date())
  const [endMonth, setEndMonth] = useState(new Date())

  const formatDateRange = (range: DateRange) => {
    if (range.label) {
      return range.label
    }

    const startDate = new Date(range.startDate)
    const endDate = new Date(range.endDate)

    if (range.startDate === range.endDate) {
      return startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    return `${startDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })}`
  }

  const handlePresetSelect = (preset: typeof PRESET_RANGES[0]) => {
    onChange(preset.getValue())
  }

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onChange({
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0],
      })
      setIsCustomOpen(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {PRESET_RANGES.map((preset) => (
            <DropdownMenuItem key={preset.label} onClick={() => handlePresetSelect(preset)}>
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onSelect={() => setIsCustomOpen(true)}>
            커스텀 기간
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <div></div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-4 space-y-4">
            <h4 className="font-medium">커스텀 기간 선택</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setStartMonth(new Date(startMonth.getFullYear(), startMonth.getMonth() - 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-medium text-sm">
                      {startMonth.getFullYear()}년 {startMonth.getMonth() + 1}월
                    </span>
                    <button
                      type="button"
                      onClick={() => setStartMonth(new Date(startMonth.getFullYear(), startMonth.getMonth() + 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="text-xs text-center font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(startMonth).map((day, index) => {
                      if (!day) {
                        return <div key={`empty-start-${index}`} />
                      }
                      const today = new Date()
                      today.setHours(23, 59, 59, 999)
                      const isDisabled = day > today || (customEndDate && day > customEndDate)
                      const isSelected = customStartDate && day.toDateString() === customStartDate.toDateString()
                      const isToday = day.toDateString() === new Date().toDateString()

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() => !isDisabled && setCustomStartDate(day)}
                          disabled={isDisabled}
                          className={cn(
                            "p-1.5 text-xs rounded hover:bg-gray-100 transition-colors",
                            isDisabled && "text-gray-300 cursor-not-allowed hover:bg-transparent",
                            isSelected && "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
                            isToday && !isSelected && "font-bold text-primary-500 bg-primary-50"
                          )}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              {customStartDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">종료일</label>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={() => setEndMonth(new Date(endMonth.getFullYear(), endMonth.getMonth() - 1))}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="font-medium text-sm">
                        {endMonth.getFullYear()}년 {endMonth.getMonth() + 1}월
                      </span>
                      <button
                        type="button"
                        onClick={() => setEndMonth(new Date(endMonth.getFullYear(), endMonth.getMonth() + 1))}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-xs text-center font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(endMonth).map((day, index) => {
                        if (!day) {
                          return <div key={`empty-end-${index}`} />
                        }
                        const today = new Date()
                        today.setHours(23, 59, 59, 999)
                        const isDisabled = day > today || day < customStartDate!
                        const isSelected = customEndDate && day.toDateString() === customEndDate.toDateString()
                        const isToday = day.toDateString() === new Date().toDateString()

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => !isDisabled && setCustomEndDate(day)}
                            disabled={isDisabled}
                            className={cn(
                              "p-1.5 text-xs rounded hover:bg-gray-100 transition-colors",
                              isDisabled && "text-gray-300 cursor-not-allowed hover:bg-transparent",
                              isSelected && "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
                              isToday && !isSelected && "font-bold text-primary-500 bg-primary-50"
                            )}
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => {
                setIsCustomOpen(false)
                setCustomStartDate(value.startDate ? new Date(value.startDate) : undefined)
                setCustomEndDate(value.endDate ? new Date(value.endDate) : undefined)
              }}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!customStartDate || !customEndDate}
              >
                적용
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}