'use client';
import { cn, getImageUrl } from '@/lib/utils';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCheck,
  ChevronLeft,
  Download,
  FileText,
  Flame,
  Image,
  Loader2,
  Mic,
  Paperclip,
  Pause,
  Phone,
  Play,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  filterConversations,
  useApproveDraft,
  useConversationDetail,
  useConversations,
  useEscalate,
  useResolve,
  useSendHumanReply,
  useSendMedia,
  useUploadAttachment,
} from '../hooks/useConversations';
import type { ConversationFilter, ConversationListItem, MobilePane } from '../types';

const FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'escalated', label: 'Escalated' },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function EscalationBadge({ status }: { status: string }) {
  if (status === 'ESCALATED') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.5 rounded-full">
        <Flame size={9} /> Escalated
      </span>
    );
  }
  if (status === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">
        <Check size={9} /> Resolved
      </span>
    );
  }
  return null;
}

// Static pseudo-waveform — deterministic bar heights for the WhatsApp look.
const WAVEFORM_BARS = [
  0.35, 0.55, 0.8, 0.45, 0.95, 0.6, 0.4, 0.7, 1, 0.5, 0.3, 0.65,
  0.85, 0.45, 0.55, 0.9, 0.4, 0.75, 0.6, 0.35, 0.8, 0.5, 0.7, 0.45,
  0.6, 0.9, 0.4, 0.55,
];

/** WhatsApp-style voice note player: play/pause, seekable waveform, timer, mic. */
function AudioBubble({ url, outbound }: { url: string; outbound: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const probingRef = useRef(false); // true while forcing duration calc
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const knownDuration = Number.isFinite(duration) && duration > 0;
  const pct = knownDuration ? Math.min((progress / duration) * 100, 100) : 0;

  // .ogg/opus and .webm recordings often lack a duration header, so the browser
  // reports Infinity. Seeking to a huge time forces it to scan and compute the
  // real duration, which then arrives via `durationchange`; we reset to 0 after.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const resolveDuration = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setDuration(a.duration);
        if (probingRef.current) {
          probingRef.current = false;
          a.currentTime = 0;
        }
      } else if (!probingRef.current) {
        probingRef.current = true;
        try { a.currentTime = 1e101; } catch { /* seeking unsupported */ }
      }
    };

    a.addEventListener('loadedmetadata', resolveDuration);
    a.addEventListener('durationchange', resolveDuration);
    if (a.readyState >= 1) resolveDuration(); // metadata already available

    return () => {
      a.removeEventListener('loadedmetadata', resolveDuration);
      a.removeEventListener('durationchange', resolveDuration);
    };
  }, [url]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { try { await a.play(); } catch { /* autoplay/decoding guard */ } }
    else { a.pause(); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !knownDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    a.currentTime = ratio * duration;
    setProgress(a.currentTime);
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const filledColor = outbound ? 'bg-white' : 'bg-[var(--accent)]';
  const trackColor  = outbound ? 'bg-white/35' : 'bg-[var(--ink-mute)]/30';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[16px] px-3 py-2.5 min-w-[230px] max-w-[280px]',
        outbound ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]',
      )}
    >
      {/* Play / pause */}
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-transform active:scale-95',
          outbound ? 'bg-white text-[var(--accent)]' : 'bg-[var(--accent)] text-white',
        )}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Waveform + timer */}
      <div className="flex-1 min-w-0">
        <div
          onClick={seek}
          className={cn('flex items-center gap-[2px] h-7', knownDuration && 'cursor-pointer')}
        >
          {WAVEFORM_BARS.map((h, i) => {
            const barPct = ((i + 1) / WAVEFORM_BARS.length) * 100;
            const filled = barPct <= pct;
            return (
              <span
                key={i}
                className={cn('flex-1 rounded-full transition-colors', filled ? filledColor : trackColor)}
                style={{ height: `${Math.max(h * 100, 18)}%` }}
              />
            );
          })}
        </div>
        <div className={cn('flex items-center gap-1 mt-1 text-[10.5px]', outbound ? 'text-white/85' : 'text-[var(--ink-mute)]')}>
          <Mic size={11} className={outbound ? 'text-white/85' : 'text-[var(--accent)]'} />
          <span>{fmt(playing || progress > 0 ? progress : duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={(e) => { if (!probingRef.current) setProgress(e.currentTarget.currentTime); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
    </div>
  );
}

/** Renders inbound/outbound media (image, video, audio, document) WhatsApp-style. */
function MediaBubble({
  mediaUrl,
  mediaType,
  caption,
  outbound,
}: {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  caption?: string | null;
  outbound: boolean;
}) {
  // Hide caption when it's just the raw URL or a placeholder label
  // (e.g. "[audio]" or "🎤 Voice message") that adds no information.
  const PLACEHOLDER_RE = /^(\[(image|video|audio|document)\]|🎤\s*voice message)$/i;
  const showCaption =
    !!caption && caption !== mediaUrl && !PLACEHOLDER_RE.test(caption.trim());

  if (mediaType === 'IMAGE') {
    return (
      <div className="rounded-[14px] overflow-hidden max-w-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getImageUrl(mediaUrl)} alt="attachment" className="w-full object-cover" style={{ maxHeight: 260 }} />
        {showCaption && <p className="text-[13px] px-1 py-1 text-[var(--ink)]">{caption}</p>}
      </div>
    );
  }

  if (mediaType === 'VIDEO') {
    return (
      <div className="rounded-[14px] overflow-hidden max-w-[240px]">
        <video src={mediaUrl} controls className="w-full" style={{ maxHeight: 280 }} />
        {showCaption && <p className="text-[13px] px-1 py-1 text-[var(--ink)]">{caption}</p>}
      </div>
    );
  }

  if (mediaType === 'AUDIO') {
    return (
      <div className="flex flex-col gap-1">
        <AudioBubble url={mediaUrl} outbound={outbound} />
        {showCaption && (
          <p className={cn('text-[12.5px] italic px-1', outbound ? 'text-right text-[var(--ink-soft)]' : 'text-[var(--ink-soft)]')}>
            “{caption}”
          </p>
        )}
      </div>
    );
  }

  // DOCUMENT
  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 min-w-[180px] max-w-[240px] no-underline',
        outbound ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]',
      )}
    >
      <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', outbound ? 'bg-white/20' : 'bg-[var(--accent-soft)]')}>
        <FileText size={16} className={outbound ? 'text-white' : 'text-[var(--accent)]'} />
      </div>
      <span className="flex-1 min-w-0 truncate text-[12.5px] font-medium">
        {showCaption ? caption : 'Document'}
      </span>
      <Download size={14} className={cn('flex-shrink-0', outbound ? 'text-white/80' : 'text-[var(--ink-mute)]')} />
    </a>
  );
}

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: ConversationListItem;
  active: boolean;
  onClick: () => void;
}) {
  const lastMsg = conv.messages[0];
  const displayName = conv.lead.name ?? conv.lead.phone ?? 'Unknown';
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-[11px] cursor-pointer px-[14px] py-[11px]',
        'border-b border-[var(--line-soft)] border-l-2 transition-[background] duration-[120ms]',
        active ? 'bg-[var(--accent-soft)] border-l-[var(--accent)]' : 'border-l-transparent hover:bg-[var(--surface-2)]',
      )}
    >
      <div className="relative flex-shrink-0">
        <CRMAvatar name={displayName} size={38} />
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] bg-[#25D366] flex items-center justify-center">
          <span className="text-[7px] text-white font-bold">W</span>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-1.5 mb-0.5">
          <span className="font-medium text-[13.5px] text-[var(--ink)] truncate">{displayName}</span>
          {lastMsg && (
            <span className="flex-shrink-0 text-[11px] text-[var(--ink-mute)]">
              {relativeTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] text-[var(--ink-soft)] truncate flex-1">
            {lastMsg?.senderType === 'AI' && <span className="text-[var(--accent)]">AI: </span>}
            {lastMsg?.senderType === 'AGENT' && <span className="text-[var(--ink-mute)]">You: </span>}
            {lastMsg?.content ?? '—'}
          </span>
          <EscalationBadge status={conv.escalationStatus} />
        </div>
      </div>
    </div>
  );
}

export function InboxView() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [mobPane, setMobPane] = useState<MobilePane>('list');
  const [showProfile, setShowProfile] = useState(true);
  const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingCancelledRef = useRef(false); // true → discard on stop, don't send

  const { data: conversations = [], isLoading: listLoading } = useConversations();
  const { data: detail, isLoading: detailLoading } = useConversationDetail(selectedId);

  const approveDraftMut = useApproveDraft(selectedId ?? '');
  const sendReplyMut = useSendHumanReply(selectedId ?? '');
  const sendMediaMut = useSendMedia(selectedId ?? '');
  const uploadMut = useUploadAttachment();
  const escalateMut = useEscalate();
  const resolveMut = useResolve();

  const searchLower = search.trim().toLowerCase();
  const filtered = filterConversations(conversations, filter).filter((c) => {
    if (!searchLower) return true;
    const name = c.lead.name?.toLowerCase() ?? '';
    const phone = c.lead.phone?.toLowerCase() ?? '';
    return name.includes(searchLower) || phone.includes(searchLower);
  });
  const activeConv = conversations.find((c) => c.id === selectedId);

  // Deep-link from the Leads page: /inbox?lead=<leadId> selects that lead's chat.
  useEffect(() => {
    const leadId = searchParams.get('lead');
    if (!leadId || conversations.length === 0) return;
    const conv = conversations.find((c) => c.lead.id === leadId);
    if (conv) {
      setSelectedId(conv.id);
      setMobPane('chat');
    }
  }, [searchParams, conversations]);

  // Auto-select first conversation (only when not deep-linking)
  useEffect(() => {
    if (!selectedId && !searchParams.get('lead') && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId, searchParams]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [detail?.messages.length]);

  const handleSend = () => {
    if (!draft.trim() || !selectedId || sendReplyMut.isPending) return;
    sendReplyMut.mutate(draft.trim());
    setDraft('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingFile({ file, previewUrl, mimeType: file.type });
    e.target.value = '';
  };

  const handleSendFile = async () => {
    if (!pendingFile || !selectedId) return;
    try {
      const { url } = await uploadMut.mutateAsync(pendingFile.file);
      await sendMediaMut.mutateAsync({ mediaUrl: url, mimeType: pendingFile.mimeType });
      URL.revokeObjectURL(pendingFile.previewUrl);
      setPendingFile(null);
    } catch { /* toast shown by mutation */ }
  };

  const handleCancelFile = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recordingCancelledRef.current = false;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        // Discarded by the user — drop the recording, send nothing.
        if (recordingCancelledRef.current) {
          audioChunksRef.current = [];
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        if (!selectedId) return;
        try {
          const { url } = await uploadMut.mutateAsync(audioFile);
          await sendMediaMut.mutateAsync({ mediaUrl: url, mimeType: 'audio/webm', caption: '🎤 Voice message' });
        } catch { /* toast shown by mutation */ }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopTimer = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Stop and SEND the recording.
  const sendRecording = () => {
    recordingCancelledRef.current = false;
    mediaRecorderRef.current?.stop();
    stopTimer();
  };

  // Stop and DISCARD the recording (no upload, no send).
  const cancelRecording = () => {
    recordingCancelledRef.current = true;
    mediaRecorderRef.current?.stop();
    stopTimer();
  };

  const displayName = activeConv?.lead.name ?? activeConv?.lead.phone ?? 'Conversation';

  return (
    <div className="inbox-layout flex h-full gap-3 p-3">

      {/* ── Conversation List ── */}
      <div className={`card inbox-list w-[320px] flex-shrink-0 flex flex-col overflow-hidden ${mobPane === 'list' ? 'mob-on' : ''}`}>
        <div className="px-3.5 pt-3 pb-2">
          <div className="relative mb-2">
            <Search size={13} className="absolute left-[11px] top-[11px] text-[var(--ink-mute)]" />
            <input
              className="input pl-8"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'btn rounded-full text-[11.5px] h-auto py-1 px-[10px] whitespace-nowrap',
                  filter === f.id ? 'btn-grad' : 'btn-ghost',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-[var(--line)]" />
        <div className="scroll overflow-y-auto flex-1">
          {listLoading && (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[var(--ink-mute)]" /></div>
          )}
          {!listLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-[var(--ink-mute)]">
              <Bot size={28} className="mb-2 opacity-40" />
              <p className="text-[12.5px]">No conversations yet</p>
            </div>
          )}
          {filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              active={conv.id === selectedId}
              onClick={() => { setSelectedId(conv.id); setMobPane('chat'); }}
            />
          ))}
        </div>
      </div>

      {/* ── Chat Thread ── */}
      <div className={`card inbox-chat flex-1 flex flex-col overflow-hidden min-w-0 ${mobPane === 'chat' ? 'mob-on' : ''}`}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--ink-mute)]">
            <Bot size={36} className="mb-3 opacity-30" />
            <p className="text-[13px]">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[var(--line)] bg-[var(--surface)] flex-shrink-0">
              <button onClick={() => setMobPane('list')} className="btn btn-ghost inbox-back-mobile p-1.5">
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setShowProfile((v) => !v)}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer p-1 -m-1 rounded-lg text-left border-none bg-transparent"
              >
                <CRMAvatar name={displayName} size={34} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[14px] truncate">{displayName}</h4>
                    {activeConv?.escalationStatus === 'ESCALATED' && (
                      <span className="flex-shrink-0"><Flame size={13} className="text-[#EF4444]" /></span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-[var(--ink-mute)] flex items-center gap-1.5">
                    <Phone size={10} /> {activeConv?.lead.phone ?? '—'}
                    {activeConv?.escalationStatus === 'RESOLVED' && (
                      <span className="text-[#15803D] font-medium">· Resolved</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {activeConv?.escalationStatus !== 'RESOLVED' && (
                  <button
                    onClick={() => selectedId && resolveMut.mutate(selectedId)}
                    disabled={resolveMut.isPending}
                    className="btn btn-outline py-[5px] px-[10px] text-[11.5px] text-[#15803D] border-[#BBF7D0]"
                  >
                    {resolveMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                    <span className="hide-mobile">Resolve</span>
                  </button>
                )}
                {activeConv?.escalationStatus !== 'ESCALATED' && (
                  <button
                    onClick={() => selectedId && escalateMut.mutate(selectedId)}
                    disabled={escalateMut.isPending}
                    className="btn btn-outline py-[5px] px-[10px] text-[11.5px]"
                  >
                    {escalateMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Flame size={12} className="text-[#EF4444]" />}
                    <span className="hide-mobile">Escalate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="scroll flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-[18px]">
              {detailLoading && (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[var(--ink-mute)]" /></div>
              )}

              {detail?.messages.map((msg) => {
                const isOutbound = msg.senderType !== 'CUSTOMER';
                const isAI = msg.senderType === 'AI';
                const isAgent = msg.senderType === 'AGENT';

                return (
                  <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col max-w-[76%] ${isOutbound ? 'items-end' : 'items-start'}`}>
                      {/* Sender label */}
                      <div className="flex items-center gap-1 px-1 mb-1">
                        {isAI && (
                          <span className="flex items-center gap-1 text-[10.5px] text-[var(--accent)] font-medium">
                            <Sparkles size={10} /> AI Agent
                          </span>
                        )}
                        {isAgent && (
                          <span className="flex items-center gap-1 text-[10.5px] text-[var(--ink-mute)]">
                            <User size={10} /> You
                          </span>
                        )}
                      </div>

                      {/* Bubble */}
                      {msg.mediaType === 'IMAGE' && msg.mediaUrl ? (
                        <div
                          className={cn(
                            'rounded-[14px] overflow-hidden max-w-[240px]',
                            isOutbound ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)] border border-[var(--line)]',
                            msg.isDraft && 'ring-1 ring-dashed ring-[var(--accent)]',
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(msg.mediaUrl)}
                            alt="Product image"
                            className="w-full object-cover"
                            style={{ maxHeight: 240 }}
                          />
                          {/* Caption = product details (shown only when content isn't just the URL) */}
                          {msg.content && msg.content !== msg.mediaUrl && (
                            <div className={cn('px-2.5 py-1.5 text-[12.5px] leading-snug', isOutbound ? 'text-white' : 'text-[var(--ink)]')}>
                              {msg.content}
                              {msg.isDraft && (
                                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">· Draft</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'bubble',
                            !isOutbound && 'received',
                            isOutbound && !msg.isDraft && 'sent',
                            msg.isDraft && 'border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] rounded-[14px] px-[14px] py-[8px] text-[13.5px]',
                          )}
                        >
                          {msg.content ?? ''}
                          {msg.isDraft && (
                            <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">· Draft</span>
                          )}
                        </div>
                      )}

                      {/* Draft approve button */}
                      {msg.isDraft && (
                        <button
                          onClick={() => approveDraftMut.mutate(msg.id)}
                          disabled={approveDraftMut.isPending}
                          className="btn btn-grad mt-1.5 py-1 px-3 text-[11.5px] self-end"
                        >
                          {approveDraftMut.isPending
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Send size={11} />}
                          Approve & Send
                        </button>
                      )}

                      <div className="flex items-center gap-1 px-1 mt-[3px] text-[10px] text-[var(--ink-mute)]">
                        {shortTime(msg.createdAt)}
                        {isOutbound && !msg.isDraft && <Check size={10} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-[var(--line)]">
              {/* File preview */}
              {pendingFile && (
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[var(--surface-2)] border-b border-[var(--line)]">
                  {pendingFile.mimeType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pendingFile.previewUrl} alt="preview" className="h-12 w-12 object-cover rounded-lg flex-shrink-0" />
                  ) : pendingFile.mimeType.startsWith('video/') ? (
                    <div className="h-12 w-12 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                      <Video size={20} className="text-[var(--accent)]" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-[var(--ink-mute)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[var(--ink)] truncate">{pendingFile.file.name}</p>
                    <p className="text-[11px] text-[var(--ink-mute)]">{(pendingFile.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={handleCancelFile} className="btn btn-ghost p-1.5 text-[var(--ink-mute)]">
                    <X size={14} />
                  </button>
                  <button
                    onClick={handleSendFile}
                    disabled={uploadMut.isPending || sendMediaMut.isPending}
                    className="btn btn-grad py-1.5 px-3 text-[12px]"
                  >
                    {(uploadMut.isPending || sendMediaMut.isPending) ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Send
                  </button>
                </div>
              )}

              {/* Voice recording bar — WhatsApp style: delete · timer · send */}
              {isRecording && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-[#FEF2F2] border-b border-[#FECACA]">
                  {/* Delete / cancel */}
                  <button
                    onClick={cancelRecording}
                    title="Delete recording"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-[#EF4444] hover:bg-[#FECACA]/40 flex-shrink-0"
                  >
                    <Trash2 size={17} />
                  </button>

                  {/* Pulsing dot + timer */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0" />
                    <span className="text-[13px] font-medium text-[#EF4444] tabular-nums">
                      {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[12px] text-[#B91C1C]/70 truncate">Recording…</span>
                  </div>

                  {/* Send */}
                  <button
                    onClick={sendRecording}
                    title="Send voice message"
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent)] text-white flex-shrink-0 transition-transform active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}

              {/* Text input + toolbar */}
              <div className="p-2.5">
                <div className="flex items-end gap-1 p-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                  <textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Type a reply… (Enter to send)"
                    className="flex-1 resize-none border-none bg-transparent outline-none p-2 min-h-[36px] text-[13.5px] text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
                  />
                  <button
                    className="btn btn-grad py-2 px-[14px] flex-shrink-0"
                    onClick={handleSend}
                    disabled={!draft.trim() || sendReplyMut.isPending}
                  >
                    {sendReplyMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>

                {/* Attachment toolbar */}
                <div className="flex items-center gap-1 mt-1.5 px-0.5">
                  <span className="text-[10.5px] text-[var(--ink-mute)] flex items-center gap-1 mr-1">
                    <User size={10} /> Human reply
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    {/* Image */}
                    <button
                      title="Send image"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)]"
                    >
                      <Image size={15} />
                    </button>
                    {/* Video */}
                    <button
                      title="Send video"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', 'video/*'); fileInputRef.current?.click(); }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)]"
                    >
                      <Video size={15} />
                    </button>
                    {/* Document */}
                    <button
                      title="Send document"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'); fileInputRef.current?.click(); }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)]"
                    >
                      <Paperclip size={15} />
                    </button>
                    {/* Voice — starts recording; the recording bar owns stop/cancel/send */}
                    <button
                      title="Record voice message"
                      onClick={startRecording}
                      disabled={isRecording}
                      className={cn(
                        'btn btn-ghost p-1.5',
                        isRecording ? 'text-[#EF4444]' : 'text-[var(--ink-mute)] hover:text-[var(--accent)]',
                      )}
                    >
                      <Mic size={15} />
                    </button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Profile Panel ── */}
      {showProfile && selectedId && activeConv && (
        <div className={`card inbox-profile w-[260px] flex-shrink-0 flex flex-col overflow-y-auto gap-3 p-4 ${mobPane === 'profile' ? 'mob-on' : ''}`}>
          <button onClick={() => setMobPane('chat')} className="btn btn-ghost inbox-back-mobile self-start p-1.5 -mb-2">
            <ChevronLeft size={18} /> Back
          </button>

          <div className="flex flex-col items-center gap-2 pt-2">
            <CRMAvatar name={displayName} size={60} />
            <h4 className="text-[15px] font-semibold text-[var(--ink)] mt-1">{displayName}</h4>
            <EscalationBadge status={activeConv.escalationStatus} />
          </div>

          <div className="card p-3 bg-[var(--surface-2)] flex flex-col gap-2 text-[12.5px]">
            <div className="flex items-center gap-2">
              <Phone size={11} className="text-[var(--ink-mute)]" />
              <span className="text-[var(--ink-mute)]">Phone:</span>
              <span className="font-medium text-[var(--ink)]">{activeConv.lead.phone ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot size={11} className="text-[var(--ink-mute)]" />
              <span className="text-[var(--ink-mute)]">Channel:</span>
              <span className="font-medium text-[var(--ink)]">WhatsApp</span>
            </div>
          </div>

          {/* Message count */}
          <div className="card p-3 bg-[var(--surface-2)]">
            <div className="flex justify-between items-center mb-1 text-[11px] text-[var(--ink-mute)] uppercase tracking-[0.06em] font-semibold">
              <span>Messages</span>
              <span className="text-[var(--accent)] font-semibold text-[14px] font-[var(--font-head)]">
                {detail?.messages.filter((m) => !m.isDraft).length ?? 0}
              </span>
            </div>
            {detail?.messages.some((m) => m.isDraft) && (
              <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-[var(--accent)]">
                <AlertTriangle size={11} />
                {detail.messages.filter((m) => m.isDraft).length} draft{detail.messages.filter((m) => m.isDraft).length > 1 ? 's' : ''} pending review
              </div>
            )}
          </div>

          {/* Escalation actions */}
          <div className="flex flex-col gap-2 mt-auto">
            {activeConv.escalationStatus !== 'RESOLVED' && (
              <button
                onClick={() => resolveMut.mutate(selectedId)}
                disabled={resolveMut.isPending}
                className="btn btn-outline justify-center py-2 text-[12px] text-[#15803D] border-[#BBF7D0]"
              >
                <CheckCheck size={13} /> Mark Resolved
              </button>
            )}
            {activeConv.escalationStatus !== 'ESCALATED' && (
              <button
                onClick={() => escalateMut.mutate(selectedId)}
                disabled={escalateMut.isPending}
                className="btn btn-outline justify-center py-2 text-[12px]"
              >
                <Flame size={13} className="text-[#EF4444]" /> Escalate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
