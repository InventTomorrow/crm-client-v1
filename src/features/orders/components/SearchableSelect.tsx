'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

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
  /** Shown in the trigger when `value` has no matching option (e.g. a saved line the catalog no longer has). */
  fallbackSelected?: ReactNode;
  /** Rows marked as the current choice when the list opens; defaults to `value`. */
  highlightedValues?: readonly string[];
  disabled?: boolean;
  emptyText?: string;
  invalid?: boolean;
  id?: string;
}

// Rendering every match at once stalls on big catalogs, where each variant is its own row.
const MAX_VISIBLE_OPTIONS = 100;
const PANEL_GAP = 4;
const VIEWPORT_MARGIN = 8;
const SEARCH_ROW_HEIGHT = 41;
const PREFERRED_LIST_HEIGHT = 300;
const MIN_LIST_HEIGHT = 120;

/** Below the trigger like a native select; above it only when there's more room there. */
function getPanelPlacement(triggerRect: DOMRect) {
  const spaceBelow = window.innerHeight - triggerRect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
  const spaceAbove = triggerRect.top - PANEL_GAP - VIEWPORT_MARGIN;
  const fitsBelow = spaceBelow >= SEARCH_ROW_HEIGHT + PREFERRED_LIST_HEIGHT;
  const opensUp = !fitsBelow && spaceAbove > spaceBelow;
  const listMaxHeight = Math.max(
    MIN_LIST_HEIGHT,
    Math.min(PREFERRED_LIST_HEIGHT, (opensUp ? spaceAbove : spaceBelow) - SEARCH_ROW_HEIGHT),
  );
  const position = opensUp
    ? { bottom: window.innerHeight - triggerRect.top + PANEL_GAP }
    : { top: triggerRect.bottom + PANEL_GAP };
  return { position, listMaxHeight };
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
  highlightedValues,
  disabled,
  emptyText = 'No results',
  invalid,
  id,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const highlighted = new Set(highlightedValues ?? (value ? [value] : []));

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

  // Scrolls the list itself, not the page, so the current choice is in view as it opens.
  const isPanelShown = open && !!rect;
  useEffect(() => {
    if (!isPanelShown) return;
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[data-highlighted="true"]');
    if (!list || !current) return;
    list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2;
  }, [isPanelShown]);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.search.toLowerCase().includes(q)) : options;
  const firstPage = filtered.slice(0, MAX_VISIBLE_OPTIONS);
  // The current choice always renders, even when it sits past the cap.
  const highlightedPastCap = filtered
    .slice(MAX_VISIBLE_OPTIONS)
    .filter((o) => highlighted.has(o.value));
  const visibleOptions = [...highlightedPastCap, ...firstPage];
  const placement = rect ? getPanelPlacement(rect) : null;

  return (
    <>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        disabled={disabled}
        data-invalid={invalid || undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-[var(--ink-mute)]/35 bg-[var(--surface-2)] px-2.5 text-left text-sm text-[var(--ink-field)] transition-colors duration-150 outline-none hover:border-[var(--ink-mute)]/60 focus-visible:border-[var(--accent)] focus-visible:ring-3 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20"
      >
        <span className="truncate flex items-center gap-2 min-w-0">
          {selected ? (
            renderSelected(selected.data)
          ) : fallbackSelected ? (
            fallbackSelected
          ) : (
            <span className="text-[var(--ink-mute)] truncate">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={14} className="text-[var(--ink-mute)] flex-shrink-0" />
      </button>

      {open &&
        rect &&
        placement &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              ...placement.position,
              left: rect.left,
              width: rect.width,
            }}
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
            <div
              ref={listRef}
              role="listbox"
              style={{ maxHeight: placement.listMaxHeight }}
              className="relative overflow-y-auto scroll py-1"
            >
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-center text-[12px] text-[var(--ink-mute)]">{emptyText}</div>
              )}
              {visibleOptions.map((o) => {
                const isHighlighted = highlighted.has(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    data-highlighted={isHighlighted}
                    onClick={() => {
                      onChange(o.value, o.data);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[var(--surface-2)] data-[highlighted=true]:bg-[var(--accent-soft)] flex items-center gap-2.5 transition-colors"
                  >
                    {renderRow(o.data)}
                    {isHighlighted && <Check size={14} className="shrink-0 text-[var(--accent)]" />}
                  </button>
                );
              })}
              {filtered.length > visibleOptions.length && (
                <div className="px-3 py-2 text-center text-[11.5px] text-[var(--ink-mute)]">
                  Showing {visibleOptions.length} of {filtered.length} — keep typing to narrow it down
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
