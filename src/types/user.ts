// User Management Types
export interface UserInfo {
  id: number
  nickname: string | null
  phoneNumber: string | null
  loginId: string | null
  email: string | null
  imageUrl: string | null
  role: 'ADMIN' | 'USER'
  provider: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE' | null
  suspended: boolean
  suspendedUntil: string | null
  suspensionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface PageInfo {
  currentPage: number
  pageSize: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface UserListPaginationResponse {
  users: UserInfo[]
  pageInfo: PageInfo
}

export interface UsersQueryParams {
  keyword?: string
  searchType?: 'nickname' | 'email' | 'phone' | 'loginid'
  status?: 'all' | 'active' | 'suspended'
  role?: 'ADMIN' | 'USER'
  provider?: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE'
  sortBy?: 'createdAt' | 'nickname' | 'email' | 'role' | 'suspendedAt' | 'updatedAt'
  sortDirection?: 'asc' | 'desc'
  page?: number
  size?: number
}

export interface SuspendUserRequest {
  suspendedUntil: string // Format: "YYYY-MM-DD HH:mm:ss"
  suspensionReason: string
}

export interface SuspendUserFormData {
  suspendedUntil: string
  suspensionReason: string
}

// Deletion Log Types
export type DeletionReasonCode =
  | 'HARD_TO_USE'
  | 'NO_FEATURES'
  | 'MANY_ERRORS'
  | 'BETTER_APP'
  | 'SWITCH_ACCOUNT'
  | 'OTHER'

export interface DeletionLog {
  id: number
  userId: number
  reasonCode: DeletionReasonCode
  reasonDescription: string
  reasonText: string | null
  deletedAt: string
}

export interface DeletionLogListResponse {
  deletionLogs: DeletionLog[]
  totalCount: number
}

export interface DeletionStatistics {
  reasonCounts: Record<DeletionReasonCode, number>
  totalCount: number
}

export interface UserStatisticsResponse {
  totalUsers: number
  generalUsers: number
  kakaoUsers: number
  appleUsers: number
}

// User management localized text
export const DELETION_REASON_LABELS: Record<DeletionReasonCode, string> = {
  HARD_TO_USE: '사용 방법이 어려워요',
  NO_FEATURES: '필요한 기능이 없어요',
  MANY_ERRORS: '오류가 너무 많아요',
  BETTER_APP: '더 좋은 앱을 찾았어요',
  SWITCH_ACCOUNT: '계정을 바꾸고 싶어요',
  OTHER: '기타',
}