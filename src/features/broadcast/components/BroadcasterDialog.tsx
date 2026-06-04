import { useUploadAttachment } from "@/features/inbox/hooks/useConversations";
import { useLeads } from "@/features/leads/hooks/useLeads";
import {
  STATUS_META,
  type Lead,
  type LeadStatus,
} from "@/features/leads/types";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  ArrowRight,
  ArrowLeft,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  X,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateBroadcast } from "../hooks/useBroadcast";

type StatusFilter = "all" | LeadStatus;
const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prospect", label: "Prospect" },
  { id: "cold", label: "Cold" },
  { id: "warm", label: "Warm" },
  { id: "hot", label: "Hot" },
];

export function BroadcasterDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Navigation & Reset
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Compose
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    previewUrl: string;
    mimeType: string;
  } | null>(null);

  // Step 2 State: Recipients
  const { data: leads = [] } = useLeads();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Mutations
  const uploadMut = useUploadAttachment();
  const createMut = useCreateBroadcast();

  useEffect(() => {
    if (open) {
      setStep(1);
      setDraft("");
      setPendingFile(null);
      setStatusFilter("all");
      setSearchQuery("");
      setSelected(new Set());
    } else {
      if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl);
    }
    // eslint-disable-next-react-hooks/exhaustive-deps
  }, [open]);

  // Recipient Selection Logic
  const filtered = useMemo(() => {
    let result =
      statusFilter === "all"
        ? leads
        : leads.filter((l: Lead) => l.status === statusFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l: Lead) =>
          l.name.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, statusFilter, searchQuery]);

  const filteredIds = useMemo(
    () => filtered.map((l: Lead) => l.id),
    [filtered],
  );
  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id: string) => selected.has(id));
  const selectedCount = selected.size;

  const toggleOne = (id: string) =>
    setSelected((prev: Set<string>) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllFiltered = () =>
    setSelected((prev: Set<string>) => {
      const next = new Set(prev);
      if (allFilteredSelected)
        filteredIds.forEach((id: string) => next.delete(id));
      else filteredIds.forEach((id: string) => next.add(id));
      return next;
    });

  // Action Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingFile({ file, previewUrl, mimeType: file.type });
    e.target.value = "";
  };

  const handleCancelFile = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  };

  const handleNextStep1 = () => {
    if (!draft.trim() && !pendingFile) {
      toast.error("Add a message or an attachment to continue.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one lead.");
      return;
    }
    setStep(3);
  };

  const handleSend = async () => {
    if (selectedCount === 0) return;
    const sendPromise = (async () => {
      let mediaUrl = undefined;
      let mimeType = undefined;

      if (pendingFile) {
        const res = await uploadMut.mutateAsync(pendingFile.file);
        mediaUrl = res.url;
        mimeType = pendingFile.mimeType;
      }

      await createMut.mutateAsync({
        message: draft.trim() || undefined,
        mediaUrl,
        mimeType,
        leadIds: Array.from(selected),
      });
    })();
    
    toast.promise(sendPromise, {
      loading: "Starting broadcast...",
      success: "Broadcast started! Messages will appear in your inbox as they are sent.",
      error: "Failed to start broadcast."
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[620px] h-[min(640px,92vh)] overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-5 py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold flex items-center gap-2">
              <Megaphone size={16} className="text-[var(--accent)]" />
              {step === 1
                ? "Compose Broadcast"
                : step === 2
                  ? "Select Recipients"
                  : "Confirm Broadcast"}
            </DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              {step === 1
                ? "Draft the message you want to blast to your leads."
                : step === 2
                  ? "Choose who should receive this announcement."
                  : "Review your broadcast before sending."}
            </DialogDescription>
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Step 1: Compose */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300",
              step === 1
                ? "translate-x-0 opacity-100 z-10"
                : "-translate-x-full opacity-0 pointer-events-none",
            )}
          >
            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col flex-1 border border-[var(--line)] rounded-xl focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10 transition-shadow">
                <textarea
                  placeholder="Type your announcement here..."
                  className="flex-1 p-4 bg-transparent outline-none resize-none text-[13.5px] placeholder:text-[var(--ink-mute)] min-h-[200px]"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                {pendingFile && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] max-w-xs relative group">
                      {pendingFile.mimeType.startsWith("image/") ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-[var(--surface-2)]">
                          <img
                            src={pendingFile.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-md flex-shrink-0 bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-mute)]">
                          <FileIcon size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">
                          {pendingFile.file.name}
                        </p>
                        <p className="text-[10px] text-[var(--ink-mute)]">
                          {(pendingFile.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={handleCancelFile}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="px-2 py-2 border-t border-[var(--line)] bg-[var(--surface-2)] flex justify-between rounded-b-xl">
                  <label className="btn btn-ghost p-2 h-auto rounded-lg cursor-pointer text-[var(--ink-soft)] hover:text-[var(--ink)]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,application/pdf"
                    />
                    <ImageIcon size={18} />
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-[var(--ink-mute)] text-center px-4">
                Messages are sent with randomized 2–5s delays to mimic human
                behavior and protect your WhatsApp session.
              </p>
            </div>
            <div className="p-4 border-t border-[var(--line)] flex justify-between items-center bg-[var(--surface)] shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--line)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--line)]" />
              </div>
              <button
                className="btn btn-grad"
                onClick={handleNextStep1}
                disabled={!draft.trim() && !pendingFile}
              >
                Next Step <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Step 2: Recipients */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300",
              step === 2
                ? "translate-x-0 opacity-100 z-10"
                : step < 2
                  ? "translate-x-full opacity-0 pointer-events-none"
                  : "-translate-x-full opacity-0 pointer-events-none",
            )}
          >
            {/* Search and Status filters */}
            <div className="px-5 pt-3 pb-2 flex flex-col gap-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search leads by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-lg pl-9 pr-3 py-2 text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {FILTERS.map((f) => {
                  const meta = f.id !== "all" ? STATUS_META[f.id] : null;
                  const active = statusFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className="badge flex items-center gap-1.5 cursor-pointer font-medium py-[5px] px-3 border"
                      style={{
                        background: active
                          ? (meta?.color ?? "var(--accent)")
                          : (meta?.tint ?? "var(--surface-2)"),
                        color: active
                          ? "white"
                          : (meta?.color ?? "var(--ink-soft)"),
                        borderColor: active
                          ? (meta?.color ?? "var(--accent)")
                          : "transparent",
                      }}
                    >
                      {meta && (
                        <span
                          className="dot w-1.5 h-1.5"
                          style={{ background: active ? "white" : meta.color }}
                        />
                      )}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select-all bar */}
            <div className="px-5 py-2 flex-shrink-0 flex items-center justify-between border-t border-[var(--line)]">
              <label className="flex items-center gap-2 text-[12.5px] cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  className="accent-[var(--accent)] w-4 h-4 rounded"
                />
                Select all in current filter ({filtered.length})
              </label>
              <span className="text-[12px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                {selectedCount} selected total
              </span>
            </div>

            {/* List */}
            <div className="scroll flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-1">
              {filtered.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--ink-mute)] py-10 flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                    <Search size={18} className="text-[var(--ink-soft)]" />
                  </div>
                  No leads found matching your criteria.
                </div>
              )}
              {filtered.map((l: Lead) => {
                const checked = selected.has(l.id);
                const st = STATUS_META[l.status];
                return (
                  <label
                    key={l.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border cursor-pointer px-3 py-2.5 transition-all hover:shadow-sm",
                      checked
                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                        : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(l.id)}
                      className="accent-[var(--accent)] w-4 h-4 flex-shrink-0 rounded"
                    />
                    <CRMAvatar name={l.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--ink)] truncate">
                        {l.name}
                      </div>
                      <div className="text-[11.5px] text-[var(--ink-mute)] truncate">
                        {l.phone || l.email || l.city || "—"}
                      </div>
                    </div>
                    <span
                      className="badge py-0.5 px-2 font-medium text-[10.5px] rounded-md"
                      style={{ background: st.tint, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-[var(--line)] flex justify-between items-center bg-[var(--surface)] shrink-0">
              <div className="flex gap-1.5">
                <div
                  className="w-2 h-2 rounded-full bg-[var(--line)] cursor-pointer"
                  onClick={() => setStep(1)}
                />
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--line)]" />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="btn btn-grad"
                  onClick={handleNextStep2}
                  disabled={selectedCount === 0}
                >
                  Review <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Confirmation */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300",
              step === 3
                ? "translate-x-0 opacity-100 z-10"
                : "translate-x-full opacity-0 pointer-events-none",
            )}
          >
            <div className="flex-1 overflow-y-auto p-5">
              <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="text-[12.5px] uppercase tracking-wider font-bold text-[var(--ink-mute)] mb-3">
                  Broadcast Summary
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-[12px] text-[var(--ink-soft)] mb-1">Message</div>
                    <div className="text-[13.5px] text-[var(--ink)] bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)] whitespace-pre-wrap">
                      {draft || <span className="italic text-[var(--ink-mute)]">No text message</span>}
                    </div>
                  </div>

                  {pendingFile && (
                    <div>
                      <div className="text-[12px] text-[var(--ink-soft)] mb-1">Attachment</div>
                      <div className="flex items-center gap-3 p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                        {pendingFile.mimeType.startsWith("image/") ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-[var(--surface-2)]">
                            <img
                              src={pendingFile.previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md flex-shrink-0 bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-mute)]">
                            <FileIcon size={18} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium truncate">
                            {pendingFile.file.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[12px] text-[var(--ink-soft)] mb-1 flex items-center justify-between">
                      <span>Recipients</span>
                      <span className="font-semibold text-[var(--accent)]">{selectedCount} leads selected</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.from(selected).slice(0, 5).map(id => {
                        const l = leads.find((lead: Lead) => lead.id === id);
                        return l ? (
                          <span key={id} className="badge bg-[var(--surface)] border py-1 px-2.5 text-[11.5px] rounded-md shadow-sm">
                            {l.name}
                          </span>
                        ) : null;
                      })}
                      {selectedCount > 5 && (
                        <span className="badge bg-[var(--surface)] border py-1 px-2.5 text-[11.5px] text-[var(--ink-mute)] rounded-md shadow-sm">
                          +{selectedCount - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-xl flex gap-3 text-[12.5px] items-start">
                <div className="pt-0.5">⚠️</div>
                <div className="leading-relaxed">
                  <strong>Important Note:</strong> Sending bulk messages can lead to your WhatsApp account being restricted if done aggressively. The CRM automatically adds randomized 2-5 second delays between messages to help mimic human behavior.
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[var(--line)] flex justify-between items-center bg-[var(--surface)] shrink-0">
              <div className="flex gap-1.5">
                <div
                  className="w-2 h-2 rounded-full bg-[var(--line)] cursor-pointer"
                  onClick={() => setStep(1)}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[var(--line)] cursor-pointer"
                  onClick={() => setStep(2)}
                />
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={14} className="mr-1" /> Back
                </button>
                <button
                  className="btn bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-medium px-5"
                  onClick={handleSend}
                >
                  <Megaphone size={15} className="mr-1.5" /> Start Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
