import { apiClient } from './api'
import { API_ENDPOINTS } from '@/types/api'
import {
  UserListPaginationResponse,
  UsersQueryParams,
  SuspendUserRequest,
  DeletionLogListResponse,
  DeletionStatistics,
  UserStatisticsResponse,
} from '@/types/user'

class UsersService {
  async getUsers(params?: UsersQueryParams): Promise<UserListPaginationResponse> {
    return apiClient.get<UserListPaginationResponse>(API_ENDPOINTS.USERS, params)
  }

  async suspendUser(userId: number, data: SuspendUserRequest): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.SUSPEND_USER(userId), data)
  }

  async unsuspendUser(userId: number): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.UNSUSPEND_USER(userId))
  }

  async getDeletionLogs(params?: TableParams): Promise<DeletionLogListResponse> {
    return apiClient.get<DeletionLogListResponse>(API_ENDPOINTS.DELETION_LOGS, params)
  }

  async getDeletionStatistics(): Promise<DeletionStatistics> {
    return apiClient.get<DeletionStatistics>(API_ENDPOINTS.DELETION_STATISTICS)
  }

  async getUserStatistics(): Promise<UserStatisticsResponse> {
    return apiClient.get<UserStatisticsResponse>(API_ENDPOINTS.USER_STATISTICS)
  }
}

export const usersService = new UsersService()
export default usersService