'use client';
import { useSearchLeads } from '@/features/leads/hooks/useLeads';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Search, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface LeadSelectFieldProps {
  selectedLeadId: string | null;
  selectedLeadName: string;
  selectedLeadPhone: string;
  onSelect: (lead: { id: string; name: string; phone?: string }) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * Optional lead linkage for a direct-entry booking. Picking a lead fills the contact
 * fields, so the appointment stays visible from the lead instead of living as a
 * loose phone number.
 */
export function LeadSelectField({
  selectedLeadId,
  selectedLeadName,
  selectedLeadPhone,
  onSelect,
  onClear,
  disabled = false,
}: LeadSelectFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchResults = useSearchLeads(searchTerm);

  if (selectedLeadId) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <UserCheck size={14} className="shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-[var(--ink)]">
              {selectedLeadName || 'Unnamed lead'}
            </p>
            <p className="truncate text-[11px] text-[var(--ink-mute)]">
              {selectedLeadPhone || 'No number on file'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => {
            onClear();
            setSearchTerm('');
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
        />
        <Input
          placeholder="Search by name or number"
          className="pl-9"
          value={searchTerm}
          disabled={disabled}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {searchResults.data && searchResults.data.length > 0 && (
        <ul className="flex max-h-[168px] flex-col gap-1 overflow-y-auto pr-1">
          {searchResults.data.map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(lead);
                  setSearchTerm('');
                }}
                className={cn(
                  'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-left transition-colors',
                  'hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                )}
              >
                <p className="truncate text-[12.5px] font-medium text-[var(--ink)]">
                  {lead.name || 'Unnamed lead'}
                </p>
                <p className="truncate text-[11px] text-[var(--ink-mute)]">
                  {lead.phone ?? 'No number on file'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchTerm.trim().length > 1 &&
        !searchResults.isFetching &&
        searchResults.data?.length === 0 && (
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            No lead matches “{searchTerm.trim()}” — the booking will be saved against the
            number below.
          </p>
        )}
    </div>
  );
}
