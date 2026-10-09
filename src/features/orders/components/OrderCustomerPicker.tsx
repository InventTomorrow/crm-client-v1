"use client";
import type { Lead } from "@/features/leads/types";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { useMemo } from "react";
import type { OrderFormApi } from "../hooks/useOrderForm";
import { SearchableSelect, type ComboOption } from "./SearchableSelect";

interface OrderCustomerPickerProps {
  form: OrderFormApi;
  leads: Lead[];
  isLoadingLeads: boolean;
  selectedLeadId: string;
  onSelectCustomer: (lead: Lead) => void;
  isCustomerLocked: boolean;
  isEditMode: boolean;
  disabled: boolean;
}

export function OrderCustomerPicker({
  form,
  leads,
  isLoadingLeads,
  selectedLeadId,
  onSelectCustomer,
  isCustomerLocked,
  isEditMode,
  disabled,
}: OrderCustomerPickerProps) {
  const leadOptions: ComboOption<Lead>[] = useMemo(
    () =>
      leads.map((lead) => ({
        value: lead.id,
        search: `${lead.name ?? ""} ${lead.email ?? ""} ${lead.phone ?? ""}`,
        data: lead,
      })),
    [leads],
  );

  return (
    <FormField
      control={form.control}
      name="leadId"
      render={({ fieldState }) => (
        <FormItem>
          <FormLabel>Customer *</FormLabel>
          <SearchableSelect
            options={leadOptions}
            value={selectedLeadId}
            invalid={!!fieldState.error}
            disabled={disabled || isCustomerLocked}
            placeholder={
              isLoadingLeads ? "Loading customers…" : "Search by name, phone or email…"
            }
            emptyText="No matching customers"
            onChange={(_leadId, lead) => onSelectCustomer(lead)}
            renderRow={(lead) => (
              <>
                <CRMAvatar name={lead.name ?? lead.phone ?? "?"} size={28} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-[var(--ink)]">
                    {lead.name ?? lead.phone ?? "Unknown"}
                  </div>
                  {(lead.phone || lead.email) && (
                    <div className="truncate text-[11.5px] text-[var(--ink-mute)]">
                      {[lead.phone, lead.email].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </>
            )}
            renderSelected={(lead) => (
              <span className="flex min-w-0 items-center gap-2">
                <CRMAvatar name={lead.name ?? lead.phone ?? "?"} size={20} />
                <span className="truncate text-[13px]">{lead.name ?? lead.phone}</span>
                {lead.phone && lead.phone !== lead.name && (
                  <span className="truncate text-[12px] text-[var(--ink-mute)]">
                    {lead.phone}
                  </span>
                )}
              </span>
            )}
          />
          <FormDescription>
            {isEditMode
              ? "A saved order stays with its customer."
              : isCustomerLocked
                ? "Set from the chat you started this order in. Their saved details are filled in below."
                : "Picking a customer fills in their saved details below — edit them for this order if needed."}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
