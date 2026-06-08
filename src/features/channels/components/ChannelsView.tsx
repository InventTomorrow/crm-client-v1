'use client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Power,
  QrCode,
  RefreshCw,
  Sparkles,
  WifiOff,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  useUpdateWAConfig,
  useWAConfig,
  useWAConnect,
  useWADisconnect,
  useWAEventStream,
  useWAStatus,
} from '../hooks/useWhatsApp';
import type { WASessionStatus } from '../types';

function StatusPill({ status }: { status: WASessionStatus }) {
  const map = {
    CONNECTED:    { label: 'Connected',    cls: 'bg-[#DCFCE7] text-[#15803D]' },
    PENDING:      { label: 'Connecting…',  cls: 'bg-[#FEF9C3] text-[#854D0E]' },
    DISCONNECTED: { label: 'Disconnected', cls: 'bg-[var(--surface-2)] text-[var(--ink-mute)]' },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={cn('badge text-[11px] font-medium px-2.5 py-1', cls)}>
      <span className={cn('w-[6px] h-[6px] rounded-full', status === 'CONNECTED' ? 'bg-[#15803D]' : status === 'PENDING' ? 'bg-[#CA8A04]' : 'bg-[var(--ink-mute)]')} />
      {label}
    </span>
  );
}

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        enabled ? 'bg-[var(--accent)]' : 'bg-[var(--line)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function ChannelsView() {
  const { data: statusData } = useWAStatus();
  const { data: config } = useWAConfig();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const updateConfigMut = useUpdateWAConfig();

  const [streamActive, setStreamActive] = useState(false);
  const { qr, liveStatus, livePhone, liveError } = useWAEventStream(streamActive);

  // DISCONNECTED is terminal — emitted only on final failure / logout / explicit
  // disconnect (launch retries stay PENDING), so no further events follow. Drop
  // streamActive to close the EventSource; flipping it false also lets the next
  // handleConnect re-open a fresh stream for the retry. We keep the stream open
  // while CONNECTED so an unexpected logout still reaches the UI live.
  useEffect(() => {
    if (liveStatus === 'DISCONNECTED') {
      setStreamActive(false);
    }
  }, [liveStatus]);

  const status: WASessionStatus = liveStatus ?? statusData?.status ?? 'DISCONNECTED';
  const phoneNumber = livePhone ?? statusData?.phoneNumber;
  const qrCode = qr ?? statusData?.qr;
  const connectionError = liveError ?? statusData?.error;

  const handleConnect = () => {
    setStreamActive(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStreamActive(false);
    disconnectMut.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold font-[var(--font-head)] text-[var(--ink)]">Channels</h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-0.5">Connect your messaging channels to enable AI-powered conversations.</p>
      </div>

      {/* WhatsApp Card */}
      <div className="card p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#25D366' }}>
              <MessageCircle size={20} className="text-white" fill="white" />
            </div>
            <div>
              <div className="font-semibold text-[14.5px] text-[var(--ink)]">WhatsApp</div>
              <div className="text-[12px] text-[var(--ink-mute)] mt-px">Scan QR to connect your number</div>
            </div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Body */}
        <div className="p-5">
          {/* DISCONNECTED */}
          {status === 'DISCONNECTED' && (
            <div className="flex flex-col items-center gap-4 py-4">
              {connectionError && (
                <div className="w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                  <WifiOff size={15} className="flex-shrink-0 mt-px" />
                  <div>
                    <p className="text-[12.5px] font-semibold">Connection failed</p>
                    <p className="text-[11.5px] mt-0.5 opacity-80 break-all">{connectionError}</p>
                  </div>
                </div>
              )}
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center">
                <QrCode size={28} className="text-[var(--ink-mute)]" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-medium text-[var(--ink)]">Connect WhatsApp</p>
                <p className="text-[12.5px] text-[var(--ink-mute)] mt-1 max-w-xs">
                  Link your WhatsApp number so the AI can receive and reply to customer messages.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={connectMut.isPending}
                className="btn btn-grad px-5 py-2.5"
              >
                {connectMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
                {connectMut.isPending ? 'Starting…' : connectionError ? 'Retry Connection' : 'Generate QR Code'}
              </button>
            </div>
          )}

          {/* PENDING — waiting for QR / scan */}
          {status === 'PENDING' && (
            <div className="flex flex-col items-center gap-4 py-2">
              {qrCode ? (
                <>
                  <div className="rounded-2xl overflow-hidden border-4 border-[var(--line)] shadow-sm">
                    <Image src={qrCode} alt="WhatsApp QR Code" width={220} height={220} unoptimized />
                  </div>
                  <div className="text-center">
                    <p className="text-[13.5px] font-medium text-[var(--ink)]">Scan with WhatsApp</p>
                    <p className="text-[12px] text-[var(--ink-mute)] mt-1">
                      Open WhatsApp → Linked Devices → Link a Device
                    </p>
                  </div>
                  <button
                    onClick={() => { setStreamActive(false); setStreamActive(true); connectMut.mutate(); }}
                    className="btn btn-outline py-1.5 px-4 text-[12px]"
                  >
                    <RefreshCw size={12} /> Refresh QR
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                  <p className="text-[13px] text-[var(--ink-mute)]">Generating QR code…</p>
                </div>
              )}
            </div>
          )}

          {/* CONNECTED */}
          {status === 'CONNECTED' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0]">
                <CheckCircle2 size={20} className="text-[#15803D] flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#15803D]">WhatsApp Connected</p>
                  {phoneNumber && (
                    <p className="text-[12px] text-[#166534] mt-px">+{phoneNumber}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
                className="btn btn-outline py-2 px-4 self-start text-[12.5px] text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2]"
              >
                {disconnectMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* AI Settings — only when connected */}
        {status === 'CONNECTED' && (
          <div className="border-t border-[var(--line)] px-5 py-4 flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--ink-mute)]">AI Settings</p>

            {/* Auto-reply toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={14} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">Auto-Reply</p>
                  <p className="text-[12px] text-[var(--ink-mute)] mt-px">
                    {config?.autoReply
                      ? 'AI sends replies automatically to leads'
                      : 'AI drafts replies — you review before sending'}
                  </p>
                </div>
              </div>
              <Toggle
                enabled={config?.autoReply ?? false}
                onChange={(v) => updateConfigMut.mutate({ autoReply: v })}
                disabled={updateConfigMut.isPending}
              />
            </div>

            {/* AI enabled indicator */}
            <div className="flex items-center gap-2 text-[12px] text-[var(--ink-mute)]">
              <Sparkles size={12} className={config?.aiEnabled ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]'} />
              AI is {config?.aiEnabled ? 'enabled — responding to lead messages' : 'disabled — configure in Settings'}
            </div>

            {!config?.aiEnabled && (
              <div className="text-[11.5px] text-[#854D0E] bg-[#FEF9C3] px-3 py-2 rounded-lg">
                Enable the AI chatbot in your Settings to start auto-replying.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coming soon channels */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { name: 'Instagram', color: '#E1306C', icon: '📸' },
          { name: 'Facebook', color: '#1877F2', icon: '📘' },
        ].map((ch) => (
          <div key={ch.name} className="card p-4 opacity-50 flex items-center gap-3">
            <span className="text-2xl">{ch.icon}</span>
            <div>
              <p className="text-[13px] font-medium text-[var(--ink)]">{ch.name}</p>
              <p className="text-[11.5px] text-[var(--ink-mute)]">Coming soon</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
