import {
  checkWhatsAppNumber,
  type CheckNumberResult,
} from "@/features/channels/whatsapp/services/whatsapp.service";
import { useLeads } from "@/features/leads/hooks/useLeads";
import type { Lead } from "@/features/leads/types";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { AlertCircle, Check, Loader2, Phone, Search, Send, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useStartConversation } from "../hooks/useConversations";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Label } from "@/shared/ui/Label";

function describeUnreachableNumber(result: CheckNumberResult): string {
  const phoneSuffix = result.phone ? ` (${result.phone})` : "";
  switch (result.reason) {
    case "NOT_ON_WHATSAPP":
      return `The phone number${phoneSuffix} is not registered on WhatsApp.`;
    case "NO_PHONE":
      return "This contact does not have a phone number specified.";
    case "INVALID_PHONE":
      return `The phone number${phoneSuffix} is invalid. Please include country code.`;
    case "CHANNEL_DISCONNECTED":
      return "WhatsApp is not connected. Please connect WhatsApp first in Settings/Channels.";
    case "VERIFICATION_FAILED":
      return "Unable to verify this number on WhatsApp right now. Please try again.";
    default:
      return "The phone number could not be verified on WhatsApp.";
  }
}

/**
 * Lets an agent start a brand-new WhatsApp chat from the CRM — by picking an
 * existing lead or entering a fresh number — and sending the first message.
 */
export function NewChatDialog({
  open,
  onClose,
  onStarted,
  waConnected,
}: {
  open: boolean;
  onClose: () => void;
  onStarted: (conversationId: string) => void;
  waConnected: boolean;
}) {
  const { data: leads = [] } = useLeads();
  const startChat = useStartConversation();

  const [mode, setMode] = useState<"lead" | "number">("lead");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const reset = () => {
    setMode("lead");
    setSearch("");
    setSelectedLeadId(null);
    setPhone("");
    setName("");
    setMessage("");
    setValidationError(null);
    setIsValidating(false);
  };

  const close = () => {
    if (startChat.isPending || isValidating) return;
    reset();
    onClose();
  };

  // Only leads we can actually message (have a phone number).
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (leads as Lead[])
      .filter((l) => l.phone)
      .filter(
        (l) =>
          !q ||
          l.name.toLowerCase().includes(q) ||
          (l.phone ?? "").toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [leads, search]);

  const targetReady =
    mode === "lead" ? !!selectedLeadId : phone.replace(/\D/g, "").length >= 6;
  const canSubmit = waConnected && targetReady && !!message.trim();

  const submit = async () => {
    if (!canSubmit || startChat.isPending || isValidating) return;
    setValidationError(null);
    setIsValidating(true);

    try {
      const checkRes = await checkWhatsAppNumber(
        mode === "lead"
          ? { leadId: selectedLeadId! }
          : { phone: phone.trim() },
      );

      if (!checkRes.exists) {
        setIsValidating(false);
        setValidationError(describeUnreachableNumber(checkRes));
        return;
      }

      startChat.mutate(
        mode === "lead"
          ? { leadId: selectedLeadId!, message: message.trim() }
          : {
              phone: phone.trim(),
              name: name.trim() || undefined,
              message: message.trim(),
            },
        {
          onSuccess: (conv) => {
            setIsValidating(false);
            onStarted(conv.id);
            reset();
            onClose();
          },
          onError: (err: any) => {
            setIsValidating(false);
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "Failed to start chat.";
            setValidationError(msg);
          },
        },
      );
    } catch {
      setIsValidating(false);
      setValidationError(
        "Failed to verify WhatsApp registration. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-[var(--line)]">
          <DialogTitle className="text-[16px] font-semibold">
            Start a new chat
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[var(--ink-mute)] mt-0.5">
            Message a lead or a new number on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-3.5">
          {/* Mode toggle */}
          <div className="seg">
            <button
              type="button"
              className={mode === "lead" ? "on" : ""}
              onClick={() => {
                setMode("lead");
                setValidationError(null);
              }}
            >
              <Search size={12} /> Pick a lead
            </button>
            <button
              type="button"
              className={mode === "number" ? "on" : ""}
              onClick={() => {
                setMode("number");
                setValidationError(null);
              }}
            >
              <UserPlus size={12} /> New number
            </button>
          </div>

          {mode === "lead" ? (
            <>
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
                />
                <Input
                  autoFocus
                  className="pl-8"
                  placeholder="Search leads by name or number…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setValidationError(null);
                  }}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto scroll rounded-xl border border-[var(--line)] divide-y divide-[var(--line-soft)]">
                {matches.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12.5px] text-[var(--ink-mute)]">
                    No leads with a phone number found.
                  </div>
                ) : (
                  matches.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(l.id);
                        setValidationError(null);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors",
                        selectedLeadId === l.id
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--surface-2)]",
                      )}
                    >
                      <CRMAvatar name={l.name} size={30} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[var(--ink)] truncate">
                          {l.name}
                        </div>
                        <div className="text-[11.5px] text-[var(--ink-mute)] flex items-center gap-1">
                          <Phone size={9} /> {l.phone}
                        </div>
                      </div>
                      {selectedLeadId === l.id && (
                        <Check size={15} className="text-[var(--accent)]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <Label className="text-[12px] font-semibold mb-1 text-[var(--ink-soft)]">
                  Phone number *
                </Label>
                <Input
                  autoFocus
                  placeholder="+92 321 1234567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setValidationError(null);
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[12px] font-semibold mb-1 text-[var(--ink-soft)]">
                  Name (optional)
                </Label>
                <Input
                  placeholder="Contact name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidationError(null);
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-[12px] font-semibold mb-1 text-[var(--ink-soft)]">
              First message *
            </Label>
            <Textarea
              rows={3}
              placeholder="Type the first message…"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setValidationError(null);
              }}
            />
          </div>

          {validationError && (
            <div className="flex items-start gap-2 text-[12px] text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-2.5 py-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {!waConnected && (
            <p className="text-[11.5px] text-[#854D0E] bg-[#FEF9C3] rounded-lg px-2.5 py-1.5">
              WhatsApp isn’t connected — reconnect in Channels to start a chat.
            </p>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-[var(--line)] flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={close}
            disabled={startChat.isPending || isValidating}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit || startChat.isPending || isValidating}
          >
            {isValidating ? (
              <><Loader2 size={13} className="animate-spin" /> Verifying number…</>
            ) : startChat.isPending ? (
              <><Loader2 size={13} className="animate-spin" /> Starting…</>
            ) : (
              <><Send size={13} /> Start chat</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
