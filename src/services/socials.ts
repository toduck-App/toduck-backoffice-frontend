import { apiClient } from './api'
import { API_ENDPOINTS } from '@/types/api'
import {
  SocialListItem,
  SocialDetail,
  SocialsQueryParams,
  SocialSearchParams,
  SocialCategoryListResponse,
  SocialsListResponse,
} from '@/types/social'

class SocialsService {
  async getSocials(params?: SocialsQueryParams): Promise<SocialsListResponse> {
    const queryParams: Record<string, any> = {}

    if (params?.cursor) {
      queryParams.cursor = params.cursor
    }
    if (params?.limit) {
      queryParams.limit = params.limit
    }
    if (params?.categoryIds && params.categoryIds.length > 0) {
      queryParams.categoryIds = params.categoryIds.join(',')
    }

    const result = await apiClient.get<any>(API_ENDPOINTS.SOCIALS, queryParams)

    // API returns { hasMore, nextCursor, results: [...] }
    if (result && typeof result === 'object' && Array.isArray(result.results)) {
      return {
        hasMore: result.hasMore ?? false,
        nextCursor: result.nextCursor ?? null,
        results: result.results as SocialListItem[],
      }
    }

    // Fallback for unexpected response
    return {
      hasMore: false,
      nextCursor: null,
      results: [],
    }
  }

  async getSocialDetail(socialId: number): Promise<SocialDetail> {
    return apiClient.get<SocialDetail>(API_ENDPOINTS.SOCIAL_DETAIL(socialId))
  }

  async searchSocials(params: SocialSearchParams): Promise<SocialsListResponse> {
    const queryParams: Record<string, any> = {
      keyword: params.keyword,
    }

    if (params.cursor) {
      queryParams.cursor = params.cursor
    }
    if (params.limit) {
      queryParams.limit = params.limit
    }
    if (params.categoryIds && params.categoryIds.length > 0) {
      queryParams.categoryIds = params.categoryIds.join(',')
    }

    const result = await apiClient.get<any>(API_ENDPOINTS.SOCIAL_SEARCH, queryParams)

    // API returns { hasMore, nextCursor, results: [...] }
    if (result && typeof result === 'object' && Array.isArray(result.results)) {
      return {
        hasMore: result.hasMore ?? false,
        nextCursor: result.nextCursor ?? null,
        results: result.results as SocialListItem[],
      }
    }

    return {
      hasMore: false,
      nextCursor: null,
      results: [],
    }
  }

  async getCategories(): Promise<SocialCategoryListResponse> {
    return apiClient.get<SocialCategoryListResponse>(API_ENDPOINTS.SOCIAL_CATEGORIES)
  }

  async deleteSocial(socialId: number): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.SOCIAL_DELETE(socialId))
  }
}

export const socialsService = new SocialsService()
export default socialsService
