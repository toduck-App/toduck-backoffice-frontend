import React, { useState, useMemo } from 'react'
import {
  Users,
  BookOpen,
  Calendar,
  Activity,
  FileX,
  Eye,
  Settings2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { StatisticsCard } from '@/components/dashboard/StatisticsCard'
import {
  StatisticsControlPanel,
  STATISTICS_CONFIGS,
} from '@/components/dashboard/StatisticsControlPanel'
import { EnhancedLineChart } from '@/components/charts/EnhancedLineChart'
import { PieChart } from '@/components/charts/PieChart'
import { DeletionLogsModal } from '@/components/modals/DeletionLogsModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateRange } from '@/components/ui/date-range-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { statisticsService } from '@/services/statistics'
import { usersService } from '@/services/users'
import { StatisticsType } from '@/types/statistics'
import { DELETION_REASON_LABELS, UserInfo } from '@/types/user'

export default function DashboardPage() {
  // State management
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label: '1주',
    }
  })

  const [selectedTypes, setSelectedTypes] = useState<StatisticsType[]>([
    'NEW_USERS',
    'DELETED_USERS',
    'NEW_DIARIES',
    'NEW_ROUTINES',
  ])

  const [isDeletionLogsModalOpen, setIsDeletionLogsModalOpen] = useState(false)

  // Key metrics for the overview - 4 most important ones
  const keyMetricTypes: StatisticsType[] = [
    'NEW_USERS',
    'DELETED_USERS',
    'NEW_DIARIES',
    'NEW_SOCIAL_POSTS',
  ]

  // API queries - Overall statistics for cumulative numbers
  const { data: overallStats, isLoading: overallLoading } = useQuery({
    queryKey: ['statistics', 'overall', keyMetricTypes],
    queryFn: () =>
      statisticsService.getOverallStatistics({ types: keyMetricTypes }),
  })

  // Current period statistics
  const { data: currentPeriodStats, isLoading: currentPeriodLoading } =
    useQuery({
      queryKey: [
        'statistics',
        'current-period',
        dateRange.startDate,
        dateRange.endDate,
        keyMetricTypes,
      ],
      queryFn: () =>
        statisticsService.getPeriodStatistics({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          types: keyMetricTypes,
        }),
    })

  // Monthly comparison for overall summary: current month 1st to today vs previous month same period
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

  // Multi-date statistics for chart
  const {
    data: multiDateStats,
    isLoading: chartLoading,
    error: chartError,
  } = useQuery({
    queryKey: [
      'statistics',
      'multi-date',
      dateRange.startDate,
      dateRange.endDate,
      selectedTypes,
    ],
    queryFn: () =>
      statisticsService.getMultiDateStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        types: selectedTypes,
      }),
    enabled: selectedTypes.length > 0,
  })

  // All available statistics types for today's highlights
  const allStatisticsTypes: StatisticsType[] = [
    'NEW_USERS',
    'DELETED_USERS',
    'NEW_DIARIES',
    'NEW_ROUTINES',
    'NEW_SOCIAL_POSTS',
    'NEW_COMMENTS',
    'NEW_SCHEDULES',
  ]

  // Today's data for highlights
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

  // Yesterday's data for comparison
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

  // Deletion statistics
  const { data: deletionStats } = useQuery({
    queryKey: ['deletion-statistics'],
    queryFn: () => usersService.getDeletionStatistics(),
  })

  // User statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: () => usersService.getUserStatistics(),
  })

  // Recent users
  const { data: recentUsers } = useQuery({
    queryKey: ['recent-users'],
    queryFn: () => usersService.getUsers({
      sortBy: 'createdAt',
      sortDirection: 'desc',
      size: 3,
      page: 1,
    }),
  })

  // Data processing for chart
  const chartData = useMemo(() => {
    if (!multiDateStats?.statistics) return []

    return multiDateStats.statistics.map((dayData) => {
      const processedData: any = { date: dayData.date }

      selectedTypes.forEach((type) => {
        const config = STATISTICS_CONFIGS[type]
        processedData[config.label] = dayData.counts[type] || 0
      })

      return processedData
    })
  }, [multiDateStats, selectedTypes])

  const chartLines = useMemo(() => {
    return selectedTypes.map((type) => {
      const config = STATISTICS_CONFIGS[type]
      return {
        dataKey: config.label,
        name: config.label,
        color: config.color,
      }
    })
  }, [selectedTypes])

  // Helper functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100 * 100) / 100 // Round to 2 decimal places
  }

  const formatPercentageChange = (change: number) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}%`
  }

  // Deletion reason data for pie chart
  const deletionReasonData = useMemo(() => {
    if (!deletionStats?.reasonCounts) return []

    return Object.entries(deletionStats.reasonCounts).map(([code, count]) => ({
      name: DELETION_REASON_LABELS[code as keyof typeof DELETION_REASON_LABELS],
      value: count,
      color: undefined,
    }))
  }, [deletionStats])

  // User distribution data for pie chart
  const userDistributionData = useMemo(() => {
    if (!userStats) return []

    return [
      {
        name: '자체',
        value: userStats.generalUsers,
        color: '#FF7200',
        iconPath: '/images/app-icon.png',
      },
      {
        name: '카카오',
        value: userStats.kakaoUsers,
        color: '#FEE101',
        iconPath: '/images/kakao-icon.png',
      },
      {
        name: '애플',
        value: userStats.appleUsers,
        color: '#000000',
        iconPath: '/images/apple-icon.png',
      },
    ].filter(item => item.value > 0)
  }, [userStats])

  // Format provider function for recent users
  const formatProvider = (provider: UserInfo['provider']) => {
    if (!provider) return { text: '자체', iconPath: '/images/app-icon.png' }

    const providerMap: Record<
      string,
      { text: string; iconPath: string }
    > = {
      KAKAO: { text: '카카오', iconPath: '/images/kakao-icon.png' },
      APPLE: { text: '애플', iconPath: '/images/apple-icon.png' },
    }

    return providerMap[provider] || { text: provider, iconPath: null }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-muted-foreground mt-1">
          토덕 서비스의 주요 지표를 분석하고 모니터링하세요
        </p>
      </div>

      {/* 전체 요약 - 4개 핵심 지표 */}
      <div>
        <h2 className="text-lg font-semibold mb-6">전체 요약</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {keyMetricTypes.map((type) => {
            const config = STATISTICS_CONFIGS[type]
            const overallValue = overallStats?.statistics?.[type] || 0
            const currentValue = currentMonthStats?.statistics?.[type] || 0
            const previousValue = previousMonthStats?.statistics?.[type] || 0
            const change = calculatePercentageChange(
              currentValue,
              previousValue
            )
            const isLoading = currentPeriodLoading || overallLoading
            const hasChange = previousValue > 0

            const getIcon = () => {
              switch (type) {
                case 'NEW_USERS':
                  return <Users className="h-4 w-4" />
                case 'DELETED_USERS':
                  return <FileX className="h-4 w-4" />
                case 'NEW_DIARIES':
                  return <BookOpen className="h-4 w-4" />
                case 'NEW_SOCIAL_POSTS':
                  return <Activity className="h-4 w-4" />
                default:
                  return <Activity className="h-4 w-4" />
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
                  return `총 ${config.label} 수`
              }
            }

            const getDescription = () => {
              if (!hasChange) return undefined
              return `전월 동기 대비`
            }

            return (
              <StatisticsCard
                key={type}
                title={getTitleSuffix(type)}
                value={overallValue}
                icon={<div style={{ color: config.color }}>{getIcon()}</div>}
                isLoading={isLoading}
                valueFormatter={formatNumber}
                change={hasChange ? change : undefined}
                changeType={
                  currentValue >= previousValue ? 'increase' : 'decrease'
                }
                description={getDescription()}
                size="default"
              />
            )
          })}
        </div>
      </div>

      {/* 오늘의 하이라이트 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">오늘의 하이라이트</h2>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </div>

        {/* 한 줄에 7개 블럭 배치 */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {allStatisticsTypes.map((type) => {
            const config = STATISTICS_CONFIGS[type]
            const todayValue = todayStats?.statistics?.[type] || 0
            const yesterdayValue = yesterdayStats?.statistics?.[type] || 0
            const change = calculatePercentageChange(todayValue, yesterdayValue)
            const hasChange = yesterdayValue > 0

            const getIcon = () => {
              switch (type) {
                case 'NEW_USERS':
                  return <Users className="h-4 w-4" />
                case 'DELETED_USERS':
                  return <FileX className="h-4 w-4" />
                case 'NEW_DIARIES':
                  return <BookOpen className="h-4 w-4" />
                case 'NEW_ROUTINES':
                  return <Calendar className="h-4 w-4" />
                case 'NEW_SOCIAL_POSTS':
                  return <Activity className="h-4 w-4" />
                case 'NEW_COMMENTS':
                  return <Activity className="h-4 w-4" />
                case 'NEW_SCHEDULES':
                  return <Calendar className="h-4 w-4" />
                default:
                  return <Activity className="h-4 w-4" />
              }
            }

            const getDescription = () => {
              if (!hasChange) return undefined
              return '어제 대비'
            }

            return (
              <div key={type} className="min-h-[80px]">
                {' '}
                {/* 하이라이트용 높이 더 축소 */}
                <StatisticsCard
                  title={`${config.label}`}
                  value={todayValue}
                  icon={<div style={{ color: config.color }}>{getIcon()}</div>}
                  isLoading={todayLoading}
                  valueFormatter={formatNumber}
                  change={hasChange ? change : undefined}
                  changeType={
                    todayValue >= yesterdayValue ? 'increase' : 'decrease'
                  }
                  description={getDescription()}
                  size="compact"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* 트렌드 분석 차트 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">트렌드 분석</h2>
        </div>

        {/* Modern Filter Bar */}
        <div className="bg-white border border-gray-100 rounded-t-xl shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Time Range Pills */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 rounded-lg p-1 flex gap-1">
                  <button
                    onClick={() => {
                      const endDate = new Date()
                      const startDate = new Date()
                      startDate.setDate(endDate.getDate() - 6)
                      setDateRange({
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        label: '1주',
                      })
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      dateRange.label === '1주'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    1주
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date()
                      const startDate = new Date()
                      startDate.setDate(endDate.getDate() - 13)
                      setDateRange({
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        label: '2주',
                      })
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      dateRange.label === '2주'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    2주
                  </button>
                  <button
                    onClick={() => {
                      const endDate = new Date()
                      const startDate = new Date()
                      startDate.setMonth(endDate.getMonth() - 1)
                      setDateRange({
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        label: '한달',
                      })
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      dateRange.label === '한달'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    한달
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200" />

              {/* Selected Indicators */}
              <div className="flex items-center gap-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {selectedTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: STATISTICS_CONFIGS[type].color + '10',
                        color: STATISTICS_CONFIGS[type].color,
                        border: `1px solid ${STATISTICS_CONFIGS[type].color}20`,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: STATISTICS_CONFIGS[type].color,
                        }}
                      />
                      {STATISTICS_CONFIGS[type].label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicator Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={chartLoading}
                  className="h-9 px-3 hover:bg-gray-50"
                >
                  <Settings2 className="h-4 w-4 mr-1.5" />
                  <span className="text-sm">지표 설정</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                    통계 지표
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="py-1">
                  {Object.values(STATISTICS_CONFIGS).map((config) => (
                    <DropdownMenuCheckboxItem
                      key={config.type}
                      checked={selectedTypes.includes(config.type)}
                      onCheckedChange={() => {
                        const newTypes = selectedTypes.includes(config.type)
                          ? selectedTypes.filter((t) => t !== config.type)
                          : [...selectedTypes, config.type]
                        setSelectedTypes(newTypes)
                      }}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full pl-6">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {config.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {selectedTypes.length > 0 ? (
          <div className="bg-white border border-t-0 border-gray-100 rounded-b-xl shadow-sm px-3 pb-3 !mt-0">
            <EnhancedLineChart
              data={chartData}
              lines={chartLines}
              title=""
              isLoading={chartLoading}
              height={360}
              showBrush={chartData.length > 14}
              showGrid={true}
              showLegend={true}
              yAxisLabel="건수"
              xAxisLabel=""
            />

            {chartError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="text-center">
                  <p className="text-red-700 text-sm font-medium">
                    차트 데이터를 불러오는 중 오류가 발생했습니다.
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    선택한 기간과 지표를 확인해주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                분석할 지표를 선택해주세요
              </p>
              <p className="text-sm">
                위의 필터에서 하나 이상의 지표를 선택하면 트렌드 차트가
                표시됩니다.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 회원 현황 및 최근 가입자 / 탈퇴 사유 분석 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Member Statistics and Recent Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">회원 현황 및 최근 가입자</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: User Distribution Chart */}
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-4">
                회원 유형별 분포
              </h3>
              {userDistributionData.length > 0 ? (
                <PieChart
                  data={userDistributionData}
                  height={200}
                  centerLabel="총 활성 회원"
                  centerValue={formatNumber(userStats?.totalUsers || 0)}
                  centerLabelOffset={-1.6}
                  showLegend={true}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500 text-sm">데이터가 없습니다</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Recent Users */}
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-4">
                최근 가입자
              </h3>
              {recentUsers?.users && recentUsers.users.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.users.map((user) => {
                    const providerInfo = formatProvider(user.provider)
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                      >
                        <img
                          src={user.imageUrl || '/images/default-profile.png'}
                          alt={user.nickname || '사용자'}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-profile.png'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {user.nickname || '익명'}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {providerInfo.iconPath && (
                                <img
                                  src={providerInfo.iconPath}
                                  alt={providerInfo.text}
                                  className="w-3 h-3"
                                />
                              )}
                              <span className="text-xs text-neutral-500">
                                {providerInfo.text}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-500">
                            가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500 text-sm">최근 가입자가 없습니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">탈퇴 사유 분석</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeletionLogsModalOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              상세보기
            </Button>
          </div>

          {deletionReasonData.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <PieChart
                  data={deletionReasonData}
                  height={245}
                  centerLabel="총 탈퇴"
                  centerValue={formatNumber(deletionStats?.totalCount || 0)}
                  centerLabelOffset={-0.8}
                  showLegend={false}
                />
              </div>
              <div className="flex-1 space-y-2.5 mt-5 mr-10 mb-5 ml-4">
                {deletionReasonData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 6)
                  .map((reason, index) => {
                    const percentage = (
                      (reason.value / (deletionStats?.totalCount || 1)) *
                      100
                    ).toFixed(1)
                    const CHART_COLORS = [
                      '#FF7200',
                      '#FF9A3E',
                      '#FFB366',
                      '#FFCC8E',
                      '#FFE6B6',
                      '#F59E0B',
                    ]
                    return (
                      <div
                        key={reason.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span className="truncate">{reason.name}</span>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
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
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-center">
                <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">탈퇴 데이터가 없습니다</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <DeletionLogsModal
        open={isDeletionLogsModalOpen}
        onOpenChange={setIsDeletionLogsModalOpen}
      />
    </div>
  )
}
