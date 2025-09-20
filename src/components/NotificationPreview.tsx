import React from 'react';
import { BroadcastNotification } from '@/types/notification';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Bell, Users, Clock } from 'lucide-react';

interface NotificationPreviewProps {
  notification: BroadcastNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return '발송 완료';
    case 'SCHEDULED':
      return '발송 예약';
    case 'SENDING':
      return '발송 중';
    case 'FAILED':
      return '발송 실패';
    case 'CANCELLED':
      return '취소됨';
    default:
      return status;
  }
};

export function NotificationPreview({
  notification,
  isOpen,
  onClose,
}: NotificationPreviewProps) {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 미리보기
          </DialogTitle>
          <DialogDescription>
            사용자에게 전송될 알림의 내용을 미리 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 알림 카드 미리보기 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm border p-4 max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              실제 사용자 앱에서 보이는 모습
            </p>
          </div>

          {/* 알림 상세 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">상세 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">전송 대상</label>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {notification.targetUserCount?.toLocaleString() || 0}명
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">예약 발송</label>
                <div className="mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    {notification.scheduledAt
                      ? formatDate(notification.scheduledAt)
                      : '즉시 발송'
                    }
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">상태</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {getStatusLabel(notification.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">발송 결과</label>
                <div className="mt-1">
                  <span className="text-sm text-gray-900">
                    {notification.sentUserCount?.toLocaleString() || 0} / {notification.targetUserCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {notification.failureReason && (
              <div>
                <label className="text-sm font-medium text-gray-600">실패 사유</label>
                <div className="mt-1">
                  <p className="text-sm text-red-600">{notification.failureReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}