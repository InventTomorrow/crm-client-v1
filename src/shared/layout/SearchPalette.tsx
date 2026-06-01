"use client";
import {
  INITIAL_LEADS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from "@/lib/mockData";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const NAV_ITEMS = [
  {
    id: "inbox",
    label: "Open Inbox",
    sub: "Unified conversations",
    ic: "inbox",
  },
  { id: "leads", label: "Open Leads", sub: "Kanban pipeline", ic: "users" },
  {
    id: "inventory",
    label: "Open Inventory",
    sub: "Catalog & connections",
    ic: "box",
  },
  {
    id: "analytics",
    label: "Open Analytics",
    sub: "Dashboards & funnel",
    ic: "chart",
  },
  {
    id: "admin",
    label: "Open Team & Access",
    sub: "Manage members + roles",
    ic: "shield",
  },
  {
    id: "settings",
    label: "Open Settings",
    sub: "Workspace settings",
    ic: "settings",
  },
];

function SearchRow({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-[10px] py-[9px] border-none bg-transparent cursor-pointer rounded-lg text-left hover:bg-[var(--accent-soft)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-[var(--ink)]">
          {label}
        </div>
        {sub && (
          <div className="text-[11.5px] text-[var(--ink-mute)] mt-px truncate">
            {sub}
          </div>
        )}
      </div>
      <ArrowRight size={13} className="text-[var(--ink-mute)]" />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-2 pt-[10px] pb-1 text-[10.5px] text-[var(--ink-mute)] uppercase tracking-[0.08em] font-semibold">
      {label}
    </div>
  );
}

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ("");
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

  const results = useMemo(() => {
    if (!q) return null;
    const lq = q.toLowerCase();
    const leads = INITIAL_LEADS.filter(
      (l) =>
        l.name.toLowerCase().includes(lq) ||
        l.lastMsg.toLowerCase().includes(lq) ||
        l.city.toLowerCase().includes(lq),
    ).slice(0, 5);
    const products = INITIAL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) || p.sku.toLowerCase().includes(lq),
    ).slice(0, 4);
    const orders = INITIAL_ORDERS.filter(
      (o) =>
        o.id.toLowerCase().includes(lq) || o.cust.toLowerCase().includes(lq),
    ).slice(0, 3);
    const pages = NAV_ITEMS.filter(
      (p) =>
        p.label.toLowerCase().includes(lq) || p.sub.toLowerCase().includes(lq),
    ).slice(0, 4);
    return { leads, products, orders, pages };
  }, [q]);

  const nav = (path: string) => {
    router.push(`/${path}`);
    onClose();
  };

  if (!open) return null;
  return (
    <>
      <div className="scrim items-start" onClick={onClose} />
      <div className="card-2 fade-up fixed left-1/2 top-20 -translate-x-1/2 w-[min(640px,92vw)] z-[80] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-[14px] border-b border-[var(--line)]">
          <Search size={16} className="text-[var(--ink-mute)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, products, orders, or jump to a page..."
            className="flex-1 border-none outline-none bg-transparent text-[15px] text-[var(--ink)] font-[inherit]"
          />
          <span className="text-[10px] text-[var(--ink-mute)] py-[2px] px-[6px] border border-[var(--line)] rounded-[5px] font-[var(--font-mono)] flex-shrink-0">
            ESC
          </span>
        </div>
        <div className="scroll max-h-[460px] overflow-y-auto">
          {!q && (
            <div className="p-4">
              <SectionHeader label="Quick actions" />
              {[
                { id: "inbox", label: "Open Inbox" },
                { id: "leads", label: "Open Leads pipeline" },
                { id: "admin", label: "Manage team members" },
                { id: "analytics", label: "View analytics" },
              ].map((a) => (
                <SearchRow
                  key={a.id}
                  label={a.label}
                  onClick={() => nav(a.id)}
                />
              ))}
              <div className="px-2 pt-[14px] pb-1 text-[11px] text-[var(--ink-mute)]">
                Try searching <b className="text-[var(--ink-soft)]">"Ali"</b>,{" "}
                <b className="text-[var(--ink-soft)]">"Karachi"</b>, or{" "}
                <b className="text-[var(--ink-soft)]">"#5821"</b>
              </div>
            </div>
          )}
          {q && results && (
            <div className="p-2">
              {results.pages.length > 0 && (
                <>
                  <SectionHeader label="Navigation" />
                  {results.pages.map((r) => (
                    <SearchRow
                      key={r.id}
                      label={r.label}
                      sub={r.sub}
                      onClick={() => nav(r.id)}
                    />
                  ))}
                </>
              )}
              {results.leads.length > 0 && (
                <>
                  <SectionHeader label="Leads" />
                  {results.leads.map((r) => (
                    <SearchRow
                      key={r.id}
                      label={r.name}
                      sub={`${r.status} · ${r.city} · ${r.lastMsg}`}
                      onClick={() => nav("inbox")}
                    />
                  ))}
                </>
              )}
              {results.products.length > 0 && (
                <>
                  <SectionHeader label="Products" />
                  {results.products.map((r) => (
                    <SearchRow
                      key={r.id}
                      label={r.name}
                      sub={`${r.sku} · Rs. ${r.price.toLocaleString()}`}
                      onClick={() => nav("inventory")}
                    />
                  ))}
                </>
              )}
              {results.orders.length > 0 && (
                <>
                  <SectionHeader label="Orders" />
                  {results.orders.map((r) => (
                    <SearchRow
                      key={r.id}
                      label={`Order ${r.id}`}
                      sub={`${r.cust} · Rs. ${r.total.toLocaleString()} · ${r.status}`}
                      onClick={() => nav("inventory")}
                    />
                  ))}
                </>
              )}
              {!results.pages.length &&
                !results.leads.length &&
                !results.products.length &&
                !results.orders.length && (
                  <div className="p-8 text-center text-[var(--ink-mute)] text-[13px]">
                    No results for "{q}"
                  </div>
                )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-[10px] border-t border-[var(--line)] text-[11px] text-[var(--ink-mute)]">
          <span>SaleFlow CRM</span>
        </div>
      </div>
    </>
  );
}
