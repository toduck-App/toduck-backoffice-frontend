export type Platform = 'IOS' | 'ANDROID'

export type UpdateType = 'LATEST' | 'RECOMMENDED' | 'FORCE' | 'NONE'

export type VersionCheckStatus = 'FORCE' | 'RECOMMENDED' | 'NONE'

export interface AppVersionResponse {
  id: number
  platform: Platform
  version: string
  releaseDate: string
  updateType: UpdateType
  updateTypeDescription: string
  canDelete: boolean
  createdAt: string
}

export interface AppVersionListResponse {
  ios: AppVersionResponse[]
  android: AppVersionResponse[]
}

export interface AppVersionCreateRequest {
  platform: Platform
  version: string
  releaseDate: string
}

export interface VersionCheckRequest {
  platform: string
  version: string
}

export interface VersionCheckResponse {
  updateStatus: VersionCheckStatus
  latestVersion: string
}

export interface UpdatePolicyItemRequest {
  id: number
  updateType: UpdateType
}

export interface UpdatePolicyRequest {
  ios: UpdatePolicyItemRequest[]
  android: UpdatePolicyItemRequest[]
}

export interface UpdatePolicyItemResponse {
  id: number
  platform: Platform
  version: string
  releaseDate: string
  updateType: UpdateType
  updateTypeDescription: string
  canDelete: boolean
  createdAt: string
}

export interface UpdatePolicyResponse {
  ios: UpdatePolicyItemResponse[]
  android: UpdatePolicyItemResponse[]
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  IOS: 'iOS',
  ANDROID: 'Android',
}

export const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  LATEST: '최신 버전',
  RECOMMENDED: '권장 업데이트',
  FORCE: '강제 업데이트',
  NONE: '업데이트 없음',
}

export const UPDATE_TYPE_DESCRIPTIONS: Record<UpdateType, string> = {
  LATEST: '현재 최신 버전입니다.',
  RECOMMENDED: '업데이트를 권장하지만 앱 사용은 가능합니다.',
  FORCE: '반드시 업데이트해야 앱을 사용할 수 있습니다.',
  NONE: '업데이트 정책이 적용되지 않습니다.',
}

export const UPDATE_TYPE_COLORS: Record<UpdateType, string> = {
  LATEST: 'bg-green-100 text-green-800 border-green-200',
  RECOMMENDED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  FORCE: 'bg-red-100 text-red-800 border-red-200',
  NONE: 'bg-gray-100 text-gray-800 border-gray-200',
}

export const VERSION_CHECK_STATUS_LABELS: Record<VersionCheckStatus, string> = {
  FORCE: '강제 업데이트 필요',
  RECOMMENDED: '업데이트 권장',
  NONE: '업데이트 불필요',
}