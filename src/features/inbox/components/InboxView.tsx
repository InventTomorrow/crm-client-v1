"use client";
import { cn, getImageUrl } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { Skeleton, Spinner } from "@/shared/ui/Motion";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCheck,
  ChevronLeft,
  Download,
  Edit2,
  FileText,
  Flame,
  Image,
  Loader2,
  Megaphone,
  Mic,
  MoreVertical,
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
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BroadcasterDialog } from "../../broadcast/components/BroadcasterDialog";
import { WAStatusBadge } from "../../channels/components/WAStatusBadge";
import { useWAStatus } from "../../channels/hooks/useWhatsApp";
import {
  filterConversations,
  useAgentTyping,
  useApproveDraft,
  useConversationDetail,
  useDeleteMessage,
  useEditMessage,
  useEscalate,
  useInfiniteConversations,
  useLeadTyping,
  useMarkConversationRead,
  useMessagesPaginated,
  useResolve,
  useSendHumanReply,
  useSendMedia,
  useToggleAiMode,
  useUploadAttachment,
} from "../hooks/useConversations";
import type {
  ConversationFilter,
  ConversationListItem,
  MobilePane,
} from "../types";

const FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "escalated", label: "Needs Attention" },
];

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function ChatListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-[11px] px-[14px] py-[11px] border-b border-[var(--line-soft)]"
        >
          <Skeleton circle className="w-[38px] h-[38px] flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-[12px] w-28" />
              <Skeleton className="h-[10px] w-8" />
            </div>
            <Skeleton className="h-[10px] w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  const rows = [
    { out: false, w: "w-48" },
    { out: true, w: "w-36" },
    { out: false, w: "w-56" },
    { out: true, w: "w-44" },
    { out: false, w: "w-32" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {rows.map(({ out, w }, i) => (
        <div
          key={i}
          className={`flex ${out ? "justify-end" : "justify-start"}`}
        >
          <div className="flex flex-col gap-1">
            <Skeleton className={`h-9 ${w} rounded-[14px]`} />
            <Skeleton className="h-[9px] w-10 ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EscalationBadge({ status }: { status: string }) {
  if (status === "ESCALATED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.5 rounded-full">
        <Flame size={9} /> Needs Attention
      </span>
    );
  }
  if (status === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">
        <Check size={9} /> Done
      </span>
    );
  }
  return null;
}

// Static pseudo-waveform — deterministic bar heights for the WhatsApp look.
const WAVEFORM_BARS = [
  0.35, 0.55, 0.8, 0.45, 0.95, 0.6, 0.4, 0.7, 1, 0.5, 0.3, 0.65, 0.85, 0.45,
  0.55, 0.9, 0.4, 0.75, 0.6, 0.35, 0.8, 0.5, 0.7, 0.45, 0.6, 0.9, 0.4, 0.55,
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
        try {
          a.currentTime = 1e101;
        } catch {
          /* seeking unsupported */
        }
      }
    };

    a.addEventListener("loadedmetadata", resolveDuration);
    a.addEventListener("durationchange", resolveDuration);
    if (a.readyState >= 1) resolveDuration(); // metadata already available

    return () => {
      a.removeEventListener("loadedmetadata", resolveDuration);
      a.removeEventListener("durationchange", resolveDuration);
    };
  }, [url]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
      } catch {
        /* autoplay/decoding guard */
      }
    } else {
      a.pause();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !knownDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );
    a.currentTime = ratio * duration;
    setProgress(a.currentTime);
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const filledColor = outbound ? "bg-white" : "bg-[var(--accent)]";
  const trackColor = outbound ? "bg-white/35" : "bg-[var(--ink-mute)]/30";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[16px] px-3 py-2.5 min-w-[230px] max-w-[280px]",
        outbound
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]",
      )}
    >
      {/* Play / pause */}
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-transform active:scale-95",
          outbound
            ? "bg-white text-[var(--accent)]"
            : "bg-[var(--accent)] text-white",
        )}
      >
        {playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* Waveform + timer */}
      <div className="flex-1 min-w-0">
        <div
          onClick={seek}
          className={cn(
            "flex items-center gap-[2px] h-7",
            knownDuration && "cursor-pointer",
          )}
        >
          {WAVEFORM_BARS.map((h, i) => {
            const barPct = ((i + 1) / WAVEFORM_BARS.length) * 100;
            const filled = barPct <= pct;
            return (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  filled ? filledColor : trackColor,
                )}
                style={{ height: `${Math.max(h * 100, 18)}%` }}
              />
            );
          })}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[10.5px]",
            outbound ? "text-white/85" : "text-[var(--ink-mute)]",
          )}
        >
          <Mic
            size={11}
            className={outbound ? "text-white/85" : "text-[var(--accent)]"}
          />
          <span>{fmt(playing || progress > 0 ? progress : duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={(e) => {
          if (!probingRef.current) setProgress(e.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
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
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  caption?: string | null;
  outbound: boolean;
}) {
  // Hide caption when it's just the raw URL or a placeholder label
  // (e.g. "[audio]" or "🎤 Voice message") that adds no information.
  const PLACEHOLDER_RE =
    /^(\[(image|video|audio|document)\]|🎤\s*voice message)$/i;
  const showCaption =
    !!caption && caption !== mediaUrl && !PLACEHOLDER_RE.test(caption.trim());

  if (mediaType === "IMAGE") {
    return (
      <div className="rounded-[14px] overflow-hidden max-w-[220px]">
        <ShimmerImage
          src={getImageUrl(mediaUrl)}
          alt="attachment"
          wrapperClassName="w-full"
          loadingClassName="h-[180px] w-[200px]"
          className="w-full object-cover"
          style={{ maxHeight: 260 }}
        />
        {showCaption && (
          <p className="text-[13px] px-1 py-1 text-[var(--ink)]">{caption}</p>
        )}
      </div>
    );
  }

  if (mediaType === "VIDEO") {
    return (
      <div className="rounded-[14px] overflow-hidden max-w-[240px]">
        <video
          src={mediaUrl}
          controls
          className="w-full"
          style={{ maxHeight: 280 }}
        />
        {showCaption && (
          <p className="text-[13px] px-1 py-1 text-[var(--ink)]">{caption}</p>
        )}
      </div>
    );
  }

  if (mediaType === "AUDIO") {
    return (
      <div className="flex flex-col gap-1">
        <AudioBubble url={mediaUrl} outbound={outbound} />
        {showCaption && (
          <p
            className={cn(
              "text-[12.5px] italic px-1",
              outbound
                ? "text-right text-[var(--ink-soft)]"
                : "text-[var(--ink-soft)]",
            )}
          >
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
        "flex items-center gap-2.5 rounded-[14px] px-3 py-2.5 min-w-[180px] max-w-[240px] no-underline",
        outbound
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0",
          outbound ? "bg-white/20" : "bg-[var(--accent-soft)]",
        )}
      >
        <FileText
          size={16}
          className={outbound ? "text-white" : "text-[var(--accent)]"}
        />
      </div>
      <span className="flex-1 min-w-0 truncate text-[12.5px] font-medium">
        {showCaption ? caption : "Document"}
      </span>
      <Download
        size={14}
        className={cn(
          "flex-shrink-0",
          outbound ? "text-white/80" : "text-[var(--ink-mute)]",
        )}
      />
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
  const displayName = conv.lead.name ?? conv.lead.phone ?? "Unknown";
  const unread = conv.unreadCount > 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-[11px] cursor-pointer px-[14px] py-[11px]",
        "border-b border-[var(--line-soft)] border-l-2 transition-[background] duration-[120ms]",
        active
          ? "bg-[var(--accent-soft)] border-l-[var(--accent)]"
          : "border-l-transparent hover:bg-[var(--surface-2)]",
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
          <span className="font-medium text-[13.5px] text-[var(--ink)] truncate">
            {displayName}
          </span>
          {lastMsg && (
            <span className="flex-shrink-0 text-[11px] text-[var(--ink-mute)]">
              {relativeTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[12.5px] truncate flex-1",
              unread ? "text-[var(--ink)] font-medium" : "text-[var(--ink-soft)]",
            )}
          >
            {lastMsg?.senderType === "AI" && (
              <span className="text-[var(--accent)]">AI: </span>
            )}
            {lastMsg?.senderType === "AGENT" && (
              <span className="text-[var(--ink-mute)]">You: </span>
            )}
            {lastMsg?.content ?? "—"}
          </span>
          {unread ? (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-white text-[10.5px] font-semibold inline-flex items-center justify-center">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </span>
          ) : (
            <EscalationBadge status={conv.escalationStatus} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function InboxView() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [mobPane, setMobPane] = useState<MobilePane>("list");
  const [showProfile, setShowProfile] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    previewUrl: string;
    mimeType: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingCancelledRef = useRef(false); // true → discard on stop, don't send

  const {
    data: conversationsData,
    isLoading: listLoading,
    fetchNextPage: fetchNextConvs,
    hasNextPage: hasMoreConvs,
    isFetchingNextPage: fetchingNextConvs,
  } = useInfiniteConversations();
  const conversations = conversationsData?.pages.flat() || [];

  const { data: detail } = useConversationDetail(selectedId);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage: fetchNextMsgs,
    hasNextPage: hasMoreMsgs,
    isFetchingNextPage: fetchingNextMsgs,
  } = useMessagesPaginated(selectedId);
  const messages = [...(messagesData?.pages.flat() || [])].reverse();

  const approveDraftMut = useApproveDraft(selectedId ?? "");
  const sendReplyMut = useSendHumanReply(selectedId ?? "");
  const sendMediaMut = useSendMedia(selectedId ?? "");

  // Agents can only message a lead while the WhatsApp session is live — the
  // server rejects sends otherwise, so we disable the composer to match.
  const { data: waStatus } = useWAStatus();
  const waConnected = waStatus?.status === "CONNECTED";
  const uploadMut = useUploadAttachment();
  const escalateMut = useEscalate();
  const resolveMut = useResolve();
  const aiModeMut = useToggleAiMode(selectedId ?? "");
  const editMut = useEditMessage(selectedId ?? "");
  const deleteMut = useDeleteMessage(selectedId ?? "");

  const typingConversationId = useLeadTyping();
  const leadIsTyping = !!selectedId && typingConversationId === selectedId;
  const { onType: notifyAgentTyping, stop: stopAgentTyping } =
    useAgentTyping(selectedId);

  const searchLower = search.trim().toLowerCase();
  const filtered = filterConversations(conversations, filter).filter((c) => {
    if (!searchLower) return true;
    const name = c.lead.name?.toLowerCase() ?? "";
    const phone = c.lead.phone?.toLowerCase() ?? "";
    return name.includes(searchLower) || phone.includes(searchLower);
  });
  const activeConv = conversations.find((c) => c.id === selectedId);

  // Clear the unread badge when an unread conversation is opened.
  const markReadMut = useMarkConversationRead();
  useEffect(() => {
    if (selectedId && activeConv && activeConv.unreadCount > 0) {
      markReadMut.mutate(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeConv?.unreadCount]);

  // Deep-link from the Leads page: /inbox?lead=<leadId> selects that lead's chat.
  useEffect(() => {
    const leadId = searchParams.get("lead");
    if (!leadId || conversations.length === 0) return;
    const conv = conversations.find((c) => c.lead.id === leadId);
    if (conv) {
      setSelectedId(conv.id);
      setMobPane("chat");
    }
  }, [searchParams, conversations]);

  // Auto-select first conversation (only when not deep-linking)
  useEffect(() => {
    if (!selectedId && !searchParams.get("lead") && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId, searchParams]);

  const msgObserverTarget = useRef<HTMLDivElement>(null);
  const listObserverTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMsgs && !fetchingNextMsgs) {
          fetchNextMsgs();
        }
      },
      { threshold: 0.1 },
    );
    if (msgObserverTarget.current) observer.observe(msgObserverTarget.current);
    return () => observer.disconnect();
  }, [hasMoreMsgs, fetchNextMsgs, selectedId, fetchingNextMsgs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreConvs && !fetchingNextConvs) {
          fetchNextConvs();
        }
      },
      { threshold: 0.1 },
    );
    if (listObserverTarget.current)
      observer.observe(listObserverTarget.current);
    return () => observer.disconnect();
  }, [hasMoreConvs, fetchNextConvs, fetchingNextConvs]);

  const previousScrollHeight = useRef(0);
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    if (isFirstLoad.current || messagesData?.pages.length === 1) {
      // First load or new conversation — scroll to bottom immediately
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
      isFirstLoad.current = false;
    } else {
      // Older page loaded at top — restore position without jump
      const newScrollHeight = el.scrollHeight;
      const delta = newScrollHeight - previousScrollHeight.current;
      // Only adjust if content grew (new page prepended)
      if (delta > 0) {
        el.scrollTop += delta;
      }
    }
    previousScrollHeight.current = el.scrollHeight;
  }, [messages?.length, messagesData?.pages.length]);

  // Reset first-load flag when conversation changes
  useEffect(() => {
    isFirstLoad.current = true;
  }, [selectedId]);

  const handleSend = () => {
    if (!draft.trim() || !selectedId) return;
    if (!waConnected) {
      toast.error("WhatsApp is not connected. Reconnect in Channels to send.");
      return;
    }
    stopAgentTyping();
    if (editingMessageId) {
      if (editMut.isPending) return;
      editMut.mutate({ messageId: editingMessageId, content: draft.trim() });
      setEditingMessageId(null);
    } else {
      if (sendReplyMut.isPending) return;
      sendReplyMut.mutate(draft.trim());
    }
    setDraft("");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setDraft("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingFile({ file, previewUrl, mimeType: file.type });
    e.target.value = "";
  };

  const handleSendFile = async () => {
    if (!pendingFile || !selectedId) return;
    if (!waConnected) {
      toast.error("WhatsApp is not connected. Reconnect in Channels to send.");
      return;
    }
    try {
      const { url } = await uploadMut.mutateAsync(pendingFile.file);
      await sendMediaMut.mutateAsync({
        mediaUrl: url,
        mimeType: pendingFile.mimeType,
      });
      URL.revokeObjectURL(pendingFile.previewUrl);
      setPendingFile(null);
    } catch {
      /* toast shown by mutation */
    }
  };

  const handleCancelFile = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordingCancelledRef.current = false;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        // Discarded by the user — drop the recording, send nothing.
        if (recordingCancelledRef.current) {
          audioChunksRef.current = [];
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        if (!selectedId) return;
        try {
          const { url } = await uploadMut.mutateAsync(audioFile);
          await sendMediaMut.mutateAsync({
            mediaUrl: url,
            mimeType: "audio/webm",
            caption: "🎤 Voice message",
          });
        } catch {
          /* toast shown by mutation */
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((s) => s + 1),
        1000,
      );
    } catch {
      toast.error("Microphone access denied");
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

  const displayName =
    activeConv?.lead.name ?? activeConv?.lead.phone ?? "Conversation";

  return (
    <div className="inbox-layout flex h-full gap-3 p-3">
      {/* ── Conversation List ── */}
      <div
        className={`card inbox-list w-[320px] flex-shrink-0 flex flex-col overflow-hidden ${mobPane === "list" ? "mob-on" : ""}`}
      >
        <div className="px-3.5 pt-3 pb-2">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-[11px] top-[11px] text-[var(--ink-mute)]"
              />
              <input
                className="input pl-8 w-full"
                placeholder="Search by name or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline p-2 h-auto text-[var(--ink-soft)] hover:text-[var(--accent)]"
              onClick={() => setShowBroadcast(true)}
              title="Broadcast Announcement"
            >
              <Megaphone size={16} />
            </button>
            <WAStatusBadge showLabel={false} className="self-center" />
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "btn rounded-full text-[11.5px] h-auto py-1 px-[10px] whitespace-nowrap",
                  filter === f.id ? "btn-grad" : "btn-ghost",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-[var(--line)]" />
        <div className="scroll overflow-y-auto flex-1">
          {listLoading && <ChatListSkeleton />}
          <AnimatePresence>
            {!listLoading && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center py-10 text-[var(--ink-mute)]"
              >
                <Bot size={28} className="mb-2 opacity-40" />
                <p className="text-[12.5px]">No conversations yet</p>
              </motion.div>
            )}
          </AnimatePresence>
          {filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              active={conv.id === selectedId}
              onClick={() => {
                setSelectedId(conv.id);
                setMobPane("chat");
              }}
            />
          ))}
          {fetchingNextConvs && (
            <div className="flex justify-center py-3 flex-shrink-0">
              <Spinner size={16} />
            </div>
          )}
          <div ref={listObserverTarget} className="h-4 w-full flex-shrink-0" />
        </div>
      </div>

      {/* ── Chat Thread ── */}
      <div
        className={`card inbox-chat flex-1 flex flex-col overflow-hidden min-w-0 ${mobPane === "chat" ? "mob-on" : ""}`}
      >
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--ink-mute)]">
            <Bot size={36} className="mb-3 opacity-30" />
            <p className="text-[13px]">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[var(--line)] bg-[var(--surface)] flex-shrink-0">
              <button
                onClick={() => setMobPane("list")}
                className="btn btn-ghost inbox-back-mobile p-1.5"
              >
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
                    {activeConv?.escalationStatus === "ESCALATED" && (
                      <span className="flex-shrink-0">
                        <Flame size={13} className="text-[#EF4444]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-[var(--ink-mute)] flex items-center gap-1.5">
                    <Phone size={10} /> {activeConv?.lead.phone ?? "—"}
                    {activeConv?.escalationStatus === "RESOLVED" && (
                      <span className="text-[#15803D] font-medium">· Done</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Per-chat AI toggle — when off, this chat is handled manually */}
                <button
                  onClick={() => selectedId && aiModeMut.mutate()}
                  disabled={aiModeMut.isPending}
                  title={
                    activeConv?.aiEnabled
                      ? "AI is replying to this chat — click to take over manually"
                      : "AI is off for this chat — click to let AI reply"
                  }
                  className={cn(
                    "btn btn-outline py-[5px] px-[10px] text-[11.5px] gap-1.5",
                    activeConv?.aiEnabled
                      ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "text-[var(--ink-mute)]",
                  )}
                >
                  {aiModeMut.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span className="hide-mobile">
                    AI {activeConv?.aiEnabled ? "On" : "Off"}
                  </span>
                </button>
                {activeConv?.escalationStatus !== "RESOLVED" && (
                  <button
                    onClick={() => selectedId && resolveMut.mutate(selectedId)}
                    disabled={resolveMut.isPending}
                    className="btn btn-outline py-[5px] px-[10px] text-[11.5px] text-[#15803D] border-[#BBF7D0]"
                  >
                    {resolveMut.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCheck size={12} />
                    )}
                    <span className="hide-mobile">Mark Done</span>
                  </button>
                )}
                {activeConv?.escalationStatus !== "ESCALATED" && (
                  <button
                    onClick={() => selectedId && escalateMut.mutate(selectedId)}
                    disabled={escalateMut.isPending}
                    className="btn btn-outline py-[5px] px-[10px] text-[11.5px]"
                  >
                    {escalateMut.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Flame size={12} className="text-[#EF4444]" />
                    )}
                    <span className="hide-mobile">Flag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="scroll flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-[18px]"
              style={{ overscrollBehavior: "contain" }}
            >
              {messagesLoading && <MessageSkeleton />}
              <div
                ref={msgObserverTarget}
                className="h-4 w-full flex-shrink-0"
              />

              <AnimatePresence initial={false}>
                {fetchingNextMsgs && (
                  <motion.div
                    key="older-msgs-loader"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center py-2 gap-1.5 flex-shrink-0"
                  >
                    <Spinner size={14} />
                    <span className="text-xs text-[var(--ink-mute)]">
                      Loading older messages…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((msg) => {
                const isOutbound = msg.senderType !== "CUSTOMER";
                const isAI = msg.senderType === "AI";
                const isAgent = msg.senderType === "AGENT";
                const isDeleted = msg.isDeleted;

                const isWithin15Mins =
                  Date.now() - new Date(msg.createdAt).getTime() <
                  15 * 60 * 1000;
                const isWithin60Mins =
                  Date.now() - new Date(msg.createdAt).getTime() <
                  60 * 60 * 1000;

                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`flex group relative ${isOutbound ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col max-w-[76%] ${isOutbound ? "items-end" : "items-start"}`}
                    >
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

                      {/* Bubble + Options wrapper */}
                      <div className="flex items-center gap-2 w-full">
                        {/* Options trigger (shown on hover, unless message is deleted or draft) */}
                        {!isDeleted && !msg.isDraft && (
                          <div
                            className={cn(
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center flex-shrink-0",
                              isOutbound ? "order-first" : "order-last",
                            )}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="btn btn-ghost p-1 rounded-full text-[var(--ink-mute)] hover:bg-[var(--surface-3)]">
                                  <MoreVertical size={14} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align={isOutbound ? "end" : "start"}
                              >
                                {isOutbound && isWithin15Mins && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setDraft(msg.content ?? "");
                                    }}
                                  >
                                    <Edit2 size={13} className="mr-1.5" />
                                    Edit Message
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteMut.mutate({
                                      messageId: msg.id,
                                      everyone: false,
                                    })
                                  }
                                >
                                  <Trash2 size={13} className="mr-1.5" />
                                  Delete for me
                                </DropdownMenuItem>
                                {isOutbound && isWithin60Mins && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      deleteMut.mutate({
                                        messageId: msg.id,
                                        everyone: true,
                                      })
                                    }
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 size={13} className="mr-1.5" />
                                    Delete for everyone
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {/* Bubble */}
                        {isDeleted ? (
                          <div
                            className={cn(
                              "bubble italic text-[var(--ink-mute)] opacity-70 border border-[var(--line)] bg-transparent",
                              !isOutbound && "received",
                              isOutbound && "sent",
                            )}
                            style={{ fontStyle: "italic" }}
                          >
                            {isOutbound
                              ? "You deleted this message"
                              : "This message was deleted"}
                          </div>
                        ) : msg.mediaType === "IMAGE" && msg.mediaUrl ? (
                          <div
                            className={cn(
                              "rounded-[14px] overflow-hidden max-w-[240px]",
                              isOutbound
                                ? "bg-[var(--accent)]"
                                : "bg-[var(--surface-2)] border border-[var(--line)]",
                              msg.isDraft &&
                                "ring-1 ring-dashed ring-[var(--accent)]",
                            )}
                          >
                            <ShimmerImage
                              src={getImageUrl(msg.mediaUrl)}
                              alt="Product image"
                              wrapperClassName="w-full"
                              loadingClassName="h-[180px] w-[220px]"
                              className="w-full object-cover"
                              style={{ maxHeight: 240 }}
                            />
                            {/* Caption = product details (shown only when content isn't just the URL) */}
                            {msg.content && msg.content !== msg.mediaUrl && (
                              <div
                                className={cn(
                                  "px-2.5 py-1.5 text-[12.5px] leading-snug",
                                  isOutbound
                                    ? "text-white"
                                    : "text-[var(--ink)]",
                                )}
                              >
                                {msg.content}
                                {msg.isDraft && (
                                  <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                                    · Draft
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "bubble",
                              !isOutbound && "received",
                              isOutbound && !msg.isDraft && "sent",
                              msg.isDraft &&
                                "border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] rounded-[14px] px-[14px] py-[8px] text-[13.5px]",
                            )}
                          >
                            {msg.content ?? ""}
                            {msg.isDraft && (
                              <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                                · Draft
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Draft approve button */}
                      {msg.isDraft && (
                        <button
                          onClick={() => approveDraftMut.mutate(msg.id)}
                          disabled={approveDraftMut.isPending || !waConnected}
                          title={
                            !waConnected
                              ? "Connect WhatsApp to send"
                              : undefined
                          }
                          className="btn btn-grad mt-1.5 py-1 px-3 text-[11.5px] self-end disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approveDraftMut.isPending ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Send size={11} />
                          )}
                          Approve & Send
                        </button>
                      )}

                      <div className="flex items-center gap-1 px-1 mt-[3px] text-[10px] text-[var(--ink-mute)]">
                        {shortTime(msg.createdAt)}
                        {!isDeleted && msg.editedAt && <span>· Edited</span>}
                        {isOutbound && !msg.isDraft && !isDeleted && (
                          <Check size={10} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <AnimatePresence initial={false}>
                {leadIsTyping && (
                  <motion.div
                    key="lead-typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5 self-start rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] px-3 py-2.5"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--ink-mute)]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-[var(--line)]">
              {/* File preview */}
              {pendingFile && (
                <div className="flex items-center gap-2.5 px-3 py-2 bg-[var(--surface-2)] border-b border-[var(--line)]">
                  {pendingFile.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pendingFile.previewUrl}
                      alt="preview"
                      className="h-12 w-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : pendingFile.mimeType.startsWith("video/") ? (
                    <div className="h-12 w-12 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                      <Video size={20} className="text-[var(--accent)]" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-[var(--ink-mute)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[var(--ink)] truncate">
                      {pendingFile.file.name}
                    </p>
                    <p className="text-[11px] text-[var(--ink-mute)]">
                      {(pendingFile.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleCancelFile}
                    className="btn btn-ghost p-1.5 text-[var(--ink-mute)]"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={handleSendFile}
                    disabled={uploadMut.isPending || sendMediaMut.isPending}
                    className="btn btn-grad py-1.5 px-3 text-[12px]"
                  >
                    {uploadMut.isPending || sendMediaMut.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
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
                      {Math.floor(recordingSeconds / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(recordingSeconds % 60).toString().padStart(2, "0")}
                    </span>
                    <span className="text-[12px] text-[#B91C1C]/70 truncate">
                      Recording…
                    </span>
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

              {/* Editing message bar */}
              {editingMessageId && (
                <div className="flex items-center justify-between gap-2.5 px-3.5 py-2 bg-[var(--accent-soft)] border-b border-[var(--line)]">
                  <div className="flex items-center gap-2 text-[12.5px] text-[var(--accent)] font-medium">
                    <Edit2 size={14} />
                    <span>Editing message</span>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Text input + toolbar */}
              <div className="p-2.5">
                {!waConnected && (
                  <Link
                    href="/channels"
                    className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium bg-[#FEF9C3] text-[#854D0E] hover:opacity-90"
                  >
                    <AlertTriangle size={12} className="flex-shrink-0" />
                    WhatsApp isn’t connected — reconnect in Channels to send
                    messages.
                  </Link>
                )}
                <div className="flex items-end gap-1 p-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                  <textarea
                    rows={1}
                    value={draft}
                    disabled={!waConnected}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (e.target.value.trim()) notifyAgentTyping();
                      else stopAgentTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      !waConnected
                        ? "Connect WhatsApp to send messages…"
                        : editingMessageId
                          ? "Edit your message… (Enter to update)"
                          : "Type a reply… (Enter to send)"
                    }
                    className="flex-1 resize-none border-none bg-transparent outline-none p-2 min-h-[36px] text-[13.5px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    className="btn btn-grad py-2 px-[14px] flex-shrink-0"
                    onClick={handleSend}
                    disabled={
                      !waConnected ||
                      !draft.trim() ||
                      (editingMessageId
                        ? editMut.isPending
                        : sendReplyMut.isPending)
                    }
                  >
                    {editingMessageId ? (
                      editMut.isPending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <span className="text-[12.5px] font-semibold">
                          Update
                        </span>
                      )
                    ) : sendReplyMut.isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
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
                      disabled={!waConnected}
                      onClick={() => {
                        fileInputRef.current?.setAttribute("accept", "image/*");
                        fileInputRef.current?.click();
                      }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Image size={15} />
                    </button>
                    {/* Video */}
                    <button
                      title="Send video"
                      disabled={!waConnected}
                      onClick={() => {
                        fileInputRef.current?.setAttribute("accept", "video/*");
                        fileInputRef.current?.click();
                      }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Video size={15} />
                    </button>
                    {/* Document */}
                    <button
                      title="Send document"
                      disabled={!waConnected}
                      onClick={() => {
                        fileInputRef.current?.setAttribute(
                          "accept",
                          ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
                        );
                        fileInputRef.current?.click();
                      }}
                      className="btn btn-ghost p-1.5 text-[var(--ink-mute)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Paperclip size={15} />
                    </button>
                    {/* Voice — starts recording; the recording bar owns stop/cancel/send */}
                    <button
                      title="Record voice message"
                      onClick={startRecording}
                      disabled={isRecording || !waConnected}
                      className={cn(
                        "btn btn-ghost p-1.5 disabled:opacity-50 disabled:cursor-not-allowed",
                        isRecording
                          ? "text-[#EF4444]"
                          : "text-[var(--ink-mute)] hover:text-[var(--accent)]",
                      )}
                    >
                      <Mic size={15} />
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Profile Panel ── */}
      {showProfile && selectedId && activeConv && (
        <div
          className={`card inbox-profile w-[260px] flex-shrink-0 flex flex-col overflow-y-auto gap-3 p-4 ${mobPane === "profile" ? "mob-on" : ""}`}
        >
          <button
            onClick={() => setMobPane("chat")}
            className="btn btn-ghost inbox-back-mobile self-start p-1.5 -mb-2"
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div className="flex flex-col items-center gap-2 pt-2">
            <CRMAvatar name={displayName} size={60} />
            <h4 className="text-[15px] font-semibold text-[var(--ink)] mt-1">
              {displayName}
            </h4>
            <EscalationBadge status={activeConv.escalationStatus} />
          </div>

          <div className="card p-3 bg-[var(--surface-2)] flex flex-col gap-2 text-[12.5px]">
            <div className="flex items-center gap-2">
              <Phone size={11} className="text-[var(--ink-mute)]" />
              <span className="text-[var(--ink-mute)]">Phone:</span>
              <span className="font-medium text-[var(--ink)]">
                {activeConv.lead.phone ?? "—"}
              </span>
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
                {detail?.messages.filter((m: any) => !m.isDraft).length ?? 0}
              </span>
            </div>
            {detail?.messages.some((m) => m.isDraft) && (
              <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-[var(--accent)]">
                <AlertTriangle size={11} />
                {detail.messages.filter((m) => m.isDraft).length} draft
                {detail.messages.filter((m) => m.isDraft).length > 1
                  ? "s"
                  : ""}{" "}
                pending review
              </div>
            )}
          </div>

          {/* Escalation actions */}
          <div className="flex flex-col gap-2 mt-auto">
            {activeConv.escalationStatus !== "RESOLVED" && (
              <button
                onClick={() => resolveMut.mutate(selectedId)}
                disabled={resolveMut.isPending}
                className="btn btn-outline justify-center py-2 text-[12px] text-[#15803D] border-[#BBF7D0]"
              >
                <CheckCheck size={13} /> Mark Done
              </button>
            )}
            {activeConv.escalationStatus !== "ESCALATED" && (
              <button
                onClick={() => escalateMut.mutate(selectedId)}
                disabled={escalateMut.isPending}
                className="btn btn-outline justify-center py-2 text-[12px]"
              >
                <Flame size={13} className="text-[#EF4444]" /> Flag
              </button>
            )}
          </div>
        </div>
      )}

      <BroadcasterDialog
        open={showBroadcast}
        onClose={() => setShowBroadcast(false)}
      />
    </div>
  );
}
