// Statistics Types based on actual API

export interface OverallStatisticsParams {
  types: StatisticsType[]
}

export interface OverallStatistics {
  statistics: Record<StatisticsType, number>
}

export interface DailyStatistics {
  newUsersCount: number
  deletedUsersCount: number
  newDiariesCount: number
  newRoutinesCount: number
  date: string
}

export interface PeriodStatisticsParams {
  startDate: string
  endDate: string
  types: StatisticsType[]
}

export interface PeriodStatistics {
  statistics: Record<StatisticsType, number>
  startDate: string
  endDate: string
}

// New Multi-Date Statistics API Types
export type StatisticsType =
  | 'NEW_USERS'
  | 'DELETED_USERS'
  | 'NEW_ROUTINES'
  | 'NEW_DIARIES'
  | 'NEW_SOCIAL_POSTS'
  | 'NEW_COMMENTS'
  | 'NEW_SCHEDULES'

export interface DailyStatisticsData {
  date: string
  counts: Record<StatisticsType, number>
}

export interface MultiDateStatisticsResponse {
  statistics: DailyStatisticsData[]
  startDate: string
  endDate: string
}

export interface MultiDateStatisticsParams {
  startDate: string
  endDate: string
  types: StatisticsType[]
}

// Statistics Configuration for UI
export interface StatisticsConfig {
  type: StatisticsType
  label: string
  color: string
  icon: string
  description: string
}

export interface TrendChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }[]
}

export interface StatisticsCardData {
  title: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: React.ComponentType<{ className?: string }>
}