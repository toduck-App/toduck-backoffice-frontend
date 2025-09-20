import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileX,
  Calendar,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Search,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usersService } from '@/services/users'
import { DeletionLog, DELETION_REASON_LABELS } from '@/types/user'

interface DeletionLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SortOrder = 'newest' | 'oldest'

export function DeletionLogsModal({
  open,
  onOpenChange,
}: DeletionLogsModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 10

  const { data: deletionLogsResponse, isLoading } = useQuery({
    queryKey: ['deletion-logs'],
    queryFn: () => usersService.getDeletionLogs({ page: 1, size: 200 }),
    enabled: open,
  })

  const deletionLogs = deletionLogsResponse?.deletionLogs || []

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(deletionLogs.map((log) => log.reasonCode))
    return Array.from(uniqueCategories)
  }, [deletionLogs])

  // Filter and sort logs
  const processedLogs = useMemo(() => {
    let filtered = [...deletionLogs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.userId.toString().includes(searchQuery) ||
          log.reasonText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.reasonDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((log) =>
        selectedCategories.includes(log.reasonCode)
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.deletedAt).getTime()
      const dateB = new Date(b.deletedAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [deletionLogs, selectedCategories, sortOrder, searchQuery])

  // Pagination
  const totalPages = Math.ceil(processedLogs.length / itemsPerPage)
  const paginatedLogs = processedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [selectedCategories, sortOrder, searchQuery])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '.')
  }

  const getReasonStyle = (reasonCode: string) => {
    switch (reasonCode) {
      case 'HARD_TO_USE':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'NO_FEATURES':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'MANY_ERRORS':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'BETTER_APP':
        return 'bg-violet-50 text-violet-700 border-violet-200'
      case 'SWITCH_ACCOUNT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'OTHER':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              탈퇴 사유 상세보기
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-[220px] border-gray-200 focus:border-gray-400"
                />
              </div>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 hover:bg-gray-50 cursor-pointer"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    탈퇴 사유
                    {selectedCategories.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 px-1.5 bg-blue-100 text-blue-700"
                      >
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  <div className="px-3 py-2 text-sm font-medium text-gray-700">
                    탈퇴 사유 필터
                  </div>
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <span className="text-sm">
                        {
                          DELETION_REASON_LABELS[
                            category as keyof typeof DELETION_REASON_LABELS
                          ]
                        }
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                  {categories.length > 0 && selectedCategories.length > 0 && (
                    <>
                      <div className="h-px bg-gray-100 my-1" />
                      <DropdownMenuItem
                        onClick={() => setSelectedCategories([])}
                        className="text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        필터 초기화
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 hover:bg-gray-50 cursor-pointer"
                  >
                    {sortOrder === 'newest' ? '최신순' : '오래된순'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[120px]">
                  <DropdownMenuItem
                    onClick={() => setSortOrder('newest')}
                    className={`cursor-pointer hover:bg-gray-50 ${sortOrder === 'newest' ? 'bg-gray-100' : ''}`}
                  >
                    최신순
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOrder('oldest')}
                    className={`cursor-pointer hover:bg-gray-50 ${sortOrder === 'oldest' ? 'bg-gray-100' : ''}`}
                  >
                    오래된순
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-sm text-muted-foreground">
              총 {processedLogs.length}개
            </div>
          </div>

          {/* Table */}
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : processedLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategories.length > 0
                    ? '검색 조건에 맞는 결과가 없습니다.'
                    : '아직 탈퇴 기록이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-10 w-[100px] text-center min-w-[100px]">
                          사용자 ID
                        </TableHead>
                        <TableHead className="h-10 w-[120px] text-center min-w-[120px]">
                          탈퇴 일시
                        </TableHead>
                        <TableHead className="h-10 w-[140px] min-w-[140px]">탈퇴 사유</TableHead>
                        <TableHead className="h-10 min-w-[200px]">추가 의견</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="py-3 text-center">
                            <span className="font-medium text-sm">{log.userId}</span>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDate(log.deletedAt)}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className={`border ${getReasonStyle(log.reasonCode)} whitespace-nowrap`}
                            >
                              {
                                DELETION_REASON_LABELS[
                                  log.reasonCode as keyof typeof DELETION_REASON_LABELS
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            {log.reasonText ? (
                              <div className="text-sm text-muted-foreground max-w-[300px] break-words">
                                {log.reasonText}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 border-t p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {processedLogs.length}개 중 {(currentPage - 1) * itemsPerPage + 1}
                -{Math.min(currentPage * itemsPerPage, processedLogs.length)}개
                표시
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {[...Array(Math.min(7, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 7) {
                      pageNum = i + 1
                    } else if (currentPage <= 4) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null

                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}