import type { NotificationType } from '../types';

/**
 * Every notification type in display order, with the server-side default
 * delivery channels. The preferences endpoint only returns rows the user has
 * actually changed, so the UI drives off this list and falls back to these.
 */
export const NOTIFICATION_PREFERENCE_META: Record<
  NotificationType,
  { title: string; description: string; inAppDefault: boolean; emailDefault: boolean }
> = {
  NEW_MESSAGE: {
    title: 'New message',
    description: 'When a lead sends you a new message.',
    inAppDefault: false,
    emailDefault: false,
  },
  CHAT_ESCALATED: {
    title: 'Chat escalated',
    description: 'When a conversation is flagged for human attention.',
    inAppDefault: true,
    emailDefault: false,
  },
  NEW_LEAD: {
    title: 'New lead',
    description: 'When a new lead is created or imported.',
    inAppDefault: true,
    emailDefault: false,
  },
  LEAD_ASSIGNED: {
    title: 'Lead assigned',
    description: 'When a lead is assigned to you.',
    inAppDefault: true,
    emailDefault: false,
  },
  ORDER_CREATED: {
    title: 'Order created',
    description: 'When a new order is placed.',
    inAppDefault: true,
    emailDefault: false,
  },
  ORDER_STATUS_CHANGED: {
    title: 'Order status changed',
    description: 'When an order moves to a new status.',
    inAppDefault: true,
    emailDefault: false,
  },
  MEMBER_INVITED: {
    title: 'Member invited',
    description: 'When someone is invited to your workspace.',
    inAppDefault: true,
    emailDefault: true,
  },
  MEMBER_JOINED: {
    title: 'Member joined',
    description: 'When an invited member accepts and joins.',
    inAppDefault: true,
    emailDefault: false,
  },
  BROADCAST_COMPLETED: {
    title: 'Broadcast completed',
    description: 'When a broadcast campaign finishes sending.',
    inAppDefault: true,
    emailDefault: false,
  },
  NEW_LOGIN: {
    title: 'New sign-in',
    description: 'When your account is accessed from a new device.',
    inAppDefault: true,
    emailDefault: true,
  },
  BILLING: {
    title: 'Billing',
    description: 'Payment confirmations and plan changes.',
    inAppDefault: true,
    emailDefault: true,
  },
  SUPPORT_CONTACT_CHANGED: {
    title: 'Support number changed',
    description: "When the workspace's support contact number is updated.",
    inAppDefault: true,
    emailDefault: true,
  },
};

export const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_PREFERENCE_META,
) as NotificationType[];
