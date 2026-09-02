"use client";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

/**
 * RETIRED — kept for reference only, not imported by any feature.
 *
 * The product form's category field now uses the shared
 * `@/shared/ui/CreateableAutoComplete`. Do not import this from a real page.
 *
 * Category picker with inline creation: search the list, and when no match is
 * found, a "Create" action swaps the control for a text input with confirm /
 * cancel buttons. A created category is selected and added to the list.
 */
export function CreatableCategorySelect({
  value,
  onChange,
  options,
  disabled,
  placeholder = "Select category",
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [created, setCreated] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const merged = useMemo(() => {
    const seen = new Set<string>();
    return [...options, ...created, value].filter((c) => {
      const key = c?.trim().toLowerCase();
      if (!c || !key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [options, created, value]);

  const q = query.trim().toLowerCase();
  const filtered = merged.filter((c) => c.toLowerCase().includes(q));
  const exactExists = merged.some((c) => c.toLowerCase() === q);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const startCreate = (seed: string) => {
    setNewName(seed);
    setCreating(true);
    setOpen(false);
    setQuery("");
  };

  const confirmCreate = () => {
    const name = newName.trim();
    if (!name) return;
    if (!merged.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setCreated((prev) => [...prev, name]);
    }
    onChange(name);
    setCreating(false);
    setNewName("");
  };

  const cancelCreate = () => {
    setCreating(false);
    setNewName("");
  };

  // ── Create mode: input + confirm/cancel ──
  if (creating) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          className="flex-1"
          placeholder="New category name"
          value={newName}
          disabled={disabled}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmCreate();
            }
            if (e.key === "Escape") cancelCreate();
          }}
        />
        <Button
          type="button"
          size="icon"
          onClick={confirmCreate}
          disabled={disabled || !newName.trim()}
          title="Create category"
          className="flex-shrink-0"
        >
          <Check size={15} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={cancelCreate}
          disabled={disabled}
          title="Cancel"
          className="flex-shrink-0"
        >
          <X size={15} />
        </Button>
      </div>
    );
  }

  // ── Select mode ──
  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="input flex items-center justify-between w-full text-left"
      >
        <span className={value ? "text-[13px]" : "text-[13px] text-[var(--ink-mute)]"}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className="text-[var(--ink-mute)] flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full card p-1 shadow-lg border border-[var(--line)]">
          <Input
            autoFocus
            className="text-[13px] mb-1"
            placeholder="Search or add category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim() && !exactExists) {
                e.preventDefault();
                startCreate(query.trim());
              }
            }}
          />
          <div className="max-h-44 overflow-y-auto scroll">
            {filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex items-center justify-between w-full px-2 py-1.5 rounded-md text-[13px] text-left hover:bg-[var(--surface-2)]",
                  value === c && "text-[var(--accent)] font-medium",
                )}
              >
                <span className="truncate">{c}</span>
                {value === c && <Check size={13} className="flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && !query.trim() && (
              <div className="px-2 py-2 text-[12px] text-[var(--ink-mute)]">
                No categories yet
              </div>
            )}
          </div>

          {query.trim() && !exactExists && (
            <button
              type="button"
              onClick={() => startCreate(query.trim())}
              className="flex items-center gap-1.5 w-full mt-1 px-2 py-2 rounded-md text-[12.5px] text-[var(--accent)] border-t border-[var(--line)] hover:bg-[var(--accent-soft)]"
            >
              <Plus size={13} className="flex-shrink-0" />
              <span className="truncate">
                Not found — create “{query.trim()}”
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
