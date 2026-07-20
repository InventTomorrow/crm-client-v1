import { Bot, Loader2, Trash2 } from "lucide-react";

type EmptyChatStateVariant = "select" | "opening" | "deleted";

const COPY: Record<EmptyChatStateVariant, { title: string; subtitle: string }> = {
  select: {
    title: "Select a conversation",
    subtitle: "Click on a chat to start the conversation",
  },
  opening: {
    title: "Opening chat…",
    subtitle: "This will just take a moment",
  },
  deleted: {
    title: "Chat deleted",
    subtitle: "Click on a chat to start a new conversation",
  },
};

/** Shown in place of the chat thread when nothing is open — no header renders alongside it. */
export function EmptyChatState({ variant }: { variant: EmptyChatStateVariant }) {
  const { title, subtitle } = COPY[variant];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center text-[var(--ink-mute)] px-6">
      {variant === "opening" ? (
        <Loader2 size={32} className="mb-2 animate-spin" />
      ) : variant === "deleted" ? (
        <Trash2 size={32} className="mb-2 opacity-30" />
      ) : (
        <Bot size={36} className="mb-2 opacity-30" />
      )}
      <p className="text-[13.5px] font-medium text-[var(--ink)]">{title}</p>
      <p className="text-[12px]">{subtitle}</p>
    </div>
  );
}
