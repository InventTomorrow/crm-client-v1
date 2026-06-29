import { z } from 'zod';

export type { UserProfile, NotifSettings } from '@/lib/mockData';

export type SettingsSection =
  | 'profile'
  | 'notif'
  | 'chatbot'
  | 'business'
  | 'channels'
  | 'billing'
  | 'access'
  | 'system'
  | 'workspaces';

export const SECTION_NAV: Array<{ id: SettingsSection; label: string }> = [
  { id: 'profile',    label: 'Profile' },
  { id: 'notif',      label: 'Notifications' },
  { id: 'chatbot',    label: 'Chatbot' },
  { id: 'business',   label: 'Business' },
  { id: 'channels',   label: 'Channels' },
  { id: 'billing',    label: 'Billing' },
  { id: 'access',     label: 'Access Control' },
  { id: 'workspaces', label: 'Workspaces' },
  { id: 'system',     label: 'System Status' },
];

// ──────────────────── Chatbot config (mirrors server chatbot.dto) ────────────────────
export const chatbotConfigSchema = z.object({
  greetingMessage: z.string().min(1, 'Greeting message is required'),
  escalationMessage: z.string().min(1, 'Escalation message is required'),
  fallbackMessage: z.string().min(1, 'Fallback message is required'),
  aiPersonality: z.enum(['FORMAL', 'CASUAL', 'PERSUASIVE']),
  aiEnabled: z.boolean(),
});
export type ChatbotConfigForm = z.infer<typeof chatbotConfigSchema>;

export const businessFaqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(300),
  answer: z.string().min(1, 'Answer is required').max(1000),
});
export type BusinessFaq = z.infer<typeof businessFaqSchema>;

export const businessProfileSchema = z.object({
  businessDescription: z.string().max(2000),
  businessInfoMessage: z.string().max(2000),
  businessFaqs: z.array(businessFaqSchema).max(50),
  supportName: z.string().max(100),
  supportPhone: z.string().max(30),
  supportEmail: z.string().max(200),
});
export type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

// Invite a workspace member. Only email + roleId are persisted by the API; the
// invitee sets their own name when they accept. city/phone are captured for
// display and future use.
export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  roleId: z.string().min(1, 'Select a role'),
  city: z.string().max(60).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
});
export type InviteMemberForm = z.infer<typeof inviteMemberSchema>;

// Full config returned by GET /chatbot/config
export interface ChatbotConfigResponse {
  config: {
    greetingMessage: string;
    escalationMessage: string;
    fallbackMessage: string;
    aiPersonality: 'FORMAL' | 'CASUAL' | 'PERSUASIVE';
    aiEnabled: boolean;
    businessDescription: string | null;
    businessInfoMessage: string | null;
    businessFaqs: BusinessFaq[] | null;
    supportName: string | null;
    supportPhone: string | null;
    supportEmail: string | null;
  } | null;
  workspaceName: string | null;
}

export const CHANNELS_DATA = [
  { ch: 'wa' as const, name: 'WhatsApp Business', acct: 'Scan QR to connect', status: 'disconnected', date: '' },
] as const;

export const SYSTEM_STATS = [
  { l: 'AI Latency',    v: '142ms',  ok: true },
  { l: 'Uptime (30d)',  v: '99.98%', ok: true },
  { l: 'Encryption',   v: 'AES-256', ok: true },
  { l: 'Sync (Shopify)', v: 'Live',  ok: true },
] as const;
