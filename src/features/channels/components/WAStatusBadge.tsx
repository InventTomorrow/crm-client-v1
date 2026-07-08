'use client';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useWAStatus } from '../hooks/useWhatsApp';
import type { WASessionStatus } from '../types';

// Visuals mirror the StatusPill in ChannelsView so the WhatsApp state reads the
// same everywhere it appears (Channels page, Leads, Inbox).
const MAP: Record<WASessionStatus, { label: string; pill: string; dot: string }> = {
  CONNECTED:    { label: 'Connected',    pill: 'bg-[#DCFCE7] text-[#15803D]',                  dot: 'bg-[#15803D]' },
  CONNECTING:   { label: 'Connecting…',  pill: 'bg-[#FEF9C3] text-[#854D0E]',                  dot: 'bg-[#CA8A04]' },
  PENDING:      { label: 'Waiting for scan', pill: 'bg-[#FEF9C3] text-[#854D0E]',              dot: 'bg-[#CA8A04]' },
  DISCONNECTED: { label: 'Disconnected', pill: 'bg-[var(--surface-2)] text-[var(--ink-mute)]', dot: 'bg-[var(--ink-mute)]' },
};

/**
 * Compact WhatsApp connectivity indicator. Polls the shared `wa-status` query
 * (10s) and links to the Channels page so the user can connect/scan from here.
 * Pass `showLabel={false}` for tight spaces (icon + status dot only).
 */
export function WAStatusBadge({
  showLabel = true,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { data } = useWAStatus();
  const status: WASessionStatus = data?.status ?? 'DISCONNECTED';
  const { label, pill, dot } = MAP[status];
  const title = `WhatsApp: ${label}${data?.phoneNumber ? ` · ${data.phoneNumber}` : ''}`;

  return (
    <Link
      href="/channels"
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-opacity hover:opacity-80',
        pill,
        className,
      )}
    >
      <span
        className={cn(
          'w-[6px] h-[6px] rounded-full',
          dot,
          (status === 'PENDING' || status === 'CONNECTING') && 'animate-pulse',
        )}
      />
      <MessageCircle size={13} />
      {showLabel && <span>{label}</span>}
    </Link>
  );
}
