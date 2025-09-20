import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  disabledDays?: (date: Date) => boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "날짜를 선택하세요",
  className,
  disabled,
  disabledDays,
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(date || new Date())

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

  const handleDateSelect = (day: Date) => {
    onDateChange?.(day)
    setShowCalendar(false)
  }

  const days = getDaysInMonth(currentMonth)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy년 MM월 dd일", { locale: ko }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-xs text-center font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />
              }
              const isDisabled = disabledDays ? disabledDays(day) : false
              const isSelected = date && day.toDateString() === date.toDateString()
              const isToday = day.toDateString() === new Date().toDateString()

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    "p-2 text-sm rounded hover:bg-gray-100 transition-colors",
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
      </PopoverContent>
    </Popover>
  )
}