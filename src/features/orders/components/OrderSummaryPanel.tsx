"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Loader2 } from "lucide-react";
import type { OrderFormApi } from "../hooks/useOrderForm";
import { CURRENCIES, ORDER_STATUS_META, formatMoney } from "../lib/format";
import { ORDER_CREATE_STATUSES } from "../types";

interface OrderSummaryPanelProps {
  form: OrderFormApi;
  isEditMode: boolean;
  currency: string;
  subtotal: number;
  total: number;
  unitCount: number;
  isSaving: boolean;
  onCancel: () => void;
}

export function OrderSummaryPanel({
  form,
  isEditMode,
  currency,
  subtotal,
  total,
  unitCount,
  isSaving,
  onCancel,
}: OrderSummaryPanelProps) {
  // An order saved in a currency outside the list keeps it as a choice.
  const currencyCodes = CURRENCIES.some((option) => option.code === currency)
    ? CURRENCIES
    : [{ code: currency, name: currency }, ...CURRENCIES];

  return (
    <section className="card flex flex-col gap-4 p-5">
      <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">Order summary</h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {!isEditMode && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
                  <SelectTrigger size="lg" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_CREATE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ORDER_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className={isEditMode ? "col-span-2 lg:col-span-1" : undefined}>
              <FormLabel>Currency</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
                <SelectTrigger size="lg" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyCodes.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} · {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <dl className="flex flex-col gap-2.5 border-t border-[var(--line)] pt-4 text-[13px]">
        <div className="flex justify-between text-[var(--ink-soft)]">
          <dt>
            Subtotal · {unitCount} unit{unitCount === 1 ? "" : "s"}
          </dt>
          <dd>{formatMoney(subtotal, currency)}</dd>
        </div>
        <FormField
          control={form.control}
          name="discount"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="text-[13px] font-normal text-[var(--ink-soft)]">
                  Discount
                </FormLabel>
                <FormControl className="w-[130px]">
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="text-right"
                    aria-invalid={!!fieldState.error}
                    disabled={isSaving}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-right" />
            </FormItem>
          )}
        />
        <div className="flex justify-between border-t border-[var(--line)] pt-3 text-[15px] font-semibold text-[var(--ink)]">
          <dt>Total</dt>
          <dd>{formatMoney(total, currency)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="xl" disabled={isSaving} className="w-full">
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          {isSaving ? "Saving…" : isEditMode ? "Save changes" : "Create order"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}
