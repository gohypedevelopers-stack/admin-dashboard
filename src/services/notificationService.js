import { apiRequest } from '../utils/api';

export const notificationService = {
  getAllNotifications: async () => {
    return apiRequest('/api/admin/notifications');
  },

  sendNotification: async (payload) => {
    return apiRequest('/api/admin/notifications/send', {
      method: 'POST',
      body: payload,
    });
  },

  deleteNotification: async (notificationId) => {
    return apiRequest(`/api/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  searchUsers: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=20` : '?limit=20';
    return apiRequest(`/api/admin/users${query}`);
  },
};
