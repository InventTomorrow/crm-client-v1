import { MessageCircle, Camera, Globe2, Music2 } from 'lucide-react';
import type { Channel } from '@/lib/mockData';

const CHANNEL_MAP = {
  wa: { label: 'WhatsApp', cls: 'ch-wa', Icon: MessageCircle },
  ig: { label: 'Instagram', cls: 'ch-ig', Icon: Camera },
  fb: { label: 'Facebook', cls: 'ch-fb', Icon: Globe2 },
  tk: { label: 'TikTok', cls: 'ch-tk', Icon: Music2 },
} as const;

interface ChannelBadgeProps {
  channel?: Channel;
  /** @deprecated use channel */
  ch?: Channel;
  size?: 'xs' | 'sm';
  iconOnly?: boolean;
}

export function ChannelBadge({ channel, ch, size = 'sm', iconOnly = false }: ChannelBadgeProps) {
  const key = (channel ?? ch ?? 'wa') as Channel;
  const m = CHANNEL_MAP[key] ?? CHANNEL_MAP.wa;
  const { Icon } = m;
  const compact = size === 'xs' || iconOnly;
  return (
    <span className={`badge ${m.cls}${compact ? ' py-[2px] px-[6px]' : ''}`}>
      <Icon size={compact ? 10 : 12} strokeWidth={2.2} />
      {!compact && <span>{m.label}</span>}
    </span>
  );
}
