"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { CRMSwitch } from "@/shared/ui/CRMSwitch";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { Input } from "@/shared/ui/Input";
import { Spinner } from "@/shared/ui/Motion";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCheck,
  ChevronLeft,
  Edit2,
  FileAudio,
  FileText,
  Flame,
  Image,
  Loader2,
  Mail,
  Megaphone,
  Mic,
  MoreVertical,
  Package,
  Palette,
  Paperclip,
  Phone,
  Plus,
  Send,
  ShoppingCart,
  Smile,
  Star,
  Trash2,
  Video,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BroadcasterDialog } from "../../broadcast/components/BroadcasterDialog";
import { useWAStatus } from "../../channels/hooks/useWhatsApp";
import { STATUS_META } from "../../leads/types";
import { OrderForm } from "../../orders/components/OrderForm";
import { useCreateOrder, useLeadOrders } from "../../orders/hooks/useOrders";
import {
  BUILT_IN_TABS,
  CHAT_BG_PRESETS,
  EMOJI_LIST,
  type CustomTab,
} from "../constants";
import {
  filterConversations,
  useAgentTyping,
  useApproveDraft,
  useConversationDetail,
  useConversationStream,
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
import { groupByDay } from "../lib/time";
import type {
  ConversationFilter,
  ConversationListItem,
  ConversationMessage,
  MobilePane,
} from "../types";
import { ConversationRow } from "./ConversationRow";
import { DateSeparator } from "./DateSeparator";
import { EscalationBadge } from "./EscalationBadge";
import { MessageBubble } from "./MessageBubble";
import { NewChatDialog } from "./NewChatDialog";
import { ChatListSkeleton, MessageSkeleton } from "./Skeletons";

export function InboxView() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [mobPane, setMobPane] = useState<MobilePane>("list");
  // Profile detail sheet is open by default; the user can collapse it.
  const [showProfile, setShowProfile] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [chatBg, setChatBg] = useState<string>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("asaanrabta_chat_bg") ?? "";
    return "";
  });
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("asaanrabta_favorites");
      return s ? new Set(JSON.parse(s)) : new Set();
    }
    return new Set();
  });
  const [archived, setArchived] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("asaanrabta_archived");
      return s ? new Set(JSON.parse(s)) : new Set();
    }
    return new Set();
  });
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("asaanrabta_hidden_chats");
      return s ? new Set(JSON.parse(s)) : new Set();
    }
    return new Set();
  });
  // Chat pending deletion confirmation (id) and message pending deletion.
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deleteMsgTarget, setDeleteMsgTarget] = useState<{
    messageId: string;
    canDeleteEveryone: boolean;
  } | null>(null);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("asaanrabta_custom_tabs");
      return s ? JSON.parse(s) : [];
    }
    return [];
  });
  const [addingTab, setAddingTab] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState("");
  const [tabAssignments, setTabAssignments] = useState<
    Record<string, string[]>
  >(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("asaanrabta_tab_assignments");
      return s ? JSON.parse(s) : {};
    }
    return {};
  });
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const createOrder = useCreateOrder();
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
  const selectedLeadId =
    conversations.find((c) => c.id === selectedId)?.lead.id ?? null;
  const { data: leadOrders, isLoading: leadOrdersLoading } = useLeadOrders(
    showProfile ? selectedLeadId : null,
  );

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

  // Stable handlers so memoized MessageBubble rows skip re-render on keystrokes.
  const handleEditMessage = useCallback((m: ConversationMessage) => {
    setEditingMessageId(m.id);
    setDraft(m.content ?? "");
  }, []);
  const handleApproveDraft = useCallback(
    (id: string) => approveDraftMut.mutate(id),
    [approveDraftMut],
  );

  useConversationStream();
  const typingConversationId = useLeadTyping();
  const leadIsTyping = !!selectedId && typingConversationId === selectedId;
  const { onType: notifyAgentTyping, stop: stopAgentTyping } =
    useAgentTyping(selectedId);

  const filtered = filterConversations(
    conversations,
    filter,
    favorites,
    tabAssignments,
    archived,
    hiddenChats,
  );

  const assignToTab = (convId: string, tabId: string) => {
    setTabAssignments((prev) => {
      const ids = prev[tabId] ?? [];
      if (ids.includes(convId)) return prev;
      const next = { ...prev, [tabId]: [...ids, convId] };
      localStorage.setItem("asaanrabta_tab_assignments", JSON.stringify(next));
      return next;
    });
  };

  const removeFromTab = (convId: string, tabId: string) => {
    setTabAssignments((prev) => {
      const next = {
        ...prev,
        [tabId]: (prev[tabId] ?? []).filter((id) => id !== convId),
      };
      localStorage.setItem("asaanrabta_tab_assignments", JSON.stringify(next));
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("asaanrabta_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleArchive = (id: string) => {
    setArchived((prev) => {
      const next = new Set(prev);
      const archiving = !next.has(id);
      if (archiving) next.add(id);
      else next.delete(id);
      localStorage.setItem("asaanrabta_archived", JSON.stringify([...next]));
      toast.success(archiving ? "Chat archived" : "Chat unarchived");
      return next;
    });
    if (id === selectedId) setSelectedId(null);
  };

  const confirmDeleteChat = () => {
    const id = deleteChatId;
    if (!id) return;
    // "Delete" only hides the chat locally — the server conversation lives on.
    // Zero its unread first so a hidden chat can't leave a stranded unread badge
    // with no visible row. A future inbound resurrects it (see effect below).
    markReadMut.mutate(id);
    setHiddenChats((prev) => {
      const next = new Set(prev).add(id);
      localStorage.setItem(
        "asaanrabta_hidden_chats",
        JSON.stringify([...next]),
      );
      return next;
    });
    if (id === selectedId) setSelectedId(null);
    setDeleteChatId(null);
    toast.success("Chat deleted");
  };

  const createCustomTab = () => {
    if (!newTabLabel.trim()) return;
    const tab: CustomTab = {
      id: `custom_${Date.now()}`,
      label: newTabLabel.trim(),
    };
    const updated = [...customTabs, tab];
    setCustomTabs(updated);
    localStorage.setItem("asaanrabta_custom_tabs", JSON.stringify(updated));
    setFilter(tab.id);
    setNewTabLabel("");
    setAddingTab(false);
  };

  const removeCustomTab = (id: string) => {
    const updated = customTabs.filter((t) => t.id !== id);
    setCustomTabs(updated);
    localStorage.setItem("asaanrabta_custom_tabs", JSON.stringify(updated));
    if (filter === id) setFilter("all");
  };

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;
  // Fall back to `detail` so the right panel stays usable when the list is
  // momentarily empty (e.g. during a transient WA disconnect + refetch cycle).
  const activeConv = (conversations.find((c) => c.id === selectedId) ??
    detail) as ConversationListItem | undefined;

  // Clear the unread badge when an unread conversation is opened.
  const markReadMut = useMarkConversationRead();
  useEffect(() => {
    if (selectedId && activeConv && activeConv.unreadCount > 0) {
      markReadMut.mutate(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeConv?.unreadCount]);

  // A locally "deleted" chat is only hidden — the server conversation lives on
  // and keeps receiving messages. When a new inbound lands (unreadCount climbs
  // back above zero) bring it back, so unread is never stranded behind an
  // invisible row. Mirrors WhatsApp, where deleting a chat doesn't block future
  // messages from re-surfacing it.
  useEffect(() => {
    if (hiddenChats.size === 0) return;
    const toRestore = conversations.filter(
      (c) => hiddenChats.has(c.id) && c.unreadCount > 0,
    );
    if (toRestore.length === 0) return;
    setHiddenChats((prev) => {
      const next = new Set(prev);
      for (const c of toRestore) next.delete(c.id);
      localStorage.setItem(
        "asaanrabta_hidden_chats",
        JSON.stringify([...next]),
      );
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, hiddenChats]);

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
        fileName: pendingFile.file.name,
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
        className={`card inbox-list w-[320px] shrink-0 flex flex-col overflow-hidden ${mobPane === "list" ? "mob-on" : ""}`}
      >
        <div className="px-3.5 pt-3 pb-2 space-y-2.5">
          <PermissionGuard permission="conversations:reply">
            <Button
              onClick={() => setShowNewChat(true)}
              disabled={!waConnected}
              title={
                !waConnected
                  ? "Connect WhatsApp in Channels to start a chat"
                  : undefined
              }
              className="w-full justify-center gap-2 text-[12.5px] font-semibold"
            >
              <Plus size={14} /> New Chat
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="broadcasts:create">
            <Button
              variant="outline"
              onClick={() => setShowBroadcast(true)}
              disabled={!waConnected}
              title={
                !waConnected
                  ? "Connect WhatsApp in Channels to send a broadcast"
                  : undefined
              }
              className="w-full justify-center gap-2 text-[12.5px] font-semibold"
            >
              <Megaphone size={14} />+ New Broadcast
            </Button>
          </PermissionGuard>
          {/* Filter tabs row */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden">
              {BUILT_IN_TABS.map((tab) => (
                <Button
                  key={tab.id}
                  variant={filter === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(tab.id)}
                  className="rounded-full text-[11.5px] h-auto py-[4px] px-[10px] whitespace-nowrap flex-shrink-0"
                >
                  {tab.label}
                  {tab.id === "unread" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "text-[10px] font-bold min-w-[14px] h-[14px] rounded-full px-0.5 inline-flex items-center justify-center",
                        filter === tab.id
                          ? "bg-white/30 text-white"
                          : "bg-[var(--accent)] text-white",
                      )}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              ))}
              {customTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-center gap-0.5 group flex-shrink-0"
                >
                  <Button
                    variant={filter === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(tab.id)}
                    className="rounded-full text-[11.5px] h-auto py-[4px] px-[10px] whitespace-nowrap"
                  >
                    {tab.label}
                  </Button>
                  <button
                    onClick={() => removeCustomTab(tab.id)}
                    className="hidden group-hover:flex w-[16px] h-[16px] items-center justify-center rounded-full text-[var(--ink-mute)] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    title="Remove tab"
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
              {addingTab ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Input
                    autoFocus
                    value={newTabLabel}
                    onChange={(e) => setNewTabLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createCustomTab();
                      if (e.key === "Escape") {
                        setAddingTab(false);
                        setNewTabLabel("");
                      }
                    }}
                    className="text-[11.5px] h-[26px] py-0 px-2 w-24"
                    placeholder="Tab name…"
                  />
                  <Button
                    size="icon"
                    onClick={createCustomTab}
                    className="w-[22px] h-[22px]"
                  >
                    <Check size={11} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setAddingTab(false);
                      setNewTabLabel("");
                    }}
                    className="w-[22px] h-[22px]"
                  >
                    <X size={11} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingTab(true)}
                  className="text-[11px] gap-0.5 text-[var(--ink-mute)] whitespace-nowrap flex-shrink-0 py-[4px] px-[8px]"
                >
                  <Plus size={11} /> Tab
                </Button>
              )}
            </div>
            {/* <WAStatusBadge
              showLabel={false}
              className="self-center flex-shrink-0"
            /> */}
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
                className="flex flex-col items-center py-10 px-4 text-center text-[var(--ink-mute)]"
              >
                <Bot size={28} className="mb-2 opacity-40" />
                {!waConnected ? (
                  <>
                    <p className="text-[12.5px] font-medium">
                      WhatsApp disconnected
                    </p>
                    <p className="text-[11px] mt-0.5 opacity-70">
                      Conversations will reappear once reconnected.
                    </p>
                  </>
                ) : filter === "unread" ? (
                  <p className="text-[12.5px]">
                    All caught up — no unread messages
                  </p>
                ) : filter === "favorites" ? (
                  <>
                    <p className="text-[12.5px] font-medium">
                      No favorites yet
                    </p>
                    <p className="text-[11px] mt-0.5 opacity-70">
                      Open a chat → tap ⋮ → Add to Favorites
                    </p>
                  </>
                ) : customTabs.some((t) => t.id === filter) ? (
                  <>
                    <p className="text-[12.5px] font-medium">
                      This tab is empty
                    </p>
                    <p className="text-[11px] mt-0.5 opacity-70">
                      Open a chat → tap ⋮ → Move to Tab
                    </p>
                  </>
                ) : (
                  <p className="text-[12.5px]">No conversations yet</p>
                )}
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
              isFavorite={favorites.has(conv.id)}
              isArchived={archived.has(conv.id)}
              onToggleFavorite={() => toggleFavorite(conv.id)}
              onToggleArchive={() => toggleArchive(conv.id)}
              onDelete={() => setDeleteChatId(conv.id)}
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
        className={`card inbox-chat flex-1 flex flex-col overflow-hidden min-w-0 relative border border-[var(--ink-mute)]/20 ${mobPane === "chat" ? "mob-on" : ""}`}
      >
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--ink-mute)]">
            <Bot size={36} className="mb-3 opacity-30" />
            <p className="text-[13px]">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--line)] bg-[var(--surface)] flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobPane("list")}
                className="inbox-back-mobile"
              >
                <ChevronLeft size={18} />
              </Button>

              {/* Lead info — click to toggle profile panel */}
              <button
                onClick={() => setShowProfile((v) => !v)}
                className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg p-1 text-left border-none bg-transparent hover:bg-[var(--surface-2)] transition-colors"
              >
                <CRMAvatar name={displayName} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-[14px] font-semibold truncate text-[var(--ink)]">
                      {displayName}
                    </h4>
                    {activeConv?.escalationStatus === "ESCALATED" && (
                      <Flame size={12} className="text-[#EF4444] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11.5px] text-[var(--ink-mute)] flex items-center gap-1">
                    <Phone size={9} className="shrink-0" />
                    <span className="truncate">
                      {activeConv?.lead.phone ?? "—"}
                    </span>
                    {activeConv?.escalationStatus === "RESOLVED" && (
                      <span className="text-[#15803D] font-medium flex-shrink-0">
                        · Done
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* AI on/off switch */}
              <div
                title={
                  activeConv?.aiEnabled
                    ? "AI is replying — switch off to take over"
                    : "AI off — switch on to let the bot reply"
                }
                className="flex-shrink-0 flex items-center gap-1.5"
              >
                {aiModeMut.isPending ? (
                  <Loader2
                    size={12}
                    className="animate-spin text-[var(--ink-mute)]"
                  />
                ) : (
                  <Zap
                    size={12}
                    className={
                      activeConv?.aiEnabled
                        ? "text-[#15803D]"
                        : "text-[var(--ink-mute)]"
                    }
                  />
                )}
                <span
                  className={cn(
                    "hide-mobile text-[11px] font-semibold",
                    activeConv?.aiEnabled
                      ? "text-[#15803D]"
                      : "text-[var(--ink-mute)]",
                  )}
                >
                  {activeConv?.aiEnabled ? "AI active" : "AI off"}
                </span>
                <CRMSwitch
                  on={!!activeConv?.aiEnabled}
                  onChange={() => {
                    if (selectedId && !aiModeMut.isPending) aiModeMut.mutate();
                  }}
                />
              </div>

              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 flex-shrink-0 text-[var(--ink-mute)] rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setOrderFormOpen(true)}>
                    <ShoppingCart size={13} className="mr-2" /> Create Order
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => selectedId && toggleFavorite(selectedId)}
                  >
                    <Star
                      size={13}
                      className={cn(
                        "mr-2",
                        selectedId && favorites.has(selectedId)
                          ? "text-[#CA8A04]"
                          : "",
                      )}
                    />
                    {selectedId && favorites.has(selectedId)
                      ? "Remove from Favorites"
                      : "Add to Favorites"}
                  </DropdownMenuItem>
                  {customTabs.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Plus size={13} className="mr-2" /> Move to Tab
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-44">
                        {customTabs.map((tab) => {
                          const assigned = selectedId
                            ? (tabAssignments[tab.id] ?? []).includes(
                                selectedId,
                              )
                            : false;
                          return (
                            <DropdownMenuItem
                              key={tab.id}
                              onClick={() => {
                                if (!selectedId) return;
                                if (assigned) removeFromTab(selectedId, tab.id);
                                else assignToTab(selectedId, tab.id);
                              }}
                            >
                              <span className="flex-1">{tab.label}</span>
                              {assigned && (
                                <Check
                                  size={11}
                                  className="text-[var(--accent)]"
                                />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => selectedId && resolveMut.mutate(selectedId)}
                    disabled={resolveMut.isPending}
                  >
                    <CheckCheck size={13} className="mr-2 text-[#15803D]" />
                    {activeConv?.escalationStatus === "RESOLVED"
                      ? "Already resolved"
                      : "Mark as Done"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => selectedId && escalateMut.mutate(selectedId)}
                    disabled={escalateMut.isPending}
                  >
                    <Flame size={13} className="mr-2 text-[#EF4444]" />
                    {activeConv?.escalationStatus === "ESCALATED"
                      ? "Already flagged"
                      : "Flag for attention"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setBgPickerOpen((v) => !v)}>
                    <Palette size={13} className="mr-2" /> Chat wallpaper
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className={cn(
                "scroll flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-[18px] relative border-y border-[var(--ink-mute)]/20",
                !chatBg && "bg-[var(--bg)]",
              )}
              style={{
                overscrollBehavior: "contain",
                ...(chatBg ? { background: chatBg } : {}),
              }}
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

              {groupByDay(messages).map((group) => (
                <div key={group.key} className="flex flex-col gap-2">
                  {/* Sticky header is scoped to its day section, so only the
                      in-view day sticks at the top and older days scroll away. */}
                  <DateSeparator iso={group.iso} />
                  {group.items.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      waConnected={waConnected}
                      approving={approveDraftMut.isPending}
                      peerName={displayName}
                      onEdit={handleEditMessage}
                      onDelete={setDeleteMsgTarget}
                      onApproveDraft={handleApproveDraft}
                    />
                  ))}
                </div>
              ))}

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

            {/* Wallpaper picker overlay */}
            {bgPickerOpen && (
              <div className="absolute bottom-20 right-3 z-40 card p-4 w-[248px] shadow-xl border border-[var(--line)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[var(--ink)]">
                    Chat Wallpaper
                  </span>
                  <button
                    onClick={() => setBgPickerOpen(false)}
                    className="btn btn-ghost p-1 text-[var(--ink-mute)]"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CHAT_BG_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      title={p.label}
                      onClick={() => {
                        setChatBg(p.value);
                        localStorage.setItem("asaanrabta_chat_bg", p.value);
                        setBgPickerOpen(false);
                      }}
                      className={cn(
                        "h-12 w-full rounded-lg border-2 relative transition-all",
                        !p.value && "bg-[var(--bg)]",
                        chatBg === p.value
                          ? "border-[var(--accent)] shadow-[0_0_0_2px_var(--accent-soft)]"
                          : "border-[var(--line)] hover:border-[var(--ink-mute)]",
                      )}
                      style={p.value ? { background: p.value } : undefined}
                    >
                      {chatBg === p.value && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={14}
                            style={{ filter: "drop-shadow(0 0 3px white)" }}
                            className="text-[var(--accent)]"
                          />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10.5px] text-[var(--ink-mute)] mt-2.5 text-center">
                  Saved automatically
                </p>
              </div>
            )}

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

              {/* Single-row input */}
              <div className="px-2 py-2 relative">
                {!waConnected && (
                  <Link
                    href="/channels"
                    className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium bg-[#FEF9C3] text-[#854D0E] hover:opacity-90"
                  >
                    <AlertTriangle size={12} className="shrink-0" />
                    WhatsApp isn’t connected — reconnect in Channels to send
                    messages.
                  </Link>
                )}
                <div className="flex items-end gap-1.5">
                  {/* + attachment dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={!waConnected}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center disabled:opacity-40 mb-0.5"
                        title="Attach"
                      >
                        <Plus size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      className="w-44"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          fileInputRef.current?.setAttribute(
                            "accept",
                            "image/*",
                          );
                          fileInputRef.current?.click();
                        }}
                      >
                        <Image size={14} className="mr-2" /> Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          fileInputRef.current?.setAttribute(
                            "accept",
                            ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
                          );
                          fileInputRef.current?.click();
                        }}
                      >
                        <Paperclip size={14} className="mr-2" /> Document
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          fileInputRef.current?.setAttribute(
                            "accept",
                            "video/*",
                          );
                          fileInputRef.current?.click();
                        }}
                      >
                        <Video size={14} className="mr-2" /> Video
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          fileInputRef.current?.setAttribute(
                            "accept",
                            "audio/mp3,audio/mp4,audio/mpeg,audio/ogg,audio/wav,audio/aac,audio/*",
                          );
                          fileInputRef.current?.click();
                        }}
                      >
                        <FileAudio size={14} className="mr-2" /> Audio
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Textarea */}
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
                          ? "Edit your message…"
                          : "Type a message…"
                    }
                    className="flex-1 resize-none rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] outline-none px-3.5 py-2 min-h-[38px] max-h-[120px] text-[13.5px] text-[var(--ink)] placeholder:text-[var(--ink-mute)] disabled:opacity-60 disabled:cursor-not-allowed overflow-y-auto"
                  />

                  {/* Emoji */}
                  <button
                    onClick={() => setEmojiPickerOpen((v) => !v)}
                    disabled={!waConnected}
                    className="flex-shrink-0 w-8 h-8 rounded-full text-[var(--ink-mute)] flex items-center justify-center disabled:opacity-40 mb-0.5"
                    title="Emoji"
                  >
                    <Smile size={18} />
                  </button>

                  {/* Mic */}
                  <button
                    onClick={startRecording}
                    disabled={!waConnected}
                    className="flex-shrink-0 w-8 h-8 rounded-full text-[var(--ink-mute)] flex items-center justify-center disabled:opacity-40 mb-0.5"
                    title="Voice message"
                  >
                    <Mic size={18} />
                  </button>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={
                      !waConnected ||
                      !draft.trim() ||
                      (editingMessageId
                        ? editMut.isPending
                        : sendReplyMut.isPending)
                    }
                    className="shrink-0 w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-95"
                  >
                    {(
                      editingMessageId
                        ? editMut.isPending
                        : sendReplyMut.isPending
                    ) ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : editingMessageId ? (
                      <Check size={14} />
                    ) : (
                      <Send size={14} className="ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Emoji picker popup */}
                {emojiPickerOpen && (
                  <div className="absolute bottom-full right-2 mb-2 z-50 card p-2 shadow-xl border border-[var(--line)] w-[264px]">
                    <div className="grid grid-cols-8 gap-0.5">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setDraft((d) => d + emoji);
                            setEmojiPickerOpen(false);
                          }}
                          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[var(--surface-2)] text-[18px] transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
          className={`card inbox-profile w-[260px] flex-shrink-0 flex flex-col overflow-y-auto gap-3 p-4 border border-[var(--ink-mute)]/20 ${mobPane === "profile" ? "mob-on" : ""}`}
        >
          <button
            onClick={() => setMobPane("chat")}
            className="btn btn-ghost inbox-back-mobile self-start p-1.5 -mb-2"
          >
            <ChevronLeft size={18} /> Back
          </button>

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <CRMAvatar name={displayName} size={60} />
            <h4 className="text-[15px] font-semibold text-[var(--ink)] mt-1">
              {displayName}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <EscalationBadge status={activeConv.escalationStatus} />
              {(() => {
                const meta =
                  STATUS_META[
                    (activeConv as any).lead?.status?.toLowerCase?.() ??
                      "prospect"
                  ] ?? STATUS_META.prospect;
                return (
                  <span
                    className="badge flex items-center gap-1 text-[10.5px] font-medium px-[7px] py-[2px]"
                    style={{
                      color: meta.color,
                      background: meta.tint,
                      border: `1px solid ${meta.tint}`,
                    }}
                  >
                    <span
                      className="dot w-[6px] h-[6px]"
                      style={{ background: meta.color }}
                    />
                    {meta.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Lead info */}
          <div className="card p-3 bg-[var(--surface-2)] flex flex-col gap-2 text-[12.5px]">
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)] mb-0.5">
              Lead Information
            </p>
            <div className="flex items-center gap-2">
              <Phone
                size={11}
                className="text-[var(--ink-mute)] flex-shrink-0"
              />
              <span className="text-[var(--ink-mute)]">Phone</span>
              <span className="font-medium text-[var(--ink)] ml-auto">
                {activeConv.lead.phone ?? "—"}
              </span>
            </div>
            {(activeConv as any).lead?.email && (
              <div className="flex items-center gap-2">
                <Mail
                  size={11}
                  className="text-[var(--ink-mute)] flex-shrink-0"
                />
                <span className="text-[var(--ink-mute)]">Email</span>
                <span className="font-medium text-[var(--ink)] ml-auto truncate max-w-[140px]">
                  {(activeConv as any).lead.email}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Bot size={11} className="text-[var(--ink-mute)] flex-shrink-0" />
              <span className="text-[var(--ink-mute)]">Channel</span>
              <span className="font-medium text-[var(--ink)] ml-auto">
                WhatsAppre
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={11}
                className="text-[var(--ink-mute)] flex-shrink-0"
              />
              <span className="text-[var(--ink-mute)]">Messages</span>
              <span className="font-medium text-[var(--ink)] ml-auto">
                {detail?.messages.filter((m: any) => !m.isDraft).length ?? 0}
              </span>
            </div>
          </div>

          {/* Order history */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                Order History
              </p>
              {leadOrders && leadOrders.length > 0 && (
                <span className="badge bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)] text-[10.5px] px-[7px] py-[2px]">
                  {leadOrders.length}
                </span>
              )}
            </div>
            {leadOrdersLoading && (
              <div className="flex justify-center py-3">
                <Loader2
                  size={14}
                  className="animate-spin text-[var(--ink-mute)]"
                />
              </div>
            )}
            {!leadOrdersLoading && (!leadOrders || leadOrders.length === 0) && (
              <div className="card p-3 bg-[var(--surface-2)] flex items-center gap-2 text-[12px] text-[var(--ink-mute)]">
                <Package size={13} /> No orders yet
              </div>
            )}
            {leadOrders &&
              leadOrders.map((order) => {
                const ORDER_COLOR: Record<string, string> = {
                  PENDING: "#F59E0B",
                  CONFIRMED: "#3B82F6",
                  PAID: "#8B5CF6",
                  SHIPPED: "#10B981",
                  DELIVERED: "#16A34A",
                  COMPLETED: "#15803D",
                  CANCELLED: "#EF4444",
                  REFUNDED: "#94A3B8",
                };

                const color = ORDER_COLOR[order.status] ?? "#94A3B8";
                return (
                  <Link
                    key={order.id}
                    href={`/orders?order=${order.id}`}
                    className="card p-3 bg-[var(--surface-2)] flex flex-col gap-1 no-underline transition-colors hover:bg-[var(--surface)] hover:border-[var(--accent)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-[var(--ink)]">
                        #{order.orderNumber}
                      </span>
                      <span
                        className="badge text-[10px] font-medium px-[6px] py-[2px]"
                        style={{
                          color,
                          background: `${color}15`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {order.status.charAt(0) +
                          order.status
                            .slice(1)
                            .toLowerCase()
                            .replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)]">
                      <span>
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold text-[var(--ink)]">
                        {order.currency} {order.total}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-[var(--ink-mute)]">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Link>
                );
              })}
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

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        waConnected={waConnected}
        onStarted={(conversationId) => {
          setSelectedId(conversationId);
          setMobPane("chat");
        }}
      />

      {/* Delete-chat confirmation (local to this inbox view) */}
      <ConfirmDialog
        open={!!deleteChatId}
        onClose={() => setDeleteChatId(null)}
        onConfirm={confirmDeleteChat}
        title="Delete chat?"
        description="This removes the conversation from your inbox. It won't delete messages on WhatsApp."
        confirmLabel="Delete chat"
      />

      {/* Delete-message confirmation — scope mirrors WhatsApp (for me / everyone) */}
      <ConfirmDialog
        open={!!deleteMsgTarget}
        onClose={() => setDeleteMsgTarget(null)}
        title="Delete message?"
        description={
          deleteMsgTarget?.canDeleteEveryone
            ? "Delete this message for yourself, or for everyone in the chat."
            : "This message will be deleted for you."
        }
        confirmLabel="Delete for me"
        onConfirm={() => {
          if (!deleteMsgTarget) return;
          deleteMut.mutate({
            messageId: deleteMsgTarget.messageId,
            everyone: false,
          });
          setDeleteMsgTarget(null);
        }}
        secondaryLabel={
          deleteMsgTarget?.canDeleteEveryone ? "Delete for everyone" : undefined
        }
        onSecondary={
          deleteMsgTarget?.canDeleteEveryone
            ? () => {
                if (!deleteMsgTarget) return;
                deleteMut.mutate({
                  messageId: deleteMsgTarget.messageId,
                  everyone: true,
                });
                setDeleteMsgTarget(null);
              }
            : undefined
        }
      />

      {activeConv && (
        <OrderForm
          open={orderFormOpen}
          onClose={() => setOrderFormOpen(false)}
          presetLeadId={activeConv.lead.id}
          presetConversationId={activeConv.id}
          isSubmitting={createOrder.isPending}
          onSubmit={(values) =>
            createOrder.mutate(values, {
              onSuccess: () => setOrderFormOpen(false),
            })
          }
        />
      )}
    </div>
  );
}
