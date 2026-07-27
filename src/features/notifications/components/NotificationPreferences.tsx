'use client';
import { Loader2 } from 'lucide-react';
import { useNotificationPreferences, useUpdateNotificationPreference } from '../hooks/useNotifications';
import type { NotificationType } from '../types';

// Display order + labels + default in-app/email behaviour (mirrors the server defaults).
const TYPES: { type: NotificationType; label: string; inAppDefault: boolean; emailDefault: boolean }[] = [
  { type: 'NEW_MESSAGE', label: 'New inbound message', inAppDefault: false, emailDefault: false },
  { type: 'CHAT_ESCALATED', label: 'Chat escalated to a human', inAppDefault: true, emailDefault: false },
  { type: 'NEW_LEAD', label: 'New lead', inAppDefault: true, emailDefault: false },
  { type: 'LEAD_ASSIGNED', label: 'Lead assigned to me', inAppDefault: true, emailDefault: false },
  { type: 'ORDER_CREATED', label: 'Order created', inAppDefault: true, emailDefault: false },
  { type: 'ORDER_STATUS_CHANGED', label: 'Order status changed', inAppDefault: true, emailDefault: false },
  { type: 'MEMBER_INVITED', label: 'Member invited', inAppDefault: true, emailDefault: true },
  { type: 'MEMBER_JOINED', label: 'Member joined', inAppDefault: true, emailDefault: false },
  { type: 'BROADCAST_COMPLETED', label: 'Broadcast completed', inAppDefault: true, emailDefault: false },
  { type: 'NEW_LOGIN', label: 'New sign-in (security)', inAppDefault: true, emailDefault: true },
  { type: 'BILLING', label: 'Billing & subscription', inAppDefault: true, emailDefault: true },
  { type: 'SUPPORT_CONTACT_CHANGED', label: 'Support number changed', inAppDefault: true, emailDefault: true },
];

function Toggle({
  on,
  onClick,
  disabled,
  loading,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors ${
        on ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin text-white" />
      ) : (
        <span
          className={`pointer-events-none absolute inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            on ? 'translate-x-2' : 'translate-x-[-6px]'
          }`}
        />
      )}
    </button>
  );
}

export function NotificationPreferences() {
  const { data: prefs } = useNotificationPreferences();
  const update = useUpdateNotificationPreference();

  const find = (type: NotificationType) => prefs?.find((p) => p.type === type);
  // Only the toggle actually being changed shows a loader/disables — not every
  // row — since the mutation is a single shared instance across the grid.
  const isPending = (type: NotificationType, channel: 'inApp' | 'email') =>
    update.isPending && update.variables?.type === type && update.variables?.[channel] !== undefined;

  return (
    <section className="card p-5 mt-6">
      <h2 className="text-[15px] font-semibold text-[var(--ink)]">Notification preferences</h2>
      <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5 mb-4">
        Choose how you’re notified for each event.
      </p>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-1 items-center">
        <div />
        <div className="text-[11px] font-medium text-[var(--ink-mute)] text-center">In-app</div>
        <div className="text-[11px] font-medium text-[var(--ink-mute)] text-center">Email</div>

        {TYPES.map(({ type, label, inAppDefault, emailDefault }) => {
          const pref = find(type);
          const inApp = pref?.inApp ?? inAppDefault;
          const email = pref?.email ?? emailDefault;
          const inAppLoading = isPending(type, 'inApp');
          const emailLoading = isPending(type, 'email');
          return (
            <div key={type} className="contents">
              <div className="text-[13px] text-[var(--ink)] py-2 border-t border-[var(--line-soft)]">
                {label}
              </div>
              <div className="flex justify-center py-2 border-t border-[var(--line-soft)]">
                <Toggle
                  on={inApp}
                  loading={inAppLoading}
                  disabled={inAppLoading}
                  onClick={() => update.mutate({ type, inApp: !inApp })}
                />
              </div>
              <div className="flex justify-center py-2 border-t border-[var(--line-soft)]">
                <Toggle
                  on={email}
                  loading={emailLoading}
                  disabled={emailLoading}
                  onClick={() => update.mutate({ type, email: !email })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
