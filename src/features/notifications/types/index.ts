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
  'SUPPORT_CONTACT_CHANGED',
  'APPOINTMENT_BOOKED',
  'APPOINTMENT_RESCHEDULED',
  'APPOINTMENT_CANCELLED',
  'CUSTOMIZATION_REQUESTED',
  'SERVICE_ORDER_PLACED',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

/**
 * What a SERVICE_ORDER_PLACED notification carries in `data` — the whole order,
 * since for now the notification is where an owner reads orders closed in chat.
 */
export interface ServiceOrderNotificationData {
  serviceOrderId: string;
  orderLabel: string;
  leadId: string;
  conversationId: string | null;
  customer: {
    name: string | null;
    phone: string;
    email: string | null;
    businessName: string | null;
  };
  lines: { serviceName: string; planName: string; text: string }[];
  priceSummary: string;
  briefAnswers: { label: string; value: string }[];
  briefSummary: string | null;
  notes: string | null;
}

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
  whatsapp: z.boolean(),
});
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;

/** Notification payloads on the app-wide /events SSE stream. */
export type NotificationStreamEvent =
  | { type: 'unread-count'; count: number }
  | { type: 'notification'; notification: Notification };
