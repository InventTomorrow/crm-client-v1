"use client";
import { useSearchLeads } from "@/features/leads/hooks/useLeads";
import { Lead } from "@/features/leads/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart2,
  Box,
  Inbox,
  Loader2,
  Search,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  {
    id: "inbox",
    label: "Open Inbox",
    sub: "Unified conversations",
    Icon: Inbox,
  },
  { id: "leads", label: "Open Leads", sub: "Kanban pipeline", Icon: Users },
  {
    id: "orders",
    label: "Open Orders",
    sub: "Order management",
    Icon: ShoppingCart,
  },
  {
    id: "inventory",
    label: "Open Inventory",
    sub: "Catalog & products",
    Icon: Box,
  },
  {
    id: "analytics",
    label: "Open Analytics",
    sub: "Dashboards & funnel",
    Icon: BarChart2,
  },
  {
    id: "settings",
    label: "Open Settings",
    sub: "Workspace settings",
    Icon: Settings,
  },
];

const CHANNEL_LABEL: Record<string, string> = {
  wa: "WhatsApp",
  ig: "Instagram",
  fb: "Facebook",
};

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-2 pt-3 pb-1 text-[10.5px] text-[var(--ink-mute)] uppercase tracking-[0.08em] font-semibold">
      {label}
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
  onClick,
  focused,
}: {
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  focused?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-left transition-colors",
        focused ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-2)]",
      )}
    >
      {icon && (
        <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0 text-[var(--ink-soft)]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-[var(--ink)] truncate">
          {label}
        </div>
        {sub && (
          <div className="text-[11.5px] text-[var(--ink-mute)] mt-px truncate">
            {sub}
          </div>
        )}
      </div>
      <ArrowRight size={13} className="text-[var(--ink-mute)] flex-shrink-0" />
    </button>
  );
}

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ("");
      setDebouncedQ("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounce query by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data: leads = [], isFetching } = useSearchLeads(debouncedQ);

  const filteredNav = debouncedQ
    ? NAV_ITEMS.filter(
        (n) =>
          n.label.toLowerCase().includes(debouncedQ.toLowerCase()) ||
          n.sub.toLowerCase().includes(debouncedQ.toLowerCase()),
      )
    : [];

  const nav = (path: string) => {
    router.push(`/${path}`);
    onClose();
  };
  const navToLead = (lead: { conversationId?: string }) => {
    if (lead.conversationId)
      router.push(`/inbox?conversation=${lead.conversationId}`);
    else router.push("/leads");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="scrim items-start" onClick={onClose} />
      <div className="card-2 fade-up fixed left-1/2 top-20 -translate-x-1/2 w-[min(640px,92vw)] z-[80] bg-[var(--surface)] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-[13px] border-b border-[var(--line)]">
          {isFetching && debouncedQ ? (
            <Loader2
              size={15}
              className="text-[var(--accent)] flex-shrink-0 animate-spin"
            />
          ) : (
            <Search
              size={15}
              className="text-[var(--ink-mute)] flex-shrink-0"
            />
          )}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, orders, or jump to a page…"
            className="flex-1 border-none outline-none bg-transparent text-[15px] text-[var(--ink)] font-[inherit]"
          />
          <kbd className="text-[10px] text-[var(--ink-mute)] py-[2px] px-[6px] border border-[var(--line)] rounded-[5px] font-[var(--font-mono)] flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="scroll max-h-[460px] overflow-y-auto p-2">
          {/* Empty state — show quick actions */}
          {!debouncedQ && (
            <>
              <SectionLabel label="Quick actions" />
              {NAV_ITEMS.slice(0, 4).map((n) => (
                <Row
                  key={n.id}
                  icon={<n.Icon size={13} />}
                  label={n.label}
                  sub={n.sub}
                  onClick={() => nav(n.id)}
                />
              ))}
              <div className="px-2 pt-3 pb-1 text-[11px] text-[var(--ink-mute)]">
                Try searching{" "}
                <span className="font-semibold text-[var(--ink-soft)]">
                  "Ali"
                </span>
                ,{" "}
                <span className="font-semibold text-[var(--ink-soft)]">
                  "Karachi"
                </span>
                , or{" "}
                <span className="font-semibold text-[var(--ink-soft)]">
                  "0300"
                </span>
              </div>
            </>
          )}

          {/* Search results */}
          {debouncedQ && (
            <>
              {leads.length > 0 && (
                <>
                  <SectionLabel label="Leads" />
                  {leads.map((lead: Lead) => (
                    <Row
                      key={lead.id}
                      icon={<Users size={13} />}
                      label={lead.name}
                      sub={[
                        lead.phone,
                        lead.city !== "Unknown" ? lead.city : null,
                        CHANNEL_LABEL[lead.channel],
                        lead.status,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      onClick={() => navToLead(lead)}
                    />
                  ))}
                </>
              )}

              {filteredNav.length > 0 && (
                <>
                  <SectionLabel label="Pages" />
                  {filteredNav.map((n) => (
                    <Row
                      key={n.id}
                      icon={<n.Icon size={13} />}
                      label={n.label}
                      sub={n.sub}
                      onClick={() => nav(n.id)}
                    />
                  ))}
                </>
              )}

              {leads.length === 0 &&
                filteredNav.length === 0 &&
                !isFetching && (
                  <div className="py-12 text-center text-[var(--ink-mute)] text-[13px]">
                    No results for &ldquo;{debouncedQ}&rdquo;
                  </div>
                )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-[9px] border-t border-[var(--line)] text-[11px] text-[var(--ink-mute)]">
          <span>SaleFlow CRM</span>
          <span>↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </>
  );
}
