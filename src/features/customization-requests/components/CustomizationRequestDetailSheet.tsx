"use client";
import { useOpenLeadChat } from "@/features/leads/hooks/useOpenLeadChat";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Textarea } from "@/shared/ui/Textarea";
import { Loader2, MessageSquare, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  useCustomizationRequest,
  useDeleteCustomizationRequest,
  useUpdateCustomizationRequestNote,
  useUpdateCustomizationRequestStatus,
} from "../hooks/useCustomizationRequests";
import {
  REQUEST_REASON_META,
  REQUEST_STATUS_META,
  formatWaitingFor,
} from "../lib/format";
import type { ReviewableStatus } from "../types";
import { CustomizationRequestStatusBadge } from "./CustomizationRequestStatusBadge";
import { CustomizationRequestStatusSelect } from "./CustomizationRequestStatusSelect";

interface Props {
  requestId: string;
  onClose: () => void;
}

export function CustomizationRequestDetailSheet({ requestId, onClose }: Props) {
  const { data: request, isLoading } = useCustomizationRequest(requestId);
  const changeStatus = useUpdateCustomizationRequestStatus();
  const saveNote = useUpdateCustomizationRequestNote();
  const deleteRequest = useDeleteCustomizationRequest();
  const { openLeadChat, verifyingLeadId } = useOpenLeadChat();

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[460px] max-w-[calc(100vw-28px)] z-[70]">
        <div className="flex items-center justify-between p-[18px] border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="text-[16px] font-semibold text-[var(--ink)] truncate">
              {request ? request.productName : "Customization request"}
            </h3>
            {request && (
              <CustomizationRequestStatusBadge status={request.status} />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ink-mute)] hover:text-[var(--ink)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !request ? (
          <div className="flex-1 grid place-items-center">
            <Loader2
              size={20}
              className="animate-spin text-[var(--ink-mute)]"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-[18px] space-y-5">
              <section className="space-y-1.5">
                <SectionLabel>Customer</SectionLabel>
                <div className="text-[13.5px] text-[var(--ink)] font-medium">
                  {request.lead?.name || "Unknown"}
                </div>
                {request.lead?.phone && (
                  <div className="text-[12px] text-[var(--ink-mute)]">
                    {request.lead.phone}
                  </div>
                )}
                <div className="text-[12px] text-[var(--ink-mute)]">
                  Asked {formatWaitingFor(request.createdAt)}
                </div>
              </section>

              <section className="space-y-1.5">
                <SectionLabel>What they asked for</SectionLabel>
                <p className="text-[13.5px] leading-relaxed text-[var(--ink)] whitespace-pre-wrap rounded-[10px] bg-[var(--surface-2)] p-3">
                  {request.customerNote}
                </p>
                <p className="text-[12px] text-[var(--ink-mute)]">
                  {REQUEST_REASON_META[request.reason].description}
                </p>
              </section>

              <section className="space-y-1.5">
                <SectionLabel>Product</SectionLabel>
                <div className="text-[13.5px] text-[var(--ink)]">
                  {request.productName}
                  {request.variantLabel ? ` — ${request.variantLabel}` : ""}
                  <span className="text-[var(--ink-mute)]">
                    {" "}
                    × {request.quantity}
                  </span>
                </div>
              </section>

              {!!request.collectedAnswers?.length && (
                <section className="space-y-2">
                  <SectionLabel>Already collected</SectionLabel>
                  {request.collectedAnswers.map((answer) => (
                    <div
                      key={answer.key}
                      className="text-[12.5px] flex items-start gap-2"
                    >
                      <span className="text-[var(--ink-mute)] min-w-[110px]">
                        {answer.label}
                      </span>
                      <span className="text-[var(--ink)] flex-1">
                        {answer.value}
                      </span>
                    </div>
                  ))}
                  {request.collectedAnswers
                    .filter((answer) => answer.imageUrl)
                    .map((answer) => (
                      <ShimmerImage
                        key={`${answer.key}-art`}
                        src={getImageUrl(answer.imageUrl as string)}
                        alt={`${answer.label} artwork`}
                        width={180}
                        height={180}
                        className="rounded-[10px] border border-[var(--line)]"
                      />
                    ))}
                </section>
              )}

              {/* Keyed so opening a different request remounts a fresh draft —
                  a background refetch must never overwrite what the reviewer is
                  halfway through typing. */}
              <TeamNoteEditor
                key={request.id}
                savedNote={request.internalNote ?? ""}
                isSaving={saveNote.isPending}
                onSave={(internalNote) =>
                  saveNote.mutate({ id: request.id, internalNote })
                }
              />
            </div>

            <div className="border-t border-[var(--line)] p-[18px] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-[var(--ink-mute)]">
                  {REQUEST_STATUS_META[request.status].hint}
                </span>
                <PermissionGuard permission="orders:edit">
                  <CustomizationRequestStatusSelect
                    value={request.status}
                    loading={changeStatus.isPending}
                    onChange={(status: ReviewableStatus) =>
                      changeStatus.mutate({ id: request.id, status })
                    }
                  />
                </PermissionGuard>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => request.lead && openLeadChat(request.lead)}
                  disabled={!request.lead || verifyingLeadId === request.leadId}
                >
                  {verifyingLeadId === request.leadId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <MessageSquare size={14} />
                  )}
                  Answer in chat
                </Button>
                <PermissionGuard permission="orders:cancel">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(true)}
                    aria-label="Delete request"
                  >
                    <Trash2 size={14} />
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteRequest.mutate(requestId, {
            onSuccess: () => {
              setConfirmDelete(false);
              onClose();
            },
          })
        }
        title="Delete this request?"
        description="The customer's request and any team notes on it are permanently removed. The chat itself is untouched."
        confirmLabel="Delete"
        loading={deleteRequest.isPending}
        destructive
      />
    </>
  );
}

interface TeamNoteEditorProps {
  savedNote: string;
  isSaving: boolean;
  onSave: (internalNote: string) => void;
}

function TeamNoteEditor({ savedNote, isSaving, onSave }: TeamNoteEditorProps) {
  const [draft, setDraft] = useState(savedNote);
  const hasChanged = draft !== savedNote;

  return (
    <section className="space-y-2">
      <SectionLabel>Team notes</SectionLabel>
      <Textarea
        rows={4}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="What you found out, what you quoted, what to do next. The customer never sees this."
        className="text-[13px]"
      />
      {hasChanged && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(draft)} disabled={isSaving}>
            {isSaving && <Loader2 size={13} className="animate-spin" />}
            Save note
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDraft(savedNote)}
          >
            Discard
          </Button>
        </div>
      )}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
      {children}
    </div>
  );
}
