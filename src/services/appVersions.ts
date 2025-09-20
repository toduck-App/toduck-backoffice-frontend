import { apiClient } from './api'
import {
  AppVersionListResponse,
  AppVersionCreateRequest,
  AppVersionResponse,
  UpdatePolicyResponse,
  UpdatePolicyRequest,
  VersionCheckRequest,
  VersionCheckResponse,
} from '@/types/appVersion'

export const appVersionsService = {
  async getAllVersions(): Promise<AppVersionListResponse> {
    return apiClient.get<AppVersionListResponse>('/v1/backoffice/app/versions')
  },

  async createVersion(data: AppVersionCreateRequest): Promise<AppVersionResponse> {
    return apiClient.post<AppVersionResponse, AppVersionCreateRequest>(
      '/v1/backoffice/app/versions',
      data
    )
  },

  async deleteVersion(id: number): Promise<void> {
    return apiClient.delete<void>(`/v1/backoffice/app/versions/${id}`)
  },

  async getUpdatePolicies(): Promise<UpdatePolicyResponse> {
    return apiClient.get<UpdatePolicyResponse>('/v1/backoffice/app/update-policies')
  },

  async updatePolicies(data: UpdatePolicyRequest): Promise<void> {
    return apiClient.put<void, UpdatePolicyRequest>('/v1/backoffice/app/update-policies', data)
  },

  async checkVersion(params: VersionCheckRequest): Promise<VersionCheckResponse> {
    return apiClient.get<VersionCheckResponse>('/v1/backoffice/app/version-check', params)
  },
}