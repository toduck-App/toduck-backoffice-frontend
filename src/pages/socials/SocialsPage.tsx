import React, { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { socialsService } from '@/services/socials'
import { SocialListItem, SocialDetail, SocialsQueryParams, SocialsListResponse } from '@/types/social'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  RefreshCw,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  ChevronDown,
  X,
  FileText,
  Smartphone,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 카테고리 이름 매핑
const CATEGORY_NAME_MAP: Record<string, string> = {
  'CONCENTRATION': '집중력',
  'MEMORY': '기억력',
  'IMPULSE': '실수',
  'ANXIETY': '불안',
  'SLEEP': '정보',
  'GENERAL': '기타',
}

const mapCategoryName = (name: string): string => {
  return CATEGORY_NAME_MAP[name.toUpperCase()] || CATEGORY_NAME_MAP[name] || name
}

export default function SocialsPage() {
  const queryClient = useQueryClient()
  const [queryParams, setQueryParams] = useState<SocialsQueryParams>({
    limit: 20,
  })
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchKeyword, setActiveSearchKeyword] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [selectedSocial, setSelectedSocial] = useState<SocialListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 페이지네이션용 상태
  const [allSocials, setAllSocials] = useState<SocialListItem[]>([])
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // 카테고리 목록 조회
  const { data: categoriesData } = useQuery({
    queryKey: ['social-categories'],
    queryFn: () => socialsService.getCategories(),
  })

  // 게시글 목록 조회 (초기 로드)
  const { data: socialsData, isLoading, error, refetch } = useQuery({
    queryKey: ['socials', activeSearchKeyword, selectedCategoryIds],
    queryFn: () => {
      if (activeSearchKeyword) {
        return socialsService.searchSocials({
          keyword: activeSearchKeyword,
          limit: queryParams.limit,
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        })
      }
      return socialsService.getSocials({
        limit: queryParams.limit,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      })
    },
  })

  // 게시글 상세 조회
  const { data: socialDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['social-detail', selectedSocial?.socialId],
    queryFn: () => socialsService.getSocialDetail(selectedSocial!.socialId),
    enabled: !!selectedSocial,
  })

  // 초기 데이터 설정
  useEffect(() => {
    if (socialsData && socialsData.results) {
      setAllSocials(socialsData.results)
      setHasMore(socialsData.hasMore)
      setCursor(socialsData.nextCursor ?? undefined)
    } else {
      setAllSocials([])
      setHasMore(false)
    }
  }, [socialsData])

  // 더 불러오기 함수
  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !cursor) return

    setIsLoadingMore(true)
    try {
      let response: SocialsListResponse
      if (activeSearchKeyword) {
        response = await socialsService.searchSocials({
          keyword: activeSearchKeyword,
          cursor,
          limit: queryParams.limit,
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        })
      } else {
        response = await socialsService.getSocials({
          cursor,
          limit: queryParams.limit,
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        })
      }

      if (response.results && response.results.length > 0) {
        setAllSocials(prev => [...prev, ...response.results])
        setHasMore(response.hasMore)
        setCursor(response.nextCursor ?? undefined)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more socials:', error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSearch = () => {
    const keyword = searchInput.trim()
    setActiveSearchKeyword(keyword)
    setCursor(undefined)
    setHasMore(true)
    setSelectedSocial(null)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setActiveSearchKeyword('')
    setCursor(undefined)
    setHasMore(true)
    setSelectedSocial(null)
  }

  const handleDeleteSocial = async (socialId: number) => {
    if (isDeleting) return
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      await socialsService.deleteSocial(socialId)
      // 목록에서 제거
      setAllSocials(prev => prev.filter(s => s.socialId !== socialId))
      // 선택된 게시글이면 선택 해제
      if (selectedSocial?.socialId === socialId) {
        setSelectedSocial(null)
      }
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['socials'] })
    } catch (error) {
      console.error('Failed to delete social:', error)
      alert('게시글 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      return [...prev, categoryId]
    })
    setCursor(undefined)
    setHasMore(true)
    setSelectedSocial(null)
  }

  const handleClearCategories = () => {
    setSelectedCategoryIds([])
    setCursor(undefined)
    setHasMore(true)
    setSelectedSocial(null)
  }

  const handleRefresh = () => {
    setCursor(undefined)
    setHasMore(true)
    setSelectedSocial(null)
    refetch()
  }

  const selectSocial = (social: SocialListItem) => {
    setSelectedSocial(social)
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const categories = categoriesData?.categories || []

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">게시글 관리</h1>
            <p className="text-neutral-600 mt-2">등록된 게시글을 조회하세요</p>
          </div>
        </div>
        <Card className="border-semantic-error/20 bg-semantic-error/5">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-semantic-error font-medium">
                게시글 목록을 불러오는 중 오류가 발생했습니다.
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">게시글 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">
            커뮤니티 게시글을 조회하고 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-neutral-100">
            {allSocials.length}개 로드됨
          </Badge>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Posts List */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Search and Filter - Compact */}
          <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <Input
                  placeholder="검색..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8 h-8 text-sm bg-white border-neutral-200"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} size="sm" className="h-8 px-3 text-xs">
                검색
              </Button>

              <div className="h-5 w-px bg-neutral-200" />

              {/* Filter */}
              <Button
                variant={isFilterExpanded ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="h-8 text-xs"
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                카테고리
                {selectedCategoryIds.length > 0 && (
                  <span className="ml-1 w-4 h-4 flex items-center justify-center text-[10px] bg-primary-500 text-white rounded-full">
                    {selectedCategoryIds.length}
                  </span>
                )}
              </Button>

              {(selectedCategoryIds.length > 0 || activeSearchKeyword) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleClearCategories()
                    handleClearSearch()
                  }}
                  className="h-8 text-xs text-neutral-500"
                >
                  초기화
                </Button>
              )}
            </div>

            {/* Category Filter Expanded */}
            {isFilterExpanded && (
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((category) => (
                    <button
                      key={category.socialCategoryId}
                      onClick={() => handleCategoryToggle(category.socialCategoryId)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                        selectedCategoryIds.includes(category.socialCategoryId)
                          ? 'bg-primary-500 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      )}
                    >
                      {mapCategoryName(category.name)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(activeSearchKeyword || selectedCategoryIds.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-neutral-100">
                {activeSearchKeyword && (
                  <Badge variant="secondary" className="gap-1 text-xs h-6">
                    <Search className="w-3 h-3" />
                    {activeSearchKeyword}
                    <button onClick={handleClearSearch} className="ml-0.5 hover:bg-neutral-200 rounded p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategoryIds.map((categoryId) => {
                  const category = categories.find((c) => c.socialCategoryId === categoryId)
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="gap-1 text-xs h-6">
                      {mapCategoryName(category.name)}
                      <button onClick={() => handleCategoryToggle(categoryId)} className="ml-0.5 hover:bg-neutral-200 rounded p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-neutral-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-neutral-200 rounded" />
                        <div className="h-3 w-full bg-neutral-200 rounded" />
                        <div className="h-3 w-2/3 bg-neutral-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allSocials.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <FileText className="w-16 h-16 text-neutral-200 mb-4" />
                <p className="text-neutral-600 font-medium">게시글이 없습니다</p>
                <p className="text-sm text-neutral-400 mt-1">
                  {activeSearchKeyword ? '다른 검색어를 시도해보세요' : '아직 등록된 게시글이 없습니다'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {allSocials.map((social) => (
                  <div
                    key={social.socialId}
                    className={cn(
                      'p-3 transition-all hover:bg-neutral-50 group',
                      selectedSocial?.socialId === social.socialId &&
                        'bg-orange-50/50 hover:bg-orange-50/50 shadow-[inset_3px_0_0_0_rgb(249,115,22)]'
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Profile Image */}
                      <img
                        src={social.owner?.profileImageUrl || '/images/default-profile.png'}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 cursor-pointer"
                        onClick={() => selectSocial(social)}
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-profile.png'
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectSocial(social)}>
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-neutral-900 text-[13px]">
                            {social.owner?.nickname || '익명'}
                          </span>
                          <span className="text-neutral-500 text-[11px]">
                            {formatRelativeTime(social.createdAt)}
                          </span>
                        </div>

                        {/* Title */}
                        {social.title && (
                          <p className="font-medium text-neutral-800 text-[13px] mb-0.5 line-clamp-1">
                            {social.title}
                          </p>
                        )}

                        {/* Content Preview */}
                        <p className="text-neutral-600 text-[12px] line-clamp-2 mb-1.5">
                          {social.content}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Categories */}
                          {social.categories && social.categories.length > 0 && (
                            <div className="flex gap-1 flex-shrink-0">
                              {social.categories.slice(0, 2).map((cat) => (
                                <span
                                  key={cat.socialCategoryId}
                                  className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-full"
                                >
                                  {mapCategoryName(cat.name)}
                                </span>
                              ))}
                              {social.categories.length > 2 && (
                                <span className="text-[10px] text-neutral-500">
                                  +{social.categories.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-neutral-500 flex-shrink-0">
                            {social.hasImages && (
                              <span className="flex items-center gap-0.5 text-[10px]">
                                <ImageIcon className="w-3 h-3" />
                                {social.images?.length || 0}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[10px]">
                              <Heart className="w-3 h-3" />
                              {social.socialLikeInfo?.likeCount ?? 0}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px]">
                              <MessageCircle className="w-3 h-3" />
                              {social.commentCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu - Top Right */}
                      <div className="flex-shrink-0 self-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSocial(social.socialId)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && !isLoading && allSocials.length > 0 && (
            <div className="p-3 border-t border-neutral-100 bg-neutral-50">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                variant="ghost"
                className="w-full h-9 text-neutral-600"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    불러오는 중...
                  </>
                ) : (
                  <>
                    더 불러오기
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Preview Panel - iPhone 17 Pro Style */}
        <div className="w-[420px] flex-shrink-0 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* iPhone Frame */}
            <div className="relative">
              {/* Titanium Frame with gradient - White Titanium */}
              <div
                className="relative w-[340px] h-[700px] rounded-[55px] p-[2px]"
                style={{
                  background: 'linear-gradient(145deg, #F5F5F3 0%, #E8E6E3 20%, #D4D2CF 50%, #E8E6E3 80%, #F5F5F3 100%)',
                  boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.2), 0 30px 60px -30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                {/* Inner black bezel */}
                <div className="w-full h-full bg-[#1a1a1a] rounded-[53px] p-[8px]">
                  {/* Screen */}
                  <div className="relative w-full h-full bg-white rounded-[46px] overflow-hidden flex flex-col">
                    {/* Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20">
                      <div
                        className="w-[120px] h-[28px] bg-black rounded-full flex items-center justify-end pr-[10px]"
                        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
                      >
                        {/* Camera - Right side */}
                        <div className="w-[9px] h-[9px] rounded-full bg-[#1a1a2e] ring-1 ring-[#2a2a3e]">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2a3a5a] to-[#1a2a4a] flex items-center justify-center">
                            <div className="w-[3px] h-[3px] rounded-full bg-[#4a5a7a]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedSocial ? (
                      <>
                        {/* Status Bar */}
                        <div className="h-[36px] bg-white flex items-end justify-between px-7 pb-1 flex-shrink-0">
                          <span className="text-[11px] font-semibold text-neutral-900">
                            {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Signal */}
                            <div className="flex items-end gap-[1.5px] h-[10px]">
                              <div className="w-[2.5px] h-[3px] bg-neutral-900 rounded-sm" />
                              <div className="w-[2.5px] h-[5px] bg-neutral-900 rounded-sm" />
                              <div className="w-[2.5px] h-[7px] bg-neutral-900 rounded-sm" />
                              <div className="w-[2.5px] h-[10px] bg-neutral-900 rounded-sm" />
                            </div>
                            {/* WiFi - iOS Style */}
                            <svg className="w-[12px] h-[9px] text-neutral-900 ml-1" viewBox="0 0 24 19" fill="currentColor">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 15a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-4.24-3.17a6 6 0 0 1 8.48 0 1 1 0 1 1-1.42 1.42 4 4 0 0 0-5.64 0 1 1 0 0 1-1.42-1.42Zm-3.54-3.54a10 10 0 0 1 15.56 0 1 1 0 1 1-1.42 1.42 8 8 0 0 0-12.72 0 1 1 0 0 1-1.42-1.42Zm-3.54-3.53a14 14 0 0 1 22.64 0 1 1 0 1 1-1.42 1.42 12 12 0 0 0-19.8 0A1 1 0 0 1 .68 4.76Z"/>
                            </svg>
                            {/* Battery */}
                            <div className="flex items-center gap-[1px] ml-0.5">
                              <div className="w-[20px] h-[10px] border border-neutral-900 rounded-[2px] p-[1px]">
                                <div className="w-full h-full bg-neutral-900 rounded-[1px]" />
                              </div>
                              <div className="w-[1.5px] h-[4px] bg-neutral-900 rounded-r-sm" />
                            </div>
                          </div>
                        </div>

                        {/* App Header */}
                        <div className="px-4 py-3 bg-white flex items-center justify-between flex-shrink-0">
                          <button className="text-neutral-500">
                            <ChevronDown className="w-5 h-5 rotate-90" />
                          </button>
                          <button className="text-neutral-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F5F5] flex flex-col">
                          {isDetailLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <RefreshCw className="w-5 h-5 animate-spin text-neutral-300" />
                            </div>
                          ) : socialDetail ? (
                            <>
                              {/* Main Post Section */}
                              <div className="px-4 pt-2 pb-4 bg-white rounded-b-xl">
                                {/* Author */}
                                <div className="flex items-center gap-2 mb-2.5">
                                  <img
                                    src={socialDetail.owner?.profileImageUrl || '/images/default-profile.png'}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/images/default-profile.png'
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[12px] text-neutral-800">
                                      {socialDetail.owner?.nickname || '익명'}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                      {formatRelativeTime(socialDetail.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                {/* Title */}
                                {socialDetail.title && (
                                  <h3 className="font-bold text-[13px] text-neutral-900 mb-1.5">
                                    {socialDetail.title}
                                  </h3>
                                )}

                                {/* Content */}
                                <p className="text-[12px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                                  {socialDetail.content}
                                </p>

                                {/* Routine */}
                                {socialDetail.routine && (
                                  <div className="bg-neutral-50 rounded-xl p-3 mt-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: socialDetail.routine.color || '#6B7280' }}
                                      />
                                      <span className="text-[12px] font-medium text-neutral-700">{socialDetail.routine.title}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Images */}
                                {socialDetail.hasImages && socialDetail.images && socialDetail.images.length > 0 && (
                                  <div className="flex gap-1.5 mt-3 overflow-x-auto">
                                    {socialDetail.images.map((image) => (
                                      <img
                                        key={image.socialImageId}
                                        src={image.url}
                                        alt=""
                                        className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
                                      />
                                    ))}
                                  </div>
                                )}

                                {/* Action Bar */}
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100">
                                  <button className="flex items-center gap-1 text-neutral-400">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-[10px]">{socialDetail.comments?.length ?? 0}</span>
                                  </button>
                                  <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-1 text-neutral-400">
                                      <Heart className="w-4 h-4" />
                                      <span className="text-[10px]">{socialDetail.socialLikeInfo?.likeCount ?? 0}</span>
                                    </button>
                                    <button className="text-neutral-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                      </svg>
                                    </button>
                                    <button className="text-neutral-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Comments Section - One big card */}
                              {socialDetail.comments && socialDetail.comments.length > 0 && (
                                <div className="flex-1 bg-[#F5F5F5] px-2 py-2">
                                  <div className="bg-white rounded-xl">
                                    {socialDetail.comments.map((comment) => (
                                      <div
                                        key={comment.commentId}
                                        className={cn(
                                          "p-3",
                                          comment.isReply && "pl-10 bg-neutral-50/50"
                                        )}
                                      >
                                        <div className="flex gap-2.5">
                                          <img
                                            src={comment.owner?.profileImageUrl || '/images/default-profile.png'}
                                            alt=""
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            onError={(e) => {
                                              e.currentTarget.src = '/images/default-profile.png'
                                            }}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-0.5">
                                              <div>
                                                <p className="font-medium text-[12px] text-neutral-800">
                                                  {comment.owner?.nickname || '익명'}
                                                </p>
                                                <p className="text-[10px] text-neutral-400">
                                                  {formatRelativeTime(comment.createdAt)}
                                                </p>
                                              </div>
                                              <button className="text-neutral-300">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                  <circle cx="12" cy="5" r="1.5" />
                                                  <circle cx="12" cy="12" r="1.5" />
                                                  <circle cx="12" cy="19" r="1.5" />
                                                </svg>
                                              </button>
                                            </div>
                                            <p className="text-[12px] text-neutral-700 leading-relaxed">
                                              {comment.content}
                                            </p>
                                            {comment.hasImage && comment.imageUrl && (
                                              <img
                                                src={comment.imageUrl}
                                                alt=""
                                                className="mt-2 w-24 h-24 object-cover rounded-lg"
                                              />
                                            )}
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <button className="flex items-center gap-1 text-neutral-400">
                                                <MessageCircle className="w-4 h-4" />
                                                <span className="text-[10px]">{comment.replyCount ?? 0}</span>
                                              </button>
                                              <button className={cn(
                                                "flex items-center gap-1",
                                                (comment.commentLikeInfo?.likeCount ?? 0) > 0 ? "text-orange-400" : "text-neutral-400"
                                              )}>
                                                <Heart className={cn("w-4 h-4", (comment.commentLikeInfo?.likeCount ?? 0) > 0 && "fill-orange-400")} />
                                                <span className="text-[10px]">{comment.commentLikeInfo?.likeCount ?? 0}</span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : null}
                        </div>

                        {/* Bottom Comment Input */}
                        <div className="bg-white px-4 py-3 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
                          <button className="text-neutral-300 flex-shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </button>
                          <span className="flex-1 text-[13px] text-neutral-400">댓글을 남겨주세요</span>
                          <button className="text-neutral-800 text-[13px] font-medium flex-shrink-0">
                            등록
                          </button>
                        </div>

                        {/* Home Indicator */}
                        <div className="h-6 bg-white flex items-center justify-center flex-shrink-0">
                          <div className="w-28 h-1 bg-neutral-900 rounded-full" />
                        </div>
                      </>
                    ) : (
                  <>
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 p-6">
                      <Smartphone className="w-10 h-10 mb-3 opacity-50" />
                      <p className="text-[11px] text-center leading-relaxed">
                        좌측에서 게시글을 선택하면<br />
                        앱 화면 미리보기가 표시됩니다
                      </p>
                    </div>
                    {/* Home Indicator - Fixed at bottom */}
                    <div className="h-7 bg-white flex items-center justify-center flex-shrink-0">
                      <div className="w-28 h-1 bg-neutral-200 rounded-full" />
                    </div>
                  </>
                )}
                  </div>
                </div>
              </div>

              {/* Side Buttons - Left */}
              <div className="absolute left-[-2px] top-[140px] w-[3px] h-[32px] bg-gradient-to-r from-[#B8B4AE] to-[#9A9590] rounded-l-sm" />
              <div className="absolute left-[-2px] top-[190px] w-[3px] h-[60px] bg-gradient-to-r from-[#B8B4AE] to-[#9A9590] rounded-l-sm" />
              <div className="absolute left-[-2px] top-[265px] w-[3px] h-[60px] bg-gradient-to-r from-[#B8B4AE] to-[#9A9590] rounded-l-sm" />

              {/* Side Button - Right (Power) */}
              <div className="absolute right-[-2px] top-[200px] w-[3px] h-[80px] bg-gradient-to-l from-[#B8B4AE] to-[#9A9590] rounded-r-sm" />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
