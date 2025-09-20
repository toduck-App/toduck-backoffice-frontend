import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services/users'
import { DeletionLogsTable } from '@/components/DeletionLogsTable'
import { StatisticsCard } from '@/components/dashboard/StatisticsCard'
import { useUIStore } from '@/stores/uiStore'
import { AlertCircle, TrendingDown, Calendar, Users } from 'lucide-react'

export default function DeletionLogsPage() {
  const { setGlobalLoading } = useUIStore()

  const {
    data: deletionLogsResponse,
    isLoading: logsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ['deletion-logs'],
    queryFn: () => usersService.getDeletionLogs(),
  })

  const {
    data: deletionStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['deletion-statistics'],
    queryFn: () => usersService.getDeletionStatistics(),
  })

  React.useEffect(() => {
    setGlobalLoading(logsLoading || statsLoading)
  }, [logsLoading, statsLoading, setGlobalLoading])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  const deletionLogs = deletionLogsResponse?.deletionLogs || []

  if (logsError || statsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">계정 삭제 로그</h1>
          <p className="text-neutral-600 mt-2">
            사용자 계정 삭제 내역을 조회하고 통계를 확인하세요
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">계정 삭제 로그</h1>
        <p className="text-neutral-600 mt-2">
          사용자 계정 삭제 내역을 조회하고 통계를 확인하세요
        </p>
      </div>

      {/* Statistics Cards */}
      {deletionStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard
            title="전체 삭제 건수"
            value={deletionStats.totalDeletions || 0}
            icon={<AlertCircle className="h-4 w-4" />}
            isLoading={statsLoading}
            valueFormatter={formatNumber}
            description="누적 계정 삭제 총 건수"
          />

          <StatisticsCard
            title="이번 달 삭제"
            value={deletionStats.thisMonthDeletions || 0}
            icon={<TrendingDown className="h-4 w-4" />}
            isLoading={statsLoading}
            valueFormatter={formatNumber}
            description="이번 달 삭제된 계정 수"
          />

          <StatisticsCard
            title="어제 삭제"
            value={deletionStats.yesterdayDeletions || 0}
            icon={<Calendar className="h-4 w-4" />}
            isLoading={statsLoading}
            valueFormatter={formatNumber}
            description="어제 삭제된 계정 수"
          />

          <StatisticsCard
            title="평균 일일 삭제"
            value={deletionStats.averageDailyDeletions || 0}
            icon={<Users className="h-4 w-4" />}
            isLoading={statsLoading}
            valueFormatter={(value) => parseFloat(value.toString()).toFixed(1)}
            description="최근 30일 평균 일일 삭제 수"
          />
        </div>
      )}

      {/* Deletion Logs Table */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">삭제 로그 목록</h2>
          <p className="text-sm text-gray-600 mt-1">
            계정 삭제 요청 및 처리 내역을 시간순으로 확인할 수 있습니다.
          </p>
        </div>

        <DeletionLogsTable
          deletionLogs={deletionLogs}
          isLoading={logsLoading}
        />
      </div>
    </div>
  )
}