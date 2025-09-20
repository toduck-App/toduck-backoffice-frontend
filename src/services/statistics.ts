import { apiClient } from './api'
import { API_ENDPOINTS } from '@/types/api'
import {
  OverallStatistics,
  OverallStatisticsParams,
  DailyStatistics,
  PeriodStatistics,
  PeriodStatisticsParams,
  MultiDateStatisticsResponse,
  MultiDateStatisticsParams,
} from '@/types/statistics'

export interface DailyStatisticsParams {
  date: string
}

class StatisticsService {
  async getOverallStatistics(params: OverallStatisticsParams): Promise<OverallStatistics> {
    const queryParams = {
      types: params.types.join(','),
    }
    return apiClient.get<OverallStatistics>(API_ENDPOINTS.STATISTICS_OVERALL, queryParams)
  }

  async getDailyStatistics(params: DailyStatisticsParams): Promise<DailyStatistics> {
    return apiClient.get<DailyStatistics>(API_ENDPOINTS.STATISTICS_DAILY, params)
  }

  async getPeriodStatistics(params: PeriodStatisticsParams): Promise<PeriodStatistics> {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      types: params.types.join(','),
    }
    return apiClient.get<PeriodStatistics>(API_ENDPOINTS.STATISTICS_PERIOD, queryParams)
  }

  async getMultiDateStatistics(params: MultiDateStatisticsParams): Promise<MultiDateStatisticsResponse> {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      types: params.types.join(','),
    }
    return apiClient.get<MultiDateStatisticsResponse>(API_ENDPOINTS.STATISTICS_MULTI_DATE, queryParams)
  }
}

export const statisticsService = new StatisticsService()
export default statisticsService