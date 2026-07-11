import { API_ENDPOINTS } from "../utils/constants";
import { apiHelper } from "../utils/apiHelper";

export interface INotification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  type: 'LIKE_POST' | 'COMMENT_POST' | 'REPLY_COMMENT' | 'POST_APPROVED' | 'SYSTEM';
  content?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const NotificationController = {
  getList: async (): Promise<INotification[]> => {
    try {
      const response = await apiHelper.get<INotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
      return response;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<INotification> => {
    try {
      const response = await apiHelper.put<INotification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      return response;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiHelper.put<{ success: boolean; message: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return response;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};
