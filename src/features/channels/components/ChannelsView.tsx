'use client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Power,
  QrCode,
  RefreshCw,
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
import { useQueryClient } from '@tanstack/react-query';

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: WASessionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full',
        status === 'CONNECTED'    && 'bg-[#DCFCE7] text-[#15803D]',
        status === 'PENDING'      && 'bg-[#FEF9C3] text-[#854D0E]',
        status === 'DISCONNECTED' && 'bg-[var(--surface-2)] text-[var(--ink-mute)]',
      )}
    >
      <span
        className={cn(
          'w-[6px] h-[6px] rounded-full flex-shrink-0',
          status === 'CONNECTED'    && 'bg-[#15803D]',
          status === 'PENDING'      && 'bg-[#CA8A04] animate-pulse',
          status === 'DISCONNECTED' && 'bg-[var(--ink-mute)]',
        )}
      />
      {status === 'CONNECTED' ? 'Connected' : status === 'PENDING' ? 'Connecting…' : 'Disconnected'}
    </span>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
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

// ── QR frame with corner accents ───────────────────────────────────────────────
function QRFrame({ src }: { src: string }) {
  return (
    <div className="relative w-[216px] h-[216px] flex-shrink-0">
      {(['tl','tr','bl','br'] as const).map((pos) => (
        <span
          key={pos}
          className={cn(
            'absolute w-5 h-5 border-[var(--accent)]',
            pos === 'tl' && 'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[5px]',
            pos === 'tr' && 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[5px]',
            pos === 'bl' && 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[5px]',
            pos === 'br' && 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[5px]',
          )}
        />
      ))}
      <div className="absolute inset-[7px] rounded-lg overflow-hidden bg-white p-1.5 shadow-sm border border-[var(--line)]">
        <Image src={src} alt="WhatsApp QR code" width={194} height={194} unoptimized className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

// ── Step badge ─────────────────────────────────────────────────────────────────
function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10.5px] font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </div>
      <span className="text-[12.5px] text-[var(--ink-soft)]">{label}</span>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────
export function ChannelsView() {
  const qc = useQueryClient();
  const { data: statusData } = useWAStatus();
  const { data: config } = useWAConfig();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const updateConfigMut = useUpdateWAConfig();

  const [streamActive, setStreamActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const { qr, liveStatus, livePhone, liveError } = useWAEventStream(streamActive);

  const status: WASessionStatus = liveStatus ?? statusData?.status ?? 'DISCONNECTED';
  const phoneNumber = livePhone ?? statusData?.phoneNumber;
  const qrCode = qr ?? statusData?.qr;
  const connectionError = liveError ?? statusData?.error;
  const showLoading = starting && !qrCode && status !== 'CONNECTED';

  // Sync query cache immediately on any SSE event.
  useEffect(() => {
    if (!liveStatus) return;
    qc.setQueryData(['wa-status'], (old: any) => ({
      ...old,
      status: liveStatus,
      phoneNumber: livePhone ?? old?.phoneNumber,
      error: liveError ?? null,
    }));
    if (liveStatus !== 'PENDING') setStarting(false);
    if (liveStatus === 'DISCONNECTED') setStreamActive(false);
  }, [liveStatus, livePhone, liveError, qc]);

  const handleConnect = () => {
    setStarting(true);
    setStreamActive(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStreamActive(false);
    setStarting(false);
    disconnectMut.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">Channels</h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-0.5">
          Connect your messaging channels to enable AI-powered conversations.
        </p>
      </div>

      {/* WhatsApp card */}
      <div className="card p-0 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold text-[14.5px]">WhatsApp</p>
              <p className="text-[12px] text-[var(--ink-mute)] mt-px">
                {status === 'CONNECTED' && phoneNumber
                  ? `+${phoneNumber}`
                  : 'Scan QR to connect your number'}
              </p>
            </div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Body */}
        <div className="p-5">

          {/* ── CONNECTED ─────────────────────────────────────────────────── */}
          {status === 'CONNECTED' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-[#15803D]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#15803D]">WhatsApp is active</p>
                  <p className="text-[12px] text-[#166534] mt-px">
                    {phoneNumber ? `+${phoneNumber}` : 'Your number is linked and receiving messages'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
                className="btn btn-outline self-start text-[12.5px] text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2]"
              >
                {disconnectMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                Disconnect
              </button>
            </div>
          )}

          {/* ── LOADING (waiting for first SSE event) ─────────────────────── */}
          {showLoading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-[216px] h-[216px] rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
                <p className="text-[12.5px] text-[var(--ink-mute)]">Starting connection…</p>
              </div>
            </div>
          )}

          {/* ── PENDING ───────────────────────────────────────────────────── */}
          {!showLoading && status === 'PENDING' && (
            <div className="flex flex-col items-center gap-5 py-2">
              {qrCode ? (
                <>
                  <QRFrame src={qrCode} />
                  <div className="w-full space-y-2 bg-[var(--surface-2)] rounded-xl p-4">
                    <p className="text-[12px] font-semibold text-[var(--ink-soft)] mb-3">How to scan</p>
                    <Step n={1} label="Open WhatsApp on your phone" />
                    <Step n={2} label='Tap Menu → "Linked Devices"' />
                    <Step n={3} label='"Link a Device" → scan this QR' />
                  </div>
                  <p className="text-[11.5px] text-[var(--ink-mute)]">QR expires in ~60 seconds</p>
                  <button
                    onClick={() => { setStarting(true); setStreamActive(false); setTimeout(() => { setStreamActive(true); connectMut.mutate(); }, 300); }}
                    className="btn btn-outline text-[12px]"
                  >
                    <RefreshCw size={12} /> Refresh QR
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-[216px] h-[216px] rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3">
                    <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
                    <p className="text-[12.5px] text-[var(--ink-mute)]">Generating QR code…</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DISCONNECTED ──────────────────────────────────────────────── */}
          {!showLoading && status === 'DISCONNECTED' && (
            <div className="flex flex-col items-center gap-5 py-4">
              {connectionError && (
                <div className="w-full flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                  <WifiOff size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12.5px] font-semibold">Connection failed</p>
                    <p className="text-[11.5px] mt-0.5 opacity-80 break-all">{connectionError}</p>
                  </div>
                </div>
              )}
              <div className="w-[216px] h-[216px] rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3">
                <QrCode size={36} className="text-[var(--ink-mute)] opacity-30" />
                <p className="text-[12.5px] text-[var(--ink-mute)]">Not connected</p>
              </div>
              <p className="text-[12.5px] text-[var(--ink-mute)] text-center max-w-xs">
                Link your WhatsApp number so the AI can receive and reply to customer messages automatically.
              </p>
              <button
                onClick={handleConnect}
                disabled={connectMut.isPending}
                className="btn btn-grad px-6 py-2.5"
              >
                {connectMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                {connectionError ? 'Retry Connection' : 'Generate QR Code'}
              </button>
            </div>
          )}
        </div>

        {/* AI Settings — only when connected */}
        {status === 'CONNECTED' && (
          <div className="border-t border-[var(--line)] px-5 py-4 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--ink-mute)]">
              AI Settings
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Auto-Reply</p>
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

            {config?.aiEnabled ? (
              <p className="text-[12px] text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                AI is enabled — responding to lead messages
              </p>
            ) : (
              <p className="text-[12px] text-[#854D0E] bg-[#FEF9C3] border border-[#FDE68A] rounded-lg px-3 py-2">
                AI is disabled — enable the chatbot in Settings to start auto-replying
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
