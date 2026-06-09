'use client';
import { useNotificationPreferences, useUpdateNotificationPreference } from '../hooks/useNotifications';
import type { NotificationType } from '../types';

// Display order + labels + default email behaviour (mirrors the server defaults).
const TYPES: { type: NotificationType; label: string; emailDefault: boolean }[] = [
  { type: 'NEW_MESSAGE', label: 'New inbound message', emailDefault: false },
  { type: 'CHAT_ESCALATED', label: 'Chat escalated to a human', emailDefault: false },
  { type: 'NEW_LEAD', label: 'New lead', emailDefault: false },
  { type: 'LEAD_ASSIGNED', label: 'Lead assigned to me', emailDefault: false },
  { type: 'ORDER_CREATED', label: 'Order created', emailDefault: false },
  { type: 'ORDER_STATUS_CHANGED', label: 'Order status changed', emailDefault: false },
  { type: 'MEMBER_INVITED', label: 'Member invited', emailDefault: true },
  { type: 'MEMBER_JOINED', label: 'Member joined', emailDefault: false },
  { type: 'BROADCAST_COMPLETED', label: 'Broadcast completed', emailDefault: false },
  { type: 'NEW_LOGIN', label: 'New sign-in (security)', emailDefault: true },
  { type: 'BILLING', label: 'Billing & subscription', emailDefault: true },
];

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        on ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function NotificationPreferences() {
  const { data: prefs } = useNotificationPreferences();
  const update = useUpdateNotificationPreference();

  const find = (type: NotificationType) => prefs?.find((p) => p.type === type);

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

        {TYPES.map(({ type, label, emailDefault }) => {
          const pref = find(type);
          const inApp = pref?.inApp ?? true;
          const email = pref?.email ?? emailDefault;
          return (
            <div key={type} className="contents">
              <div className="text-[13px] text-[var(--ink)] py-2 border-t border-[var(--line-soft)]">
                {label}
              </div>
              <div className="flex justify-center py-2 border-t border-[var(--line-soft)]">
                <Toggle
                  on={inApp}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ type, inApp: !inApp })}
                />
              </div>
              <div className="flex justify-center py-2 border-t border-[var(--line-soft)]">
                <Toggle
                  on={email}
                  disabled={update.isPending}
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
