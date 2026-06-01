export type { TeamUser } from '@/lib/mockData';
import { z } from 'zod';

export const inviteUserSchema = z.object({
  name:  z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  role:  z.enum(['Owner', 'Manager', 'Agent']),
  city:  z.string(),
  phone: z.string().optional(),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

export type RoleFilter = 'all' | 'Owner' | 'Manager' | 'Agent';
export type StatusFilter = 'all' | 'active' | 'invited' | 'disabled';

export const ROLE_META: Record<string, { bg: string; color: string }> = {
  Owner:   { bg: 'rgba(124,58,237,0.12)', color: '#6D28D9' },
  Manager: { bg: 'rgba(14,165,233,0.12)', color: '#0369A1' },
  Agent:   { bg: 'rgba(100,116,139,0.12)', color: '#475569' },
};

export const STATUS_META: Record<string, { bg: string; color: string; label: string; dot: string }> = {
  active:   { bg: 'rgba(34,197,94,0.12)',  color: '#15803D', label: 'Active',   dot: '#22C55E' },
  invited:  { bg: 'rgba(245,158,11,0.12)', color: '#B45309', label: 'Invited',  dot: '#F59E0B' },
  disabled: { bg: 'rgba(148,163,184,0.16)', color: '#475569', label: 'Disabled', dot: '#94A3B8' },
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Owner: [
    'Full workspace access',
    'Manage billing + integrations',
    'Manage team members + roles',
    'Delete data',
  ],
  Manager: [
    'Manage leads, inventory, replies',
    'View analytics + exports',
    'Invite Agents',
    'No billing access',
  ],
  Agent: [
    'Inbox + assigned leads',
    'View own performance',
    'Cannot manage members or billing',
  ],
};
