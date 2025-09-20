import * as React from "react"
import { useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  time?: string // "HH:mm" format
  onTimeChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  time = "09:00",
  onTimeChange,
  placeholder = "시간을 선택하세요",
  className,
  disabled,
}: TimePickerProps) {
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedHour, setSelectedHour] = useState(time.split(':')[0] || '09')
  const [selectedMinute, setSelectedMinute] = useState(time.split(':')[1] || '00')

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  const handleTimeSelect = () => {
    const newTime = `${selectedHour}:${selectedMinute}`
    onTimeChange?.(newTime)
    setShowTimePicker(false)
  }

  const displayTime = time || `${selectedHour}:${selectedMinute}`

  return (
    <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-3 space-y-3">
          <h4 className="font-medium text-sm">시간 선택</h4>

          <div className="grid grid-cols-2 gap-3">
            {/* 시간 선택 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">시간</label>
              <div
                className="h-24 overflow-y-scroll border rounded-md"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                <div className="flex flex-col min-h-full">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setSelectedHour(hour)}
                      className={cn(
                        "w-full px-2 py-1.5 text-xs text-center hover:bg-gray-100 transition-colors flex-shrink-0 border-0 bg-transparent",
                        selectedHour === hour && "bg-primary-500 text-white hover:bg-primary-600"
                      )}
                    >
                      {hour}시
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 분 선택 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">분</label>
              <div
                className="h-24 overflow-y-scroll border rounded-md"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                <div className="flex flex-col min-h-full">
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => setSelectedMinute(minute)}
                      className={cn(
                        "w-full px-2 py-1.5 text-xs text-center hover:bg-gray-100 transition-colors flex-shrink-0 border-0 bg-transparent",
                        selectedMinute === minute && "bg-primary-500 text-white hover:bg-primary-600"
                      )}
                    >
                      {minute}분
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimePicker(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleTimeSelect}
            >
              선택
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}