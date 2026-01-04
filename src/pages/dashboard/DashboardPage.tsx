import { useState, useMemo } from 'react'
import {
  Users,
  BookOpen,
  Calendar,
  Activity,
  FileX,
  Eye,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { type DateRange } from 'react-day-picker'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings2 } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
  Area,
  AreaChart,
} from 'recharts'
import { DeletionLogsModal } from '@/components/modals/DeletionLogsModal'
import { statisticsService } from '@/services/statistics'
import { usersService } from '@/services/users'
import { StatisticsType } from '@/types/statistics'
import { DELETION_REASON_LABELS, UserInfo } from '@/types/user'
import { cn } from '@/lib/utils'

const STATISTICS_CONFIGS: Record<
  StatisticsType,
  { type: StatisticsType; label: string; color: string; description: string }
> = {
  NEW_USERS: {
    type: 'NEW_USERS',
    label: '신규 가입',
    color: 'hsl(var(--chart-1))',
    description: '일일 신규 가입자 수',
  },
  DELETED_USERS: {
    type: 'DELETED_USERS',
    label: '탈퇴',
    color: 'hsl(var(--chart-2))',
    description: '일일 탈퇴자 수',
  },
  NEW_ROUTINES: {
    type: 'NEW_ROUTINES',
    label: '새 루틴',
    color: 'hsl(var(--chart-3))',
    description: '일일 신규 루틴 생성 수',
  },
  NEW_DIARIES: {
    type: 'NEW_DIARIES',
    label: '새 다이어리',
    color: 'hsl(var(--chart-4))',
    description: '일일 신규 다이어리 작성 수',
  },
  NEW_SOCIAL_POSTS: {
    type: 'NEW_SOCIAL_POSTS',
    label: '새 소셜 게시글',
    color: 'hsl(var(--chart-5))',
    description: '일일 신규 소셜 게시글 수',
  },
  NEW_COMMENTS: {
    type: 'NEW_COMMENTS',
    label: '새 댓글',
    color: '#06B6D4',
    description: '일일 신규 댓글 수',
  },
  NEW_SCHEDULES: {
    type: 'NEW_SCHEDULES',
    label: '새 스케줄',
    color: '#EC4899',
    description: '일일 신규 스케줄 생성 수',
  },
}

const PIE_COLORS = ['#FF7200', '#FEE101', '#000000']

export default function DashboardPage() {
  const [isDeletionLogsModalOpen, setIsDeletionLogsModalOpen] = useState(false)
  const [selectedChartTypes, setSelectedChartTypes] = useState<
    StatisticsType[]
  >(['NEW_USERS', 'DELETED_USERS', 'NEW_DIARIES', 'NEW_ROUTINES'])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - 6)
    return { from, to }
  })

  // API용 날짜 문자열
  const apiDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 6)
      return {
        startDate: from.toISOString().split('T')[0],
        endDate: to.toISOString().split('T')[0],
      }
    }
    return {
      startDate: dateRange.from.toISOString().split('T')[0],
      endDate: dateRange.to.toISOString().split('T')[0],
    }
  }, [dateRange])

  const keyMetricTypes: StatisticsType[] = [
    'NEW_USERS',
    'DELETED_USERS',
    'NEW_DIARIES',
    'NEW_SOCIAL_POSTS',
  ]

  const allStatisticsTypes: StatisticsType[] = [
    'NEW_USERS',
    'DELETED_USERS',
    'NEW_DIARIES',
    'NEW_ROUTINES',
    'NEW_SOCIAL_POSTS',
    'NEW_COMMENTS',
    'NEW_SCHEDULES',
  ]

  // API queries
  const { data: overallStats, isLoading: overallLoading } = useQuery({
    queryKey: ['statistics', 'overall', keyMetricTypes],
    queryFn: () =>
      statisticsService.getOverallStatistics({ types: keyMetricTypes }),
  })

  const monthlyComparisonRange = useMemo(() => {
    const today = new Date()
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const previousMonthEnd = new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      today.getDate()
    )

    return {
      current: {
        startDate: currentMonthStart.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      },
      previous: {
        startDate: previousMonth.toISOString().split('T')[0],
        endDate: previousMonthEnd.toISOString().split('T')[0],
      },
    }
  }, [])

  const { data: currentMonthStats } = useQuery({
    queryKey: [
      'statistics',
      'current-month',
      monthlyComparisonRange.current.startDate,
      monthlyComparisonRange.current.endDate,
      keyMetricTypes,
    ],
    queryFn: () =>
      statisticsService.getPeriodStatistics({
        startDate: monthlyComparisonRange.current.startDate,
        endDate: monthlyComparisonRange.current.endDate,
        types: keyMetricTypes,
      }),
  })

  const { data: previousMonthStats } = useQuery({
    queryKey: [
      'statistics',
      'previous-month',
      monthlyComparisonRange.previous.startDate,
      monthlyComparisonRange.previous.endDate,
      keyMetricTypes,
    ],
    queryFn: () =>
      statisticsService.getPeriodStatistics({
        startDate: monthlyComparisonRange.previous.startDate,
        endDate: monthlyComparisonRange.previous.endDate,
        types: keyMetricTypes,
      }),
  })

  const { data: multiDateStats, isLoading: chartLoading } = useQuery({
    queryKey: [
      'statistics',
      'multi-date',
      apiDateRange.startDate,
      apiDateRange.endDate,
      selectedChartTypes,
    ],
    queryFn: () =>
      statisticsService.getMultiDateStatistics({
        startDate: apiDateRange.startDate,
        endDate: apiDateRange.endDate,
        types: selectedChartTypes,
      }),
    enabled: selectedChartTypes.length > 0,
  })

  const { data: todayStats, isLoading: todayLoading } = useQuery({
    queryKey: ['statistics', 'today', allStatisticsTypes],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return statisticsService.getPeriodStatistics({
        startDate: today,
        endDate: today,
        types: allStatisticsTypes,
      })
    },
  })

  const { data: yesterdayStats } = useQuery({
    queryKey: ['statistics', 'yesterday', allStatisticsTypes],
    queryFn: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]
      return statisticsService.getPeriodStatistics({
        startDate: yesterdayDate,
        endDate: yesterdayDate,
        types: allStatisticsTypes,
      })
    },
  })

  const { data: deletionStats } = useQuery({
    queryKey: ['deletion-statistics'],
    queryFn: () => usersService.getDeletionStatistics(),
  })

  const { data: userStats } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => usersService.getUserStatistics(),
  })

  const { data: recentUsers } = useQuery({
    queryKey: ['recent-users'],
    queryFn: () =>
      usersService.getUsers({
        sortBy: 'createdAt',
        sortDirection: 'desc',
        size: 3,
        page: 1,
      }),
  })

  // Chart data processing
  const chartData = useMemo(() => {
    if (!multiDateStats?.statistics) return []

    return multiDateStats.statistics.map((dayData) => {
      const data: Record<string, string | number> = { date: dayData.date }
      selectedChartTypes.forEach((type) => {
        data[type] = dayData.counts[type] || 0
      })
      return data
    })
  }, [multiDateStats, selectedChartTypes])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    selectedChartTypes.forEach((type) => {
      config[type] = {
        label: STATISTICS_CONFIGS[type].label,
        color: STATISTICS_CONFIGS[type].color,
      }
    })
    return config
  }, [selectedChartTypes])

  // 선택 기간 총합 계산
  const chartTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    selectedChartTypes.forEach((type) => {
      totals[type] = chartData.reduce(
        (sum, day) => sum + (Number(day[type]) || 0),
        0
      )
    })
    return totals
  }, [chartData, selectedChartTypes])

  // User distribution data
  const userDistributionData = useMemo(() => {
    if (!userStats) return []

    return [
      { name: '자체', value: userStats.generalUsers, fill: PIE_COLORS[0] },
      { name: '카카오', value: userStats.kakaoUsers, fill: PIE_COLORS[1] },
      { name: '애플', value: userStats.appleUsers, fill: PIE_COLORS[2] },
    ].filter((item) => item.value > 0)
  }, [userStats])

  // Deletion reason data
  const deletionReasonData = useMemo(() => {
    if (!deletionStats?.reasonCounts) return []

    const CHART_COLORS = [
      '#FF7200',
      '#FF9A3E',
      '#FFB366',
      '#FFCC8E',
      '#FFE6B6',
      '#F59E0B',
    ]

    return Object.entries(deletionStats.reasonCounts)
      .map(([code, count], index) => ({
        name: DELETION_REASON_LABELS[
          code as keyof typeof DELETION_REASON_LABELS
        ],
        value: count,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [deletionStats])

  // Helper functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100 * 100) / 100
  }

  const formatProvider = (provider: UserInfo['provider']) => {
    if (!provider) return { text: '자체', iconPath: '/images/app-icon.png' }

    const providerMap: Record<string, { text: string; iconPath: string }> = {
      KAKAO: { text: '카카오', iconPath: '/images/kakao-icon.png' },
      APPLE: { text: '애플', iconPath: '/images/apple-icon.png' },
    }

    return providerMap[provider] || { text: provider, iconPath: '' }
  }

  const getIcon = (type: StatisticsType) => {
    const iconClass = 'h-4 w-4'
    switch (type) {
      case 'NEW_USERS':
        return <Users className={iconClass} />
      case 'DELETED_USERS':
        return <FileX className={iconClass} />
      case 'NEW_DIARIES':
        return <BookOpen className={iconClass} />
      case 'NEW_ROUTINES':
        return <Calendar className={iconClass} />
      case 'NEW_SOCIAL_POSTS':
        return <Activity className={iconClass} />
      case 'NEW_COMMENTS':
        return <MessageSquare className={iconClass} />
      case 'NEW_SCHEDULES':
        return <Clock className={iconClass} />
      default:
        return <Activity className={iconClass} />
    }
  }

  const getTitleSuffix = (type: StatisticsType) => {
    switch (type) {
      case 'NEW_USERS':
        return '총 회원 수'
      case 'DELETED_USERS':
        return '총 탈퇴 수'
      case 'NEW_DIARIES':
        return '총 다이어리 수'
      case 'NEW_SOCIAL_POSTS':
        return '총 소셜 포스트 수'
      default:
        return `총 ${STATISTICS_CONFIGS[type].label} 수`
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            토덕 서비스의 주요 지표를 분석하고 모니터링하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
        </div>
      </div>

      {/* Key Metrics - 4 Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetricTypes.map((type) => {
          const overallValue = overallStats?.statistics?.[type] || 0
          const currentValue = currentMonthStats?.statistics?.[type] || 0
          const previousValue = previousMonthStats?.statistics?.[type] || 0
          const change = calculatePercentageChange(currentValue, previousValue)
          const hasChange = previousValue > 0
          const isPositive = currentValue >= previousValue

          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {getTitleSuffix(type)}
                </CardTitle>
                <div style={{ color: STATISTICS_CONFIGS[type].color }}>
                  {getIcon(type)}
                </div>
              </CardHeader>
              <CardContent>
                {overallLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-24 mb-1" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatNumber(overallValue)}
                    </div>
                    {hasChange && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={cn(
                            isPositive ? 'text-emerald-500' : 'text-red-500'
                          )}
                        >
                          {change > 0 ? '+' : ''}
                          {change}%
                        </span>
                        <span className="text-muted-foreground">
                          전월 동기 대비
                        </span>
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Today's Highlights */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">오늘의 하이라이트</CardTitle>
              <CardDescription className="mt-1">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {allStatisticsTypes.map((type) => {
              const config = STATISTICS_CONFIGS[type]
              const todayValue = todayStats?.statistics?.[type] || 0
              const yesterdayValue = yesterdayStats?.statistics?.[type] || 0
              const change = calculatePercentageChange(
                todayValue,
                yesterdayValue
              )
              const hasChange = yesterdayValue > 0
              const isPositive = todayValue >= yesterdayValue

              return (
                <div
                  key={type}
                  className="flex flex-col gap-1 rounded-lg border p-3 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">
                      {config.label}
                    </span>
                    <div style={{ color: config.color }}>{getIcon(type)}</div>
                  </div>
                  {todayLoading ? (
                    <div className="animate-pulse h-6 bg-muted rounded w-12" />
                  ) : (
                    <>
                      <div className="text-xl font-bold">
                        {formatNumber(todayValue)}
                      </div>
                      {hasChange && (
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={cn(
                              'text-xs',
                              isPositive ? 'text-emerald-500' : 'text-red-500'
                            )}
                          >
                            {change > 0 ? '+' : ''}
                            {change}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">트렌드 분석</CardTitle>
            <CardDescription>
              주요 지표의 일별 추이를 확인하세요
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'yyyy.MM.dd', { locale: ko })} -{' '}
                        {format(dateRange.to, 'yyyy.MM.dd', { locale: ko })}
                      </>
                    ) : (
                      format(dateRange.from, 'yyyy.MM.dd', { locale: ko })
                    )
                  ) : (
                    <span>기간 선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex">
                  <div className="flex flex-col gap-1 border-r p-3">
                    <span className="text-xs font-medium text-muted-foreground mb-1">
                      빠른 선택
                    </span>
                    {[
                      { label: '1주일', days: 7 },
                      { label: '2주일', days: 14 },
                      { label: '1개월', days: 30 },
                      { label: '3개월', days: 90 },
                      { label: '전체', days: null },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-sm"
                        onClick={() => {
                          const to = new Date()
                          const from = preset.days
                            ? new Date(to.getTime() - (preset.days - 1) * 24 * 60 * 60 * 1000)
                            : new Date(2025, 4, 27) // 서비스 시작일: 2025년 5월 27일
                          setDateRange({ from, to })
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <CalendarComponent
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      // 이미 시작/종료가 모두 선택된 상태에서 새로 클릭하면
                      // 기존 범위 리셋하고 클릭한 날짜를 새 시작점으로
                      if (dateRange?.from && dateRange?.to && range?.from) {
                        setDateRange({ from: range.from, to: undefined })
                      } else {
                        setDateRange(range)
                      }
                    }}
                    numberOfMonths={2}
                    disabled={(date) =>
                      date > new Date() || date < new Date(2025, 4, 27)
                    }
                    showOutsideDays={false}
                    startMonth={new Date(2025, 4, 1)}
                    endMonth={new Date()}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  지표 설정
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  표시할 지표 선택
                </div>
                <DropdownMenuSeparator />
                {Object.values(STATISTICS_CONFIGS).map((config) => (
                  <DropdownMenuCheckboxItem
                    key={config.type}
                    checked={selectedChartTypes.includes(config.type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChartTypes([
                          ...selectedChartTypes,
                          config.type,
                        ])
                      } else {
                        setSelectedChartTypes(
                          selectedChartTypes.filter((t) => t !== config.type)
                        )
                      }
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pl-0 pt-6">
          {chartLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">
                차트 로딩 중...
              </div>
            </div>
          ) : selectedChartTypes.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  분석할 지표를 선택해주세요
                </p>
                <p className="text-sm">
                  위의 지표 설정에서 하나 이상의 지표를 선택하면 트렌드 차트가
                  표시됩니다.
                </p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>데이터가 없습니다</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  {selectedChartTypes.map((type) => (
                    <linearGradient
                      key={`fill-${type}`}
                      id={`fill-${type}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--color-${type})`}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--color-${type})`}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })
                      }}
                    />
                  }
                />
                {selectedChartTypes.map((type) => (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={`var(--color-${type})`}
                    fill={`url(#fill-${type})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          )}
          <div className="flex items-center justify-center gap-6 mt-4">
            {Object.entries(chartConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {config.label}
                </span>
                <span className="text-sm font-medium">
                  {formatNumber(chartTotals[key] || 0)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section - Two Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Member Statistics and Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">회원 현황</CardTitle>
            <CardDescription>회원 유형별 분포 및 최근 가입자</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Left: User Distribution Chart */}
              <div className="flex flex-col items-center justify-center">
                {userDistributionData.length > 0 ? (
                  <ChartContainer
                    config={{
                      value: { label: '회원 수' },
                    }}
                    className="h-[200px] w-full"
                  >
                    <RechartsPieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => (
                              <div className="flex items-center gap-2">
                                <span>{name}</span>
                                <span className="font-bold">
                                  {formatNumber(value as number)}명
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={userDistributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 8}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    총 회원
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 12}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    {formatNumber(userStats?.totalUsers || 0)}
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">데이터가 없습니다</p>
                    </div>
                  </div>
                )}
                {userDistributionData.length > 0 && (
                  <div className="flex justify-center gap-4 mt-2">
                    {userDistributionData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Recent Users */}
              <div>
                <h4 className="text-sm font-medium mb-3">최근 가입자</h4>
                {recentUsers?.users && recentUsers.users.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.users.slice(0, 3).map((user) => {
                      const providerInfo = formatProvider(user.provider)
                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <img
                            src={user.imageUrl || '/images/default-profile.png'}
                            alt={user.nickname || '사용자'}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                '/images/default-profile.png'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {user.nickname || '익명'}
                              </p>
                              {providerInfo.iconPath && (
                                <img
                                  src={providerInfo.iconPath}
                                  alt={providerInfo.text}
                                  className="w-3 h-3"
                                />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString(
                                'ko-KR',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-[180px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">최근 가입자가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">탈퇴 사유 분석</CardTitle>
              <CardDescription>
                회원 탈퇴 사유별 통계를 확인하세요
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeletionLogsModalOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              상세보기
            </Button>
          </CardHeader>
          <CardContent>
            {deletionReasonData.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="flex flex-col items-center justify-center">
                  <ChartContainer
                    config={{
                      value: { label: '탈퇴 수' },
                    }}
                    className="h-[200px] w-full"
                  >
                    <RechartsPieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => (
                              <div className="flex items-center gap-2">
                                <span>{name}</span>
                                <span className="font-bold">
                                  {formatNumber(value as number)}건
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={deletionReasonData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {deletionReasonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 8}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    총 탈퇴
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 12}
                                    className="fill-foreground text-lg font-bold"
                                  >
                                    {formatNumber(
                                      deletionStats?.totalCount || 0
                                    )}
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                </div>

                {/* Deletion Reason List */}
                <div className="space-y-1">
                  {deletionReasonData.slice(0, 6).map((reason) => {
                    const percentage = (
                      (reason.value / (deletionStats?.totalCount || 1)) *
                      100
                    ).toFixed(1)
                    return (
                      <div
                        key={reason.name}
                        className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: reason.fill }}
                          />
                          <span className="truncate">{reason.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="font-medium">
                            {formatNumber(reason.value)}건
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>탈퇴 데이터가 없습니다</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <DeletionLogsModal
        open={isDeletionLogsModalOpen}
        onOpenChange={setIsDeletionLogsModalOpen}
      />
    </div>
  )
}
