'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

export interface ComboOption<T> {
  value: string;
  search: string;
  data: T;
}

interface Props<T> {
  options: ComboOption<T>[];
  value?: string;
  onChange: (value: string, data: T) => void;
  placeholder: string;
  /** Row rendered inside the dropdown list. */
  renderRow: (data: T) => ReactNode;
  /** Compact content shown in the trigger when an option is selected. */
  renderSelected: (data: T) => ReactNode;
  /** Shown in the trigger when `value` has no matching option (e.g. a free-typed name). */
  fallbackSelected?: string;
  disabled?: boolean;
  emptyText?: string;
}

/**
 * Compact, searchable single-select. Renders its dropdown in a body portal with
 * fixed positioning so it never gets clipped by the scrolling form sheet.
 */
export function SearchableSelect<T>({
  options,
  value,
  onChange,
  placeholder,
  renderRow,
  renderSelected,
  fallbackSelected,
  disabled,
  emptyText = 'No results',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    };
    update();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.search.toLowerCase().includes(q)) : options;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between gap-2 text-left w-full"
      >
        <span className="truncate flex items-center gap-2 min-w-0">
          {selected ? (
            renderSelected(selected.data)
          ) : (
            <span className="text-[var(--ink-mute)] truncate">{fallbackSelected || placeholder}</span>
          )}
        </span>
        <ChevronDown size={14} className="text-[var(--ink-mute)] flex-shrink-0" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width }}
            className="card-2 z-[120] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-2)]"
          >
            <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[var(--line)]">
              <Search size={13} className="text-[var(--ink-mute)] flex-shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent outline-none text-[13px] text-[var(--ink)]"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto scroll py-1">
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-center text-[12px] text-[var(--ink-mute)]">{emptyText}</div>
              )}
              {filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value, o.data);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-[var(--surface-2)] flex items-center gap-2.5 transition-colors"
                >
                  {renderRow(o.data)}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
