import { z } from 'zod';

// Mirror of the server `NotificationType` enum.
export const notificationTypeSchema = z.enum([
  'NEW_MESSAGE',
  'CHAT_ESCALATED',
  'NEW_LEAD',
  'LEAD_ASSIGNED',
  'ORDER_CREATED',
  'ORDER_STATUS_CHANGED',
  'MEMBER_INVITED',
  'MEMBER_JOINED',
  'BROADCAST_COMPLETED',
  'NEW_LOGIN',
  'BILLING',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  tenantId: z.string().nullable().optional(),
  userId: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string().nullable().optional(),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  isRead: z.boolean(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const notificationPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  inApp: z.boolean(),
  email: z.boolean(),
});
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;

/** SSE payloads from /notifications/stream. */
export type NotificationStreamEvent =
  | { type: 'unread-count'; count: number }
  | { type: 'notification'; notification: Notification };
