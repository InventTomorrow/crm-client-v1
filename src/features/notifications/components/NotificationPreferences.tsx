'use client';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useNotificationPreferences, useUpdateNotificationPreference } from '../hooks/useNotifications';
import { NOTIFICATION_PREFERENCE_META, NOTIFICATION_TYPES } from '../lib/preferenceMeta';
import type { NotificationType } from '../types';

const ROW_GRID = 'grid grid-cols-[1fr_56px_56px] gap-2 items-center';

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
  const { data: preferences } = useNotificationPreferences();
  const update = useUpdateNotificationPreference();

  // Only the toggle actually being changed shows a loader/disables — not every
  // row — since the mutation is a single shared instance across the grid.
  const isSaving = (type: NotificationType, channel: 'inApp' | 'email') =>
    update.isPending && update.variables?.type === type && update.variables?.[channel] !== undefined;

  return (
    <section className="card p-0 overflow-hidden h-fit">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">Notification preferences</h2>
        <p className="text-[12.5px] text-[var(--ink-mute)] mt-0.5">
          Choose how you’re notified for each event.
        </p>
      </div>

      <div
        className={cn(
          ROW_GRID,
          'px-4 py-2 border-y border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]',
        )}
      >
        <span>Event</span>
        <span className="text-center">In-app</span>
        <span className="text-center">Email</span>
      </div>

      {NOTIFICATION_TYPES.map((type, index) => {
        const meta = NOTIFICATION_PREFERENCE_META[type];
        const saved = preferences?.find((preference) => preference.type === type);
        const inApp = saved?.inApp ?? meta.inAppDefault;
        const email = saved?.email ?? meta.emailDefault;
        const inAppSaving = isSaving(type, 'inApp');
        const emailSaving = isSaving(type, 'email');
        return (
          <div
            key={type}
            className={cn(
              ROW_GRID,
              'px-4 py-3',
              index > 0 && 'border-t border-[var(--line-soft)]',
            )}
          >
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[var(--ink)]">{meta.title}</div>
              <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">{meta.description}</div>
            </div>
            <div className="flex justify-center">
              <Toggle
                on={inApp}
                loading={inAppSaving}
                disabled={inAppSaving}
                onClick={() => update.mutate({ type, inApp: !inApp })}
              />
            </div>
            <div className="flex justify-center">
              <Toggle
                on={email}
                loading={emailSaving}
                disabled={emailSaving}
                onClick={() => update.mutate({ type, email: !email })}
              />
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-1.5 px-4 py-3 border-t border-[var(--line)] text-[11.5px] text-[var(--ink-mute)]">
        <Check size={12} className="text-[#15803D]" /> Preferences save automatically
      </div>
    </section>
  );
}
