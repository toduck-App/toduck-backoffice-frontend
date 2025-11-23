// Social Post Types

export interface SocialOwner {
  ownerId: number
  nickname: string | null
  profileImageUrl: string | null
}

export interface SocialCategory {
  socialCategoryId: number
  name: string
}

export interface SocialImage {
  socialImageId: number
  url: string
}

export interface SocialLikeInfo {
  isLikedByMe: boolean
  likeCount: number
}

export interface CommentLikeInfo {
  isLikedByMe: boolean
  likeCount: number
}

export interface SocialComment {
  commentId: number
  parentCommentId: number | null
  owner: SocialOwner
  hasImage: boolean
  imageUrl: string | null
  content: string
  commentLikeInfo: CommentLikeInfo
  isReply: boolean
  createdAt: string
}

export interface SocialRoutine {
  routineId: number
  category: string
  color: string | null
  title: string
  time: string | null
  isPublic: boolean
  isInDeletedState: boolean
  daysOfWeek: string[]
  memo: string | null
  reminderTime: string | null
}

// 게시글 목록 조회 응답 (요약 정보)
export interface SocialListItem {
  socialId: number
  owner: SocialOwner
  routine: SocialRoutine | null
  title: string | null
  content: string
  hasImages: boolean
  images: SocialImage[]
  socialLikeInfo: SocialLikeInfo
  commentCount: number
  categories: SocialCategory[]
  createdAt: string
}

// 게시글 상세 조회 응답
export interface SocialDetail {
  socialId: number
  owner: SocialOwner
  routine: SocialRoutine | null
  title: string | null
  content: string
  hasImages: boolean
  images: SocialImage[]
  socialLikeInfo: SocialLikeInfo
  comments: SocialComment[]
  createdAt: string
}

// 게시글 목록 조회 파라미터 (커서 기반)
export interface SocialsQueryParams {
  cursor?: number
  limit?: number
  categoryIds?: number[]
}

// 게시글 검색 파라미터
export interface SocialSearchParams extends SocialsQueryParams {
  keyword: string
}

// 게시글 목록/검색 응답
export interface SocialsListResponse {
  hasMore: boolean
  nextCursor: number | null
  results: SocialListItem[]
}

// 카테고리 목록 응답
export interface SocialCategoryListResponse {
  categories: SocialCategory[]
}
