import React from 'react'
import { DeletionLog } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface DeletionLogsTableProps {
  deletionLogs: DeletionLog[]
  isLoading: boolean
}

export function DeletionLogsTable({ deletionLogs, isLoading }: DeletionLogsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (deletionLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">삭제 로그가 없습니다.</p>
      </div>
    )
  }

  const getDeletionTypeBadge = (deletionType: string) => {
    switch (deletionType) {
      case 'USER_REQUESTED':
        return <Badge variant="secondary">사용자 요청</Badge>
      case 'ADMIN_REQUESTED':
        return <Badge variant="destructive">관리자 요청</Badge>
      case 'POLICY_VIOLATION':
        return <Badge variant="destructive">정책 위반</Badge>
      case 'INACTIVE_ACCOUNT':
        return <Badge variant="outline">비활성 계정</Badge>
      default:
        return <Badge variant="secondary">{deletionType}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge className="bg-yellow-100 text-yellow-800">요청됨</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">처리중</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">완료됨</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">실패</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              사용자 정보
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              삭제 유형
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              요청일시
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              완료일시
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              사유
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {deletionLogs.map((log) => (
            <tr key={log.id} className="hover:bg-neutral-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="font-medium text-neutral-900">
                    ID: {log.userId}
                  </div>
                  <div className="text-neutral-500">
                    {log.userEmail}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getDeletionTypeBadge(log.deletionType)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(log.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {formatDate(log.requestedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {log.completedAt ? formatDate(log.completedAt) : '-'}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-neutral-900 max-w-xs truncate" title={log.reason}>
                  {log.reason || '-'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}