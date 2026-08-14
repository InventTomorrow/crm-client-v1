import { apiClient } from '@/lib/apiClient';
import type { Notification, NotificationPreference, NotificationType } from '../types';

export async function getNotifications(params: { cursor?: string; limit?: number; unreadOnly?: boolean }) {
  const res = await apiClient.get<{ success: true; data: Notification[] }>('/notifications', { params });
  return res.data.data;
}

export async function getUnreadCount() {
  const res = await apiClient.get<{ success: true; data: { count: number } }>('/notifications/unread-count');
  return res.data.data.count;
}

export async function markNotificationRead(id: string) {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await apiClient.post('/notifications/read-all');
  return res.data;
}

export async function getNotificationPreferences() {
  const res = await apiClient.get<{ success: true; data: NotificationPreference[] }>('/notifications/preferences');
  return res.data.data;
}

export async function updateNotificationPreference(patch: {
  type: NotificationType;
  inApp?: boolean;
  email?: boolean;
  whatsapp?: boolean;
}) {
  const res = await apiClient.patch<{ success: true; data: NotificationPreference }>('/notifications/preferences', patch);
  return res.data.data;
}
