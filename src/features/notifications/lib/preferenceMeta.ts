import type { NotificationType } from '../types';

/**
 * Every notification type in display order, with the server-side default
 * delivery channels. The preferences endpoint only returns rows the user has
 * actually changed, so the UI drives off this list and falls back to these.
 */
export const NOTIFICATION_PREFERENCE_META: Record<
  NotificationType,
  {
    title: string;
    description: string;
    inAppDefault: boolean;
    emailDefault: boolean;
    whatsappDefault: boolean;
  }
> = {
  NEW_MESSAGE: {
    title: 'New message',
    description: 'When a lead sends you a new message.',
    inAppDefault: false,
    emailDefault: false,
    whatsappDefault: false,
  },
  CHAT_ESCALATED: {
    title: 'Chat escalated',
    description: 'When a conversation is flagged for human attention.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  NEW_LEAD: {
    title: 'New lead',
    description: 'When a new lead is created or imported.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  LEAD_ASSIGNED: {
    title: 'Lead assigned',
    description: 'When a lead is assigned to you.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  ORDER_CREATED: {
    title: 'Order created',
    description: 'When a new order is placed.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  ORDER_STATUS_CHANGED: {
    title: 'Order status changed',
    description: 'When an order moves to a new status.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  MEMBER_INVITED: {
    title: 'Member invited',
    description: 'When someone is invited to your workspace.',
    inAppDefault: true,
    emailDefault: true,
    whatsappDefault: false,
  },
  MEMBER_JOINED: {
    title: 'Member joined',
    description: 'When an invited member accepts and joins.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  BROADCAST_COMPLETED: {
    title: 'Broadcast completed',
    description: 'When a broadcast campaign finishes sending.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: false,
  },
  NEW_LOGIN: {
    title: 'New sign-in',
    description: 'When your account is accessed from a new device.',
    inAppDefault: true,
    emailDefault: true,
    whatsappDefault: false,
  },
  BILLING: {
    title: 'Billing',
    description: 'Payment confirmations and plan changes.',
    inAppDefault: true,
    emailDefault: true,
    whatsappDefault: false,
  },
  SUPPORT_CONTACT_CHANGED: {
    title: 'Support number changed',
    description: "When the workspace's support contact number is updated.",
    inAppDefault: true,
    emailDefault: true,
    whatsappDefault: false,
  },
  APPOINTMENT_BOOKED: {
    title: 'Call booked',
    description: 'When the bot or your team takes a new appointment.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: true,
  },
  APPOINTMENT_RESCHEDULED: {
    title: 'Call rescheduled',
    description: 'When a booked call moves to a different time.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: true,
  },
  APPOINTMENT_CANCELLED: {
    title: 'Call cancelled',
    description: 'When a booked call is cancelled and its slot reopens.',
    inAppDefault: true,
    emailDefault: false,
    whatsappDefault: true,
  },
};

export const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_PREFERENCE_META,
) as NotificationType[];
