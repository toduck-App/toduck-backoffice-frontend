import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Label } from './ui/label'
import { TimePicker } from './ui/time-picker'
import { MentionTextarea, MentionInput } from './ui/mention-textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  BroadcastNotificationCreateRequest,
  ACTION_URL_OPTIONS,
} from '@/types/notification'
import {
  Clock,
  Send,
  AlertCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 배경 이미지 경로: /public/images/notification-bg.png
const NOTIFICATION_BG_PATH = '/images/notification-bg.png'

const notificationSchema = z
  .object({
    title: z
      .string()
      .min(1, '제목을 입력해주세요')
      .max(100, '제목은 100자 이하로 입력해주세요'),
    message: z
      .string()
      .min(1, '내용을 입력해주세요')
      .max(500, '내용은 500자 이하로 입력해주세요'),
    actionUrl: z.string().min(1, '이동 화면을 선택해주세요'),
    isScheduled: z.boolean(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isScheduled) return true
      if (!data.scheduledDate || !data.scheduledTime) return false

      const scheduledDateTime = new Date(
        `${data.scheduledDate}T${data.scheduledTime}:00`
      )
      return scheduledDateTime > new Date()
    },
    {
      message: '예약 시간은 현재 시간 이후여야 합니다',
      path: ['scheduledTime'],
    }
  )

type NotificationFormData = z.infer<typeof notificationSchema>

interface NotificationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BroadcastNotificationCreateRequest) => Promise<void>
}

// {@Username} 태그를 예시 닉네임으로 치환
function renderTextPreview(text: string, fallback: string): string {
  if (!text) return fallback
  return text.replace(/\{@Username\}/g, '용감한오리777')
}

// 날짜 선택 컴포넌트
function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return ''
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day)
    onDateChange(formatDateDisplay(day))
    setShowCalendar(false)
  }

  const days = getDaysInMonth(currentMonth)
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-4">
      {/* 날짜 선택 */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium">
          날짜 선택
        </Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 text-left border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
              <span className={cn(!selectedDate && 'text-gray-400')}>
                {selectedDate ? formatDateDisplay(selectedDate) : 'YYYY-MM-DD'}
              </span>
            </div>
          </button>

          {showCalendar && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}
                    월
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-xs text-center font-medium text-gray-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} />
                    }
                    const isDisabled = day < today
                    const isSelected =
                      selectedDate &&
                      day.toDateString() === selectedDate.toDateString()
                    const isToday = day.toDateString() === today.toDateString()

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        disabled={isDisabled}
                        className={cn(
                          'p-2 text-sm rounded hover:bg-gray-100 transition-colors',
                          isDisabled &&
                            'text-gray-300 cursor-not-allowed hover:bg-transparent',
                          isSelected &&
                            'bg-primary-500 text-white hover:bg-primary-600 shadow-sm',
                          isToday &&
                            !isSelected &&
                            'font-bold text-primary-500 bg-primary-50'
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
      </div>

      {/* 시간 선택 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">시간 선택</Label>
        <TimePicker
          time={time}
          onTimeChange={onTimeChange}
          placeholder="시간을 선택하세요"
        />
      </div>
    </div>
  )
}

export function NotificationForm({
  isOpen,
  onClose,
  onSubmit,
}: NotificationFormProps) {
  const [characterCount, setCharacterCount] = useState({ title: 0, message: 0 })

  const {
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      actionUrl: 'toduck://home', // 기본값: 홈 화면
      isScheduled: true, // 기본으로 예약 발송 켜짐
      scheduledDate: '',
      scheduledTime: '09:00', // 기본 시간 설정
    },
  })

  // 초기 날짜 설정 (내일 날짜)
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    setValue('scheduledDate', dateStr)
  }, [setValue, isOpen])

  const isScheduled = watch('isScheduled')
  const titleValue = watch('title')
  const messageValue = watch('message')
  const actionUrlValue = watch('actionUrl')
  const scheduledDate = watch('scheduledDate')
  const scheduledTime = watch('scheduledTime')

  React.useEffect(() => {
    setCharacterCount({
      title: titleValue?.length || 0,
      message: messageValue?.length || 0,
    })
  }, [titleValue, messageValue])

  const handleFormSubmit = async (data: NotificationFormData) => {
    try {
      let scheduledAt: string | null = null

      if (data.isScheduled && data.scheduledDate && data.scheduledTime) {
        // YYYY-MM-DD HH:mm:ss 형식으로 변환
        scheduledAt = `${data.scheduledDate} ${data.scheduledTime}:00`
      }

      const requestData: BroadcastNotificationCreateRequest = {
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        scheduledAt: scheduledAt,
      }

      await onSubmit(requestData)
      reset()
      onClose()
    } catch (error) {
      console.error('알림 생성 실패:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Send className="w-5 h-5" />
              브로드캐스트 알림 발송
            </DialogTitle>
            <DialogDescription className="mt-1">
              전체 사용자에게 발송할 알림을 작성합니다.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* 경고 메시지 */}
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  이 알림은 <strong>모든 활성 사용자</strong>에게 발송됩니다.
                </span>
              </p>
            </div>

            {/* 제목 입력 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-sm font-medium">
                  알림 제목 <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-neutral-500">
                  {characterCount.title}/100
                </span>
              </div>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <MentionInput
                    id="title"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="예: 서비스 업데이트 안내 (@ 입력 시 사용자 이름 삽입)"
                    maxLength={100}
                  />
                )}
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.title.message}</span>
                </div>
              )}
            </div>

            {/* 내용 입력 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-medium">
                  알림 내용 <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-neutral-500">
                  {characterCount.message}/500
                </span>
              </div>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <MentionTextarea
                    id="message"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="사용자에게 전달할 메시지를 입력하세요. (@ 입력 시 사용자 이름 삽입)"
                    maxLength={500}
                  />
                )}
              />
              {errors.message && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.message.message}</span>
                </div>
              )}
            </div>

            {/* 클릭 시 이동 화면 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                클릭 시 이동 화면 <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="actionUrl"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-gray-400" />
                        <SelectValue placeholder="이동할 화면을 선택하세요" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_URL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.actionUrl && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.actionUrl.message}</span>
                </div>
              )}
              <p className="text-xs text-neutral-500">
                알림 클릭 시 이동할 앱 화면을 선택합니다.
              </p>
            </div>

            {/* 알림 미리보기 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">미리보기</Label>
                {actionUrlValue && (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    {ACTION_URL_OPTIONS.find((o) => o.value === actionUrlValue)
                      ?.label || actionUrlValue}
                  </span>
                )}
              </div>
              <div className="relative w-full">
                <img
                  src={NOTIFICATION_BG_PATH}
                  alt="알림 미리보기"
                  className="w-full rounded-2xl"
                />
                <div
                  className="absolute"
                  style={{
                    left: '24%',
                    width: '250px',
                    // 컨테이너 중앙 정렬로 자동 조절
                    top: '33%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <p
                    className="font-medium text-white/90 truncate mb-0.5"
                    style={{ fontSize: '15px', marginBottom: '-2px' }}
                  >
                    {renderTextPreview(titleValue, '알림 제목')}
                  </p>
                  <p
                    className="font-small text-white/80 leading-snug line-clamp-2 whitespace-pre-wrap"
                    style={{ fontSize: '15px' }}
                  >
                    {renderTextPreview(
                      messageValue,
                      '알림 내용이 여기에 표시됩니다'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 예약 발송 설정 */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isScheduled" className="text-sm font-medium">
                    예약 발송
                  </Label>
                  <p className="text-xs text-neutral-500">
                    지정한 시간에 자동으로 알림이 발송됩니다
                  </p>
                </div>
                <Controller
                  name="isScheduled"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors ${
                        field.value ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div
                        className={`pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform ${
                          field.value
                            ? 'translate-x-4 bg-white'
                            : 'translate-x-0 bg-white'
                        }`}
                      />
                    </div>
                  )}
                />
              </div>

              {isScheduled && (
                <div className="pt-4 border-t">
                  <DateTimePicker
                    date={scheduledDate || ''}
                    time={scheduledTime || '09:00'}
                    onDateChange={(date) => setValue('scheduledDate', date)}
                    onTimeChange={(time) => setValue('scheduledTime', time)}
                  />
                  {errors.scheduledTime && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.scheduledTime.message}</span>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      발송 예정: {scheduledDate} {scheduledTime}:00
                    </p>
                  </div>
                </div>
              )}

              {!isScheduled && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    즉시 발송: 저장 후 바로 모든 사용자에게 알림이 전송됩니다
                  </p>
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="flex-shrink-0 border-t p-4 bg-white">
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>발송 중...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isScheduled ? '예약 발송' : '즉시 발송'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
