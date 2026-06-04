'use client';
import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConnectChannel, useOnboardingStatus, useSkipOnboarding } from '../hooks/useOnboarding';
import { OnboardingShell } from './OnboardingShell';

const CHANNELS = [
  {
    key: 'WHATSAPP' as const,
    label: 'WhatsApp',
    desc: 'Connect via WhatsApp Business API (WABA)',
    icon: <MessageCircle size={18} style={{ color: '#25D366' }} />,
    bg: 'rgba(37,211,102,0.1)',
  },
  {
    key: 'INSTAGRAM' as const,
    label: 'Instagram',
    desc: 'Connect Instagram DMs via Meta Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
    bg: 'rgba(225,48,108,0.1)',
    soon: true,
  },
  {
    key: 'MESSENGER' as const,
    label: 'Messenger',
    desc: 'Connect Facebook Messenger via Meta Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0084FF">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
      </svg>
    ),
    bg: 'rgba(0,132,255,0.1)',
    soon: true,
  },
] as const;

export function ChannelView() {
  const [selected, setSelected] = useState<'WHATSAPP' | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const { data: status } = useOnboardingStatus();
  const { mutate: connect, isPending } = useConnectChannel();
  const { mutate: skip, isPending: isSkipping } = useSkipOnboarding();

  // Prefill the workspace name from the tenant created at signup (editable here).
  useEffect(() => {
    if (status?.workspaceName) setWorkspaceName((prev) => prev || status.workspaceName);
  }, [status?.workspaceName]);

  const trimmedName = workspaceName.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    connect({ channel: selected, wabaId, phoneNumberId, accessToken, workspaceName: trimmedName || undefined });
  };

  return (
    <OnboardingShell currentStep="CHANNEL">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">Connect your channel</h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">Choose how customers reach you</p>
      </div>

      <div className="card p-6 flex flex-col gap-5">
        {/* Workspace name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
            <Building2 size={13} className="text-[var(--accent)]" /> Workspace name
          </label>
          <input
            className="input text-[13px]"
            placeholder="e.g. Acme Boutique"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <p className="text-[11px] text-[var(--ink-mute)]">This is how your business appears across the app.</p>
        </div>

        {/* Channel cards */}
        <div className="flex flex-col gap-2.5">
          {CHANNELS.map((ch) => {
            const isSelected = selected === ch.key;
            const isSoon = 'soon' in ch && ch.soon;
            return (
              <button
                key={ch.key}
                type="button"
                disabled={isSoon}
                onClick={() => { if (!isSoon && ch.key === 'WHATSAPP') setSelected(ch.key); }}
                className={cn(
                  'flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all',
                  isSoon
                    ? 'opacity-50 cursor-not-allowed border-[var(--line)] bg-[var(--surface-2)]'
                    : isSelected
                    ? 'border-[var(--accent)] bg-[rgba(79,195,247,0.06)] shadow-sm'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]',
                )}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: ch.bg }}
                >
                  {ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-medium text-[var(--ink)]">{ch.label}</span>
                    {isSoon && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)] font-medium">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">{ch.desc}</p>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors',
                  isSelected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--line)]',
                )} />
              </button>
            );
          })}
        </div>

        {/* WhatsApp credentials */}
        {selected === 'WHATSAPP' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1 border-t border-[var(--line)]">
            <p className="text-[12px] text-[var(--ink-mute)]">
              Enter your WhatsApp Business API credentials from the Meta Developer Dashboard.
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[var(--ink-soft)]">WABA ID</label>
                <input className="input text-[13px]" placeholder="123456789012345" value={wabaId} onChange={(e) => setWabaId(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[var(--ink-soft)]">Phone Number ID</label>
                <input className="input text-[13px]" placeholder="123456789012346" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[var(--ink-soft)]">Permanent Access Token</label>
                <input className="input text-[13px]" type="password" placeholder="EAA…" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-grad w-full justify-center mt-1" disabled={isPending}>
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {isPending ? 'Connecting…' : 'Connect & continue'}
            </button>
          </form>
        )}

        {!selected && (
          <button
            type="button"
            className="btn btn-outline w-full justify-center text-[13px]"
            onClick={() => skip()}
            disabled={isSkipping}
          >
            {isSkipping ? <Loader2 size={13} className="animate-spin" /> : null}
            Skip for now — set up later in Settings
          </button>
        )}
      </div>
    </OnboardingShell>
  );
}
