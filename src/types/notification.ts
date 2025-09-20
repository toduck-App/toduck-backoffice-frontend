// Notification Types
export interface Notification {
  id: number
  title: string
  content: string
  targetType: 'ALL' | 'SPECIFIC'
  targetUsers: number[] | null
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED'
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  scheduledAt: string | null
  sentAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: number
}

export interface BroadcastNotification {
  id: number
  title: string
  message: string
  scheduledAt: string | null
  sentAt: string | null
  status: 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
  statusDescription: string
  targetUserCount: number
  sentUserCount: number
  failureReason: string | null
  createdAt: string
  canCancel: boolean
}

export interface CreateNotificationRequest {
  title: string
  content: string
  targetType: 'ALL' | 'SPECIFIC'
  targetUsers?: number[]
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  scheduledAt?: string | null
  isActive: boolean
}

export interface UpdateNotificationRequest {
  title?: string
  content?: string
  targetType?: 'ALL' | 'SPECIFIC'
  targetUsers?: number[]
  priority?: 'LOW' | 'NORMAL' | 'HIGH'
  scheduledAt?: string | null
  isActive?: boolean
}

export interface NotificationListResponse {
  notifications: BroadcastNotification[]
  totalCount: number
}

export interface CreateNotificationFormData {
  title: string
  message: string
  scheduledAt: string | null
  isScheduled: boolean
}

export interface BroadcastNotificationCreateRequest {
  title: string
  message: string
  scheduledAt?: string | null
}

// Notification Statistics Types
export interface NotificationStatisticsResponse {
  totalNotificationsSent: number
  todayNotificationsSent: number
  notificationCountsByType: {
    COMMENT?: number
    LIKE_POST?: number
    FOLLOW?: number
    ROUTINE_REMINDER?: number
    DIARY_REMINDER?: number
    BROADCAST?: number
  }
}

export type NotificationType =
  | 'COMMENT'
  | 'LIKE_POST'
  | 'FOLLOW'
  | 'ROUTINE_REMINDER'
  | 'DIARY_REMINDER'
  | 'BROADCAST'
  | 'LIKE_COMMENT'
  | 'REPLY'
  | 'REPLY_ON_MY_POST'

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  COMMENT: '댓글',
  LIKE_POST: '게시글 좋아요',
  FOLLOW: '팔로우',
  ROUTINE_REMINDER: '루틴 알림',
  DIARY_REMINDER: '일기 알림',
  BROADCAST: '전체 공지',
  LIKE_COMMENT: '댓글 좋아요',
  REPLY: '대댓글',
  REPLY_ON_MY_POST: '내 게시글에 단 댓글',
}

// Notification status styling
export const NOTIFICATION_STATUS_STYLES = {
  SCHEDULED: {
    color: 'text-semantic-info',
    bg: 'bg-semantic-info/10',
    label: '발송 예약됨',
  },
  SENDING: {
    color: 'text-semantic-warning',
    bg: 'bg-semantic-warning/10',
    label: '발송 중',
  },
  COMPLETED: {
    color: 'text-semantic-success',
    bg: 'bg-semantic-success/10',
    label: '발송 완료',
  },
  FAILED: {
    color: 'text-semantic-error',
    bg: 'bg-semantic-error/10',
    label: '발송 실패',
  },
  CANCELLED: {
    color: 'text-neutral-600',
    bg: 'bg-neutral-100',
    label: '발송 취소',
  },
} as const
