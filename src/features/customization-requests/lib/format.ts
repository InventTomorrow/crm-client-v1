import type {
  CustomizationRequestReason,
  CustomizationRequestStatus,
} from '../types';

interface StatusMeta {
  label: string;
  /** Badge background + text. */
  cls: string;
  dot: string;
  hint: string;
}

/**
 * Built from the semantic tokens rather than fixed hex values, so these badges
 * follow the theme — the orders badges predate those tokens.
 */
export const REQUEST_STATUS_META: Record<CustomizationRequestStatus, StatusMeta> = {
  NEW: {
    label: 'New',
    cls: 'bg-[var(--warning-soft)] text-[var(--warning-foreground)]',
    dot: 'bg-[var(--warning)]',
    hint: 'Nobody has looked at this yet',
  },
  IN_REVIEW: {
    label: 'In review',
    cls: 'bg-[var(--info-soft)] text-[var(--info-foreground)]',
    dot: 'bg-[var(--info)]',
    hint: 'Someone is working out whether it can be done',
  },
  ANSWERED: {
    label: 'Answered',
    cls: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    dot: 'bg-[var(--accent)]',
    hint: 'Replied in the chat — waiting on the customer',
  },
  ACCEPTED: {
    label: 'Accepted',
    cls: 'bg-[var(--success-soft)] text-[var(--success-foreground)]',
    dot: 'bg-[var(--success)]',
    hint: 'Agreed as possible — raise the order next',
  },
  DECLINED: {
    label: 'Declined',
    cls: 'bg-[var(--destructive)]/12 text-[var(--destructive)]',
    dot: 'bg-[var(--destructive)]',
    hint: 'Not something the business can make',
  },
  CONVERTED: {
    label: 'Ordered',
    cls: 'bg-[var(--success-soft)] text-[var(--success-foreground)]',
    dot: 'bg-[var(--success)]',
    hint: 'Became a real order',
  },
  CLOSED: {
    label: 'Closed',
    cls: 'bg-[var(--surface-2)] text-[var(--ink-soft)]',
    dot: 'bg-[var(--ink-mute)]',
    hint: 'Dropped without an order',
  },
};

interface ReasonMeta {
  label: string;
  description: string;
}

export const REQUEST_REASON_META: Record<CustomizationRequestReason, ReasonMeta> = {
  CUSTOMIZATION_DISABLED: {
    label: 'Not customizable',
    description:
      'This product is set up as sold-as-listed, but the customer asked for custom work anyway.',
  },
  OPTION_NOT_OFFERED: {
    label: 'Option not offered',
    description:
      'The product takes custom work, but not the kind the customer asked for.',
  },
  UNRESOLVED_SPEC: {
    label: 'Spec unresolved',
    description:
      "The product offers this kind of work, but the customer's exact specification did not match any configured choice.",
  },
};

/** "3 days ago" — how long the customer has been waiting on an answer. */
export function formatWaitingFor(isoDate: string): string {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
