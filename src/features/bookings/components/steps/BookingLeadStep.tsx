"use client";
import { useAddLead, useSearchLeads } from "@/features/leads/hooks/useLeads";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type {
  ManualBookingFormData,
  ManualBookingFormInput,
} from "../../types";

interface BookingLeadStepProps {
  form: UseFormReturn<ManualBookingFormInput, unknown, ManualBookingFormData>;
  disabled?: boolean;
}

/**
 * Resolves the booking to a real lead. Manual bookings used to carry a typed phone
 * number and no `leadId`, which left them invisible from the lead they belonged to —
 * so this step is required rather than a convenience.
 */
export function BookingLeadStep({
  form,
  disabled = false,
}: BookingLeadStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNewLead, setIsCreatingNewLead] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");

  const searchResults = useSearchLeads(searchTerm);
  const addLead = useAddLead();
  const vocabulary = useLeadVocabulary();

  const selectedLeadId = useWatch({ control: form.control, name: "leadId" });
  const selectedLeadName = useWatch({
    control: form.control,
    name: "customerName",
  });
  const selectedLeadPhone = useWatch({
    control: form.control,
    name: "customerPhone",
  });

  function selectLead(lead: { id: string; name: string; phone?: string }) {
    form.setValue("leadId", lead.id, { shouldValidate: true });
    form.setValue("customerName", lead.name, { shouldValidate: true });
    form.setValue("customerPhone", lead.phone ?? "", { shouldValidate: true });
    setSearchTerm("");
  }

  function handleCreateLead() {
    addLead.mutate(
      {
        name: newLeadName.trim(),
        phone: newLeadPhone.trim(),
        channel: "wa",
        status: "prospect",
      },
      {
        onSuccess: (createdLead) => {
          selectLead({
            id: createdLead.id,
            name: createdLead.name,
            phone: newLeadPhone.trim(),
          });
          setIsCreatingNewLead(false);
          setNewLeadName("");
          setNewLeadPhone("");
        },
      },
    );
  }

  if (selectedLeadId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[var(--ink)]">
              {selectedLeadName || `Unnamed ${vocabulary.singular}`}
            </p>
            <p className="truncate text-[11.5px] text-[var(--ink-mute)]">
              {selectedLeadPhone || "No number on file"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => {
              form.setValue("leadId", "", { shouldValidate: true });
              form.setValue("customerName", "");
              form.setValue("customerPhone", "");
            }}
          >
            Change
          </Button>
        </div>

        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact number</FormLabel>
              <FormControl>
                <Input
                  placeholder="+92 300 1234567"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Used for the confirmation. Editing it here does not change the{" "}
                {vocabulary.singular}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  if (isCreatingNewLead) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-[var(--ink)]">
            Name
          </label>
          <Input
            placeholder="Ayesha Khan"
            value={newLeadName}
            disabled={disabled || addLead.isPending}
            onChange={(event) => setNewLeadName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-[var(--ink)]">
            Phone
          </label>
          <Input
            placeholder="+92 300 1234567"
            value={newLeadPhone}
            disabled={disabled || addLead.isPending}
            onChange={(event) => setNewLeadPhone(event.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={addLead.isPending}
            onClick={() => setIsCreatingNewLead(false)}
          >
            Back to search
          </Button>
          <Button
            type="button"
            disabled={
              !newLeadName.trim() || !newLeadPhone.trim() || addLead.isPending
            }
            onClick={handleCreateLead}
          >
            {addLead.isPending ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" /> Adding…
              </>
            ) : (
              `Add ${vocabulary.singular}`
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-medium text-[var(--ink)]">
          Search {vocabulary.plural}
        </label>
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
          />
          <Input
            placeholder="Name or number"
            className="pl-9"
            value={searchTerm}
            disabled={disabled}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {searchResults.isFetching && (
        <p className="text-[12px] text-[var(--ink-mute)]">Searching…</p>
      )}

      {searchResults.data && searchResults.data.length > 0 && (
        <ul className="flex max-h-[240px] flex-col gap-1.5 overflow-y-auto pr-1">
          {searchResults.data.map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => selectLead(lead)}
                className={cn(
                  "w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-left transition-colors",
                  "hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                )}
              >
                <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                  {lead.name || `Unnamed ${vocabulary.singular}`}
                </p>
                <p className="truncate text-[11.5px] text-[var(--ink-mute)]">
                  {lead.phone ?? "No number on file"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchTerm.trim().length > 1 &&
        !searchResults.isFetching &&
        searchResults.data?.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-4 text-center text-[12px] text-[var(--ink-mute)]">
            No {vocabulary.singular} matches “{searchTerm.trim()}”.
          </p>
        )}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsCreatingNewLead(true)}
      >
        <UserPlus size={14} className="mr-1.5" /> Add a new{" "}
        {vocabulary.singular}
      </Button>

      <FormField
        control={form.control}
        name="leadId"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
