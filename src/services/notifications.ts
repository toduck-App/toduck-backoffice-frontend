import { apiClient } from './api'
import { API_ENDPOINTS } from '@/types/api'
import {
  BroadcastNotification,
  NotificationListResponse,
  BroadcastNotificationCreateRequest,
  NotificationStatisticsResponse
} from '@/types/notification'

class NotificationsService {
  async getNotifications(): Promise<NotificationListResponse> {
    return apiClient.get<NotificationListResponse>(API_ENDPOINTS.NOTIFICATIONS);
  }

  async createNotification(data: BroadcastNotificationCreateRequest): Promise<BroadcastNotification> {
    const requestData = {
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      scheduledAt: data.scheduledAt || null,
    };

    return apiClient.post<BroadcastNotification>(API_ENDPOINTS.NOTIFICATIONS, requestData);
  }

  async cancelNotification(id: number): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.CANCEL_NOTIFICATION(id))
  }

  async getNotificationStatistics(): Promise<NotificationStatisticsResponse> {
    return apiClient.get<NotificationStatisticsResponse>(API_ENDPOINTS.NOTIFICATION_STATISTICS)
  }

}

export const notificationsService = new NotificationsService()
export default notificationsService