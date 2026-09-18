'use client';
import { cn } from '@/lib/utils';
import { ChevronDown, Mail, MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMarkNotificationRead } from '../hooks/useNotifications';
import { notificationMeta, timeAgo } from '../lib/meta';
import type { Notification, ServiceOrderNotificationData } from '../types';

/** Older or malformed rows fall back to the plain row rather than rendering half an order. */
export function isServiceOrderData(data: Notification['data']): data is ServiceOrderNotificationData &
  Record<string, unknown> {
  return (
    !!data &&
    typeof data.orderLabel === 'string' &&
    typeof data.leadId === 'string' &&
    Array.isArray(data.lines) &&
    typeof data.customer === 'object' &&
    data.customer !== null
  );
}

/** WhatsApp numbers arrive as international digits; a lead typed in by hand may be local ("0300…"). */
const telHref = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return phone.trim().startsWith('0') ? `tel:${digits}` : `tel:+${digits}`;
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * An order the assistant closed in chat. For now the Notifications page is the
 * only place an owner reads these, so the row opens in place to the whole order
 * instead of navigating away.
 */
export function ServiceOrderNotificationRow({
  notification,
  order,
}: {
  notification: Notification;
  order: ServiceOrderNotificationData;
}) {
  const [open, setOpen] = useState(false);
  const markRead = useMarkNotificationRead();
  const { Icon, bg, color } = notificationMeta(notification.type);
  const { customer } = order;

  const toggle = () => {
    setOpen((wasOpen) => !wasOpen);
    if (!notification.isRead) markRead.mutate(notification.id);
  };

  return (
    <div className={cn(notification.isRead ? 'bg-transparent' : 'bg-[var(--accent-soft)]')}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]"
      >
        <span
          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: bg, color }}
        >
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-medium text-[var(--ink)]">{notification.title}</span>
            {!notification.isRead && (
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
            )}
          </div>
          {notification.body && (
            <div className="mt-0.5 text-[12.5px] leading-[1.45] text-[var(--ink-soft)]">
              {notification.body}
            </div>
          )}
        </div>
        <span className="flex flex-shrink-0 items-center gap-1.5 text-[11px] text-[var(--ink-mute)]">
          {timeAgo(notification.createdAt)}
          <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4 pl-16">
          <Section label="Order">
            <ul className="flex flex-col gap-1">
              {order.lines.map((line) => (
                <li key={`${line.serviceName}-${line.planName}`} className="text-[13px] text-[var(--ink)]">
                  {line.text}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[13px] font-semibold text-[var(--ink)]">{order.priceSummary}</p>
          </Section>

          <Section label="Customer">
            <p className="text-[13px] text-[var(--ink)]">
              {customer.name ?? 'Unnamed customer'}
              {customer.businessName && (
                <span className="text-[var(--ink-mute)]"> · {customer.businessName}</span>
              )}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
              <a
                href={telHref(customer.phone)}
                className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
              >
                <Phone size={12} /> {customer.phone}
              </a>
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
                >
                  <Mail size={12} /> {customer.email}
                </a>
              )}
            </div>
          </Section>

          {(order.briefAnswers.length > 0 || order.briefSummary) && (
            <Section label="What they told the assistant">
              {order.briefAnswers.length > 0 && (
                <dl className="flex flex-col gap-1">
                  {order.briefAnswers.map((answer) => (
                    <div key={answer.label} className="text-[12.5px]">
                      <dt className="inline text-[var(--ink-mute)]">{answer.label} </dt>
                      <dd className="inline text-[var(--ink)]">{answer.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {order.briefSummary && (
                <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                  {order.briefSummary}
                </p>
              )}
            </Section>
          )}

          {order.notes && (
            <Section label="Notes">
              <p className="whitespace-pre-wrap text-[12.5px] text-[var(--ink-soft)]">{order.notes}</p>
            </Section>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/inbox?lead=${order.leadId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <MessageSquare size={13} /> Open chat
            </Link>
            <p className="text-[11.5px] text-[var(--ink-mute)]">
              Payment is not taken in chat. Reply 1, 2 or 3 to the WhatsApp alert to confirm, mark
              paid or cancel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
