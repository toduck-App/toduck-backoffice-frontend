import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users'
import { UserInfo, UsersQueryParams } from '@/types/user'
import { ERROR_CODES } from '@/types/api'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Shield,
  User,
  Users,
  Ban,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  X,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react'

export default function UsersPage() {
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    status: 'all',
  })

  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [suspensionDays, setSuspensionDays] = useState('30')
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  const { addToast } = useUIStore()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersService.getUsers(queryParams),
  })

  const suspendMutation = useMutation({
    mutationFn: ({
      userId,
      reason,
      days,
    }: {
      userId: number
      reason: string
      days: number
    }) => {
      const suspendedUntil = new Date()
      suspendedUntil.setDate(suspendedUntil.getDate() + days)

      // Format as "YYYY-MM-DD HH:mm:ss" to match API requirements
      const year = suspendedUntil.getFullYear()
      const month = String(suspendedUntil.getMonth() + 1).padStart(2, '0')
      const day = String(suspendedUntil.getDate()).padStart(2, '0')
      const hours = String(suspendedUntil.getHours()).padStart(2, '0')
      const minutes = String(suspendedUntil.getMinutes()).padStart(2, '0')
      const seconds = String(suspendedUntil.getSeconds()).padStart(2, '0')
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

      return usersService.suspendUser(userId, {
        suspendedUntil: formattedDateTime,
        suspensionReason: reason,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      addToast({
        type: 'success',
        title: '계정 정지 완료',
        message: '사용자 계정이 정지되었습니다.',
      })
      setIsSuspendModalOpen(false)
      setSuspensionReason('')
      setSuspensionDays('30')
    },
    onError: (error: any) => {
      const errorCode = error?.code
      let errorMessage = '계정 정지 중 오류가 발생했습니다.'

      if (errorCode === ERROR_CODES.CANNOT_SUSPEND_SELF) {
        errorMessage = '자기 자신을 정지할 수 없습니다.'
      } else if (errorCode === ERROR_CODES.USER_NOT_FOUND) {
        errorMessage = '사용자를 찾을 수 없습니다.'
      } else if (error?.message) {
        errorMessage = error.message
      }

      addToast({
        type: 'error',
        title: '계정 정지 실패',
        message: errorMessage,
      })

      // 에러 발생 시 모달 닫기
      setIsSuspendModalOpen(false)
      setSelectedUser(null)
      setSuspensionReason('')
      setSuspensionDays('30')
    },
  })

  const unsuspendMutation = useMutation({
    mutationFn: (userId: number) => usersService.unsuspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      addToast({
        type: 'success',
        title: '계정 정지 해제',
        message: '사용자 계정 정지가 해제되었습니다.',
      })
      setIsUnsuspendModalOpen(false)
    },
    onError: () => {
      addToast({
        type: 'error',
        title: '정지 해제 실패',
        message: '계정 정지 해제 중 오류가 발생했습니다.',
      })
    },
  })

  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      keyword: searchKeyword,
      page: 0,
    }))
  }

  const handleFilterChange = (key: keyof UsersQueryParams, value: any) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }))
  }

  const handleSort = (sortBy: UsersQueryParams['sortBy']) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy,
      sortDirection:
        prev.sortBy === sortBy && prev.sortDirection === 'desc'
          ? 'asc'
          : 'desc',
      page: 0,
    }))
  }

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }))
  }

  const openSuspendModal = (user: UserInfo) => {
    setSelectedUser(user)
    setIsSuspendModalOpen(true)
  }

  const openUnsuspendModal = (user: UserInfo) => {
    setSelectedUser(user)
    setIsUnsuspendModalOpen(true)
  }

  const handleSuspend = () => {
    if (selectedUser && suspensionReason) {
      suspendMutation.mutate({
        userId: selectedUser.id,
        reason: suspensionReason,
        days: parseInt(suspensionDays),
      })
    }
  }

  const handleUnsuspend = () => {
    if (selectedUser) {
      unsuspendMutation.mutate(selectedUser.id)
    }
  }

  const formatUserContact = (user: UserInfo) => {
    if (user.provider) {
      return user.email || '-'
    }
    return formatPhoneNumber(user.phoneNumber) || '-'
  }

  const formatPhoneNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return null

    // 숫자만 추출
    const numbers = phoneNumber.replace(/[^0-9]/g, '')

    // 11자리 한국 휴대폰 번호 형식 (010-1234-5678)
    if (numbers.length === 11 && numbers.startsWith('010')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 9)}**`
    }

    // 10자리 지역번호 포함 (02-1234-5678)
    if (numbers.length === 10) {
      if (numbers.startsWith('02')) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 8)}**`
      }
      // 기타 지역번호 (031, 032 등)
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 8)}**`
    }

    // 11자리 기타 번호
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 9)}**`
    }

    // 그 외의 경우 원본 반환 (마스킹만 적용)
    if (numbers.length >= 4) {
      return numbers.slice(0, -2) + '**'
    }

    return phoneNumber
  }

  const getContactIcon = (user: UserInfo) => {
    if (user.provider) {
      return <Mail className="w-3 h-3" />
    }
    return <Phone className="w-3 h-3" />
  }

  const formatProvider = (provider: UserInfo['provider']) => {
    if (!provider) return { text: '자체', iconPath: '/images/app-icon.png' }

    const providerMap: Record<
      string,
      { text: string; iconPath: string }
    > = {
      KAKAO: { text: '카카오', iconPath: '/images/kakao-icon.png' },
      APPLE: { text: '애플', iconPath: '/images/apple-icon.png' },
    }

    return providerMap[provider] || { text: provider, iconPath: null }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const SortIcon = ({ field }: { field: UsersQueryParams['sortBy'] }) => {
    if (queryParams.sortBy !== field) {
      return <ChevronUp className="w-3 h-3 opacity-30" />
    }
    return queryParams.sortDirection === 'desc' ? (
      <ChevronDown className="w-3 h-3 text-primary-500" />
    ) : (
      <ChevronUp className="w-3 h-3 text-primary-500" />
    )
  }

  const resetFilters = () => {
    setQueryParams({
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      status: 'all',
    })
    setSearchKeyword('')
  }

  const hasActiveFilters = () => {
    return (
      searchKeyword ||
      queryParams.searchType ||
      queryParams.status !== 'all' ||
      queryParams.role ||
      queryParams.provider
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (queryParams.status !== 'all') count++
    if (queryParams.role) count++
    if (queryParams.provider) count++
    return count
  }

  const pageInfo = data?.pageInfo
  const users = data?.users || []

  const renderPaginationItems = () => {
    if (!pageInfo) return null

    const items = []
    const currentPage = pageInfo.currentPage
    const totalPages = pageInfo.totalPages

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      items.push(
        <PaginationItem key={0}>
          <PaginationLink
            onClick={() => handlePageChange(0)}
            isActive={currentPage === 0}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )

      if (currentPage > 2) {
        items.push(<PaginationEllipsis key="ellipsis-1" />)
      }

      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (currentPage < totalPages - 3) {
        items.push(<PaginationEllipsis key="ellipsis-2" />)
      }

      items.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages - 1)}
            isActive={currentPage === totalPages - 1}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">사용자 관리</h1>
            <p className="text-neutral-600 mt-2">
              등록된 사용자를 관리하고 계정 상태를 확인하세요
            </p>
          </div>
        </div>
        <Card className="border-semantic-error/20 bg-semantic-error/5">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-semantic-error font-medium">
                사용자 목록을 불러오는 중 오류가 발생했습니다.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            사용자 관리
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            전체 {pageInfo?.totalElements || 0}명
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="sm"
          className="text-neutral-600"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-neutral-200">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="이름, 이메일, 전화번호로 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-white border-neutral-200 h-10"
                />
              </div>
              <Select
                value={queryParams.searchType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'searchType',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger className="w-32 bg-white border-neutral-200 h-10">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="nickname">닉네임</SelectItem>
                  <SelectItem value="email">이메일</SelectItem>
                  <SelectItem value="phone">전화번호</SelectItem>
                  <SelectItem value="loginid">로그인ID</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="bg-primary-500 hover:bg-primary-600 px-6 h-10"
              >
                검색
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="border-neutral-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
                {getActiveFilterCount() > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>

              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-neutral-600"
                >
                  초기화
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          {isFilterExpanded && (
            <div className="bg-neutral-50 rounded-lg p-3 mt-3">
              <div className="flex flex-wrap gap-3">
                <div className="min-w-40">
                  <Label className="text-xs text-neutral-600 mb-1.5 block">
                    상태
                  </Label>
                  <Select
                    value={queryParams.status}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'status',
                        value as UsersQueryParams['status']
                      )
                    }
                  >
                    <SelectTrigger className="bg-white border-neutral-200 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-semantic-success" />
                          활성
                        </div>
                      </SelectItem>
                      <SelectItem value="suspended">
                        <div className="flex items-center gap-2">
                          <Ban className="w-3 h-3 text-semantic-error" />
                          정지
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-40">
                  <Label className="text-xs text-neutral-600 mb-1.5 block">
                    역할
                  </Label>
                  <Select
                    value={queryParams.role || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'role',
                        value === 'all' ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="bg-white border-neutral-200 h-9 text-sm">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          일반 사용자
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-primary-500" />
                          관리자
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-40">
                  <Label className="text-xs text-neutral-600 mb-1.5 block">
                    가입 유형
                  </Label>
                  <Select
                    value={queryParams.provider || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'provider',
                        value === 'all' ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="bg-white border-neutral-200 h-9 text-sm">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="GENERAL">자체</SelectItem>
                      <SelectItem value="KAKAO">카카오</SelectItem>
                      <SelectItem value="APPLE">애플</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-36">
                  <Label className="text-xs text-neutral-600 mb-1.5 block">
                    페이지당 표시
                  </Label>
                  <Select
                    value={queryParams.size?.toString()}
                    onValueChange={(value) =>
                      handleFilterChange('size', parseInt(value))
                    }
                  >
                    <SelectTrigger className="bg-white border-neutral-200 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10개</SelectItem>
                      <SelectItem value="20">20개</SelectItem>
                      <SelectItem value="50">50개</SelectItem>
                      <SelectItem value="100">100개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="border-neutral-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-neutral-50">
              <TableRow className="bg-neutral-50 hover:bg-neutral-50 border-b border-neutral-200">
                <TableHead className="w-16 font-semibold bg-neutral-50">#</TableHead>
                <TableHead
                  onClick={() => handleSort('nickname')}
                  className="cursor-pointer hover:bg-neutral-100 transition-colors font-semibold w-48 bg-neutral-50"
                >
                  <div className="flex items-center gap-1">
                    닉네임
                    <SortIcon field="nickname" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('email')}
                  className="cursor-pointer hover:bg-neutral-100 transition-colors font-semibold w-44 bg-neutral-50"
                >
                  <div className="flex items-center gap-1">
                    연락처
                    <SortIcon field="email" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('role')}
                  className="cursor-pointer hover:bg-neutral-100 transition-colors font-semibold w-28 bg-neutral-50"
                >
                  <div className="flex items-center gap-1">
                    역할
                    <SortIcon field="role" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold w-28 bg-neutral-50">가입 유형</TableHead>
                <TableHead className="font-semibold w-24 bg-neutral-50">상태</TableHead>
                <TableHead
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer hover:bg-neutral-100 transition-colors font-semibold w-32 bg-neutral-50"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    가입일
                    <SortIcon field="createdAt" />
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold w-20 bg-neutral-50">
                  작업
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: queryParams.size }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-3 text-center">
                      <div className="h-4 w-8 bg-neutral-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse" />
                        <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-neutral-300" />
                      <p className="text-neutral-600 font-medium">
                        검색 결과가 없습니다
                      </p>
                      <p className="text-sm text-neutral-500">
                        다른 검색 조건을 시도해보세요
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <TableCell className="text-neutral-600 font-medium py-3">
                      {(pageInfo?.currentPage || 0) *
                        (pageInfo?.pageSize || 20) +
                        index +
                        1}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.imageUrl || '/images/default-profile.png'}
                          alt={user.nickname || ''}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-profile.png'
                          }}
                        />
                        <span className="font-medium text-neutral-900">
                          {user.nickname || '탈퇴한 회원'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2 text-neutral-700">
                        {getContactIcon(user)}
                        <span className="text-sm">
                          {formatUserContact(user)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {user.role === 'ADMIN' ? (
                        <Badge className="bg-primary-500 hover:bg-primary-600 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          ADMIN
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700"
                        >
                          <User className="w-3 h-3 mr-1" />
                          USER
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={formatProvider(user.provider).iconPath}
                          alt={formatProvider(user.provider).text}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-neutral-700">
                          {formatProvider(user.provider).text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {user.suspended ? (
                        <Badge
                          variant="destructive"
                          className="bg-semantic-error/10 text-semantic-error border border-semantic-error/20"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          정지
                        </Badge>
                      ) : (
                        <Badge className="bg-semantic-success/10 text-semantic-success border border-semantic-success/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          활성
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600 py-3">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-neutral-600 hover:text-neutral-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {user.suspended ? (
                              <DropdownMenuItem
                                onClick={() => openUnsuspendModal(user)}
                                className="text-semantic-info focus:text-semantic-info"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                정지 해제
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => openSuspendModal(user)}
                                className="text-semantic-error focus:text-semantic-error"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                계정 정지
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                전체 {pageInfo.totalElements}개 중{' '}
                {pageInfo.currentPage * pageInfo.pageSize + 1}-
                {Math.min(
                  (pageInfo.currentPage + 1) * pageInfo.pageSize,
                  pageInfo.totalElements
                )}
                개 표시
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(0, pageInfo.currentPage - 1))
                      }
                      className={
                        pageInfo.hasPrevious
                          ? 'cursor-pointer hover:bg-white'
                          : 'cursor-not-allowed opacity-50'
                      }
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            pageInfo.totalPages - 1,
                            pageInfo.currentPage + 1
                          )
                        )
                      }
                      className={
                        pageInfo.hasNext
                          ? 'cursor-pointer hover:bg-white'
                          : 'cursor-not-allowed opacity-50'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      {/* Suspend Modal */}
      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-semantic-error" />
              사용자 계정 정지
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">
                {selectedUser?.nickname || '탈퇴한 회원'}
              </span>{' '}
              님의 계정을 정지합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="suspension-days" className="text-sm font-medium">
                정지 기간
              </Label>
              <Select value={suspensionDays} onValueChange={setSuspensionDays}>
                <SelectTrigger id="suspension-days" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1일</SelectItem>
                  <SelectItem value="3">3일</SelectItem>
                  <SelectItem value="7">7일</SelectItem>
                  <SelectItem value="30">30일</SelectItem>
                  <SelectItem value="90">90일</SelectItem>
                  <SelectItem value="365">365일</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="suspension-reason"
                className="text-sm font-medium"
              >
                정지 사유
              </Label>
              <Textarea
                id="suspension-reason"
                placeholder="정지 사유를 입력하세요"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSuspendModalOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={!suspensionReason || suspendMutation.isPending}
              className="bg-semantic-error hover:bg-semantic-error/90"
            >
              {suspendMutation.isPending ? '처리 중...' : '계정 정지'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsuspend Modal */}
      <Dialog
        open={isUnsuspendModalOpen}
        onOpenChange={setIsUnsuspendModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-semantic-info" />
              계정 정지 해제
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">
                {selectedUser?.nickname || '탈퇴한 회원'}
              </span>{' '}
              님의 계정 정지를 해제합니다.
            </DialogDescription>
          </DialogHeader>
          {selectedUser?.suspensionReason && (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    정지 사유
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedUser.suspensionReason}
                  </p>
                </div>
                {selectedUser.suspendedUntil && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      정지 해제 예정일
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      {formatDate(selectedUser.suspendedUntil)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnsuspendModalOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleUnsuspend}
              disabled={unsuspendMutation.isPending}
              className="bg-semantic-info hover:bg-semantic-info/90 text-white"
            >
              {unsuspendMutation.isPending ? '처리 중...' : '정지 해제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
