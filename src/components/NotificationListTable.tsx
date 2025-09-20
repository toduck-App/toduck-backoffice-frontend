import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { BroadcastNotification } from '@/types/notification';
import { DataTable } from './DataTable';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Send } from 'lucide-react';

interface NotificationListTableProps {
  notifications: BroadcastNotification[];
  onCancel: (notificationId: number) => void;
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return 'destructive';
    case 'NORMAL':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'HIGH':
      return '높음';
    case 'NORMAL':
      return '보통';
    case 'LOW':
      return '낮음';
    default:
      return priority;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'SCHEDULED':
      return 'secondary';
    case 'SENDING':
      return 'outline';
    case 'FAILED':
      return 'destructive';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
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

export function NotificationListTable({
  notifications,
  onCancel,
}: NotificationListTableProps) {
  const columns: ColumnDef<BroadcastNotification>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue('id')}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: '제목',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">
            {row.getValue('title')}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'targetUserCount',
      header: '대상 사용자',
      enableSorting: true,
      cell: ({ row }) => {
        const targetUserCount = row.getValue('targetUserCount') as number;
        return (
          <div className="text-sm">
            <span className="font-medium">{(targetUserCount || 0).toLocaleString()}명</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: '예약 시간',
      enableSorting: true,
      cell: ({ row }) => {
        const scheduledAt = row.getValue('scheduledAt') as string | null;
        return (
          <span className="text-sm text-gray-600">
            {scheduledAt ? formatDate(scheduledAt) : '즉시 발송'}
          </span>
        );
      },
    },
    {
      accessorKey: 'sentUserCount',
      header: '발송 완료',
      enableSorting: true,
      cell: ({ row }) => {
        const sentUserCount = row.getValue('sentUserCount') as number;
        const targetUserCount = row.original.targetUserCount;
        return (
          <span className="text-sm text-gray-600">
            {(sentUserCount || 0).toLocaleString()} / {(targetUserCount || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.getValue('createdAt'))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const notification = row.original;
        const canCancel = notification.canCancel;

        return (
          <div className="flex items-center gap-2">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(notification.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={notifications}
      searchPlaceholder="알림 검색 (제목, 내용)"
    />
  );
}