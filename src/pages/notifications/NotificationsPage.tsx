import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BroadcastNotification,
  NotificationStatisticsResponse,
  NotificationType,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_STATUS_STYLES,
} from '@/types/notification'
import { notificationsService } from '@/services/notifications'
import { NotificationForm } from '@/components/NotificationForm'
import { StatisticsCard } from '@/components/dashboard/StatisticsCard'
import { NotificationTypeCard } from '@/components/NotificationTypeCard'
import { PieChart } from '@/components/charts/PieChart'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Bell,
  Send,
  Calendar,
  MoreVertical,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  MessageCircle,
  UserPlus,
  Heart,
  CalendarCheck,
  BookOpen,
  Megaphone,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const COLORS = {
  COMMENT: '#8B5CF6',
  LIKE_POST: '#EC4899',
  FOLLOW: '#10B981',
  ROUTINE_REMINDER: '#F59E0B',
  DIARY_REMINDER: '#EF4444',
  BROADCAST: '#3B82F6',
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'COMMENT':
      return <MessageCircle className="h-4 w-4" />
    case 'LIKE_POST':
      return <Heart className="h-4 w-4" />
    case 'FOLLOW':
      return <UserPlus className="h-4 w-4" />
    case 'ROUTINE_REMINDER':
      return <CalendarCheck className="h-4 w-4" />
    case 'DIARY_REMINDER':
      return <BookOpen className="h-4 w-4" />
    case 'BROADCAST':
      return <Megaphone className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

export default function NotificationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [hideDiaryReminder, setHideDiaryReminder] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { setGlobalLoading, addToast } = useUIStore()
  const queryClient = useQueryClient()

  // 알림 통계 조회
  const { data: statisticsData } = useQuery({
    queryKey: ['notification-statistics'],
    queryFn: () => notificationsService.getNotificationStatistics(),
  })

  // 브로드캐스트 알림 목록 조회
  const {
    data: notificationResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  })

  const notifications = notificationResponse?.notifications || []

  // 페이지네이션 처리
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return notifications.slice(startIndex, startIndex + itemsPerPage)
  }, [notifications, currentPage])

  const totalPages = Math.ceil(notifications.length / itemsPerPage)

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!statisticsData?.notificationCountsByType) return []

    return Object.entries(statisticsData.notificationCountsByType)
      .filter(([type]) => !hideDiaryReminder || type !== 'DIARY_REMINDER')
      .map(([type, count]) => ({
        name: NOTIFICATION_TYPE_LABELS[type as NotificationType],
        value: count,
        color: COLORS[type as NotificationType],
      }))
  }, [statisticsData, hideDiaryReminder])

  // 상위 알림 유형들 (오늘의 하이라이트용)
  const topNotificationTypes = useMemo(() => {
    if (!statisticsData?.notificationCountsByType) return []

    return [...Object.entries(statisticsData.notificationCountsByType)]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([type, count]) => ({
        type: type as NotificationType,
        count,
      }))
  }, [statisticsData])

  // 알림 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: notificationsService.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-statistics'] })
      addToast({
        type: 'success',
        title: '알림 발송 시작',
        message: '브로드캐스트 알림이 발송되기 시작했습니다.',
      })
      setIsFormOpen(false)
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '알림 발송 실패',
        message: '알림 발송 중 오류가 발생했습니다.',
      })
    },
  })

  // 알림 취소 뮤테이션
  const cancelMutation = useMutation({
    mutationFn: notificationsService.cancelNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      addToast({
        type: 'success',
        title: '알림 취소 완료',
        message: '예약된 알림이 취소되었습니다.',
      })
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '알림 취소 실패',
        message: '알림을 취소할 수 없습니다.',
      })
    },
  })

  const handleCreateNotification = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const handleCancelNotification = async (id: number) => {
    if (window.confirm('이 알림을 취소하시겠습니까?')) {
      await cancelMutation.mutateAsync(id)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">알림 관리</h1>
          <p className="text-neutral-600 mt-2">
            시스템 알림 발송 현황 및 브로드캐스트 알림 관리
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 포맷 함수들
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
        <p className="text-muted-foreground mt-1">
          시스템 알림 발송 현황을 모니터링하고 브로드캐스트 알림을 관리하세요
        </p>
      </div>

      {/* 전체 요약 */}
      <div>
        <h2 className="text-lg font-semibold mb-6">전체 요약</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard
            title="총 알림 발송 수"
            value={statisticsData?.totalNotificationsSent || 0}
            icon={<Bell className="h-4 w-4" style={{ color: '#FF7200' }} />}
            valueFormatter={formatNumber}
            size="default"
          />
          <StatisticsCard
            title="오늘 알림 발송 수"
            value={statisticsData?.todayNotificationsSent || 0}
            icon={<Activity className="h-4 w-4" style={{ color: '#3B82F6' }} />}
            valueFormatter={formatNumber}
            size="default"
          />

          {/* 유형별 분포 차트 */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                알림 유형별 분포
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide-diary"
                  checked={!hideDiaryReminder}
                  onCheckedChange={(checked) => setHideDiaryReminder(!checked)}
                  className="h-3 w-3"
                />
                <label
                  htmlFor="hide-diary"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  일기 알림 표시
                </label>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="flex items-center gap-24">
                <div className="flex-shrink-0">
                  <PieChart
                    data={chartData}
                    height={180}
                    centerLabel="전체"
                    centerValue={formatNumber(
                      statisticsData?.totalNotificationsSent || 0
                    )}
                    centerLabelOffset={-0.8}
                    showLegend={false}
                  />
                </div>
                <div className="flex-1 space-y-1.5 pr-2">
                  {[...chartData]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 6)
                    .map((item) => {
                      const percentage = (
                        (item.value /
                          (statisticsData?.totalNotificationsSent || 1)) *
                        100
                      ).toFixed(1)
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <div className="text-right flex-shrink-0 flex items-center gap-1">
                            <span className="font-medium text-[11px]">
                              {item.value.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <div className="text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">데이터 없음</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 브로드캐스트 알림 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                브로드캐스트 알림
              </CardTitle>
              <CardDescription className="mt-2">
                전체 사용자에게 알림을 발송하는 기능입니다. 중요한 공지사항이나
                업데이트 소식을 전달할 때 사용하세요.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />새 브로드캐스트 알림 발송
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">제목</TableHead>
                  <TableHead>메시지</TableHead>
                  <TableHead className="w-[100px]">상태</TableHead>
                  <TableHead className="w-[150px]">예약 시간</TableHead>
                  <TableHead className="w-[150px]">발송 시간</TableHead>
                  <TableHead className="w-[120px]">대상/발송</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-neutral-500"
                    >
                      아직 발송된 알림이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium py-4">
                        <div className="max-w-[200px] truncate">
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-[300px] truncate">
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`${
                            NOTIFICATION_STATUS_STYLES[notification.status].bg
                          } ${NOTIFICATION_STATUS_STYLES[notification.status].color} border-0`}
                        >
                          {
                            NOTIFICATION_STATUS_STYLES[notification.status]
                              .label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm py-4">
                        {formatDate(notification.scheduledAt)}
                      </TableCell>
                      <TableCell className="text-sm py-4">
                        {formatDate(notification.sentAt)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          {notification.sentUserCount || 0}/
                          {notification.targetUserCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {notification.canCancel && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancelNotification(notification.id)
                                }
                                className="text-red-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                알림 취소
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-neutral-600">
                전체 {notifications.length}개 중{' '}
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, notifications.length)}개
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 알림 생성 모달 */}
      <NotificationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateNotification}
      />
    </div>
  )
}
