"use client";
import { getImageUrl } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { Lead } from "@/features/leads/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { CURRENCIES, formatMoney } from "../lib/format";
import type { Order } from "../types";
import { orderFormSchema, type OrderFormValues } from "../validations.order";
import { SearchableSelect, type ComboOption } from "./SearchableSelect";

interface ProductRow {
  id: string;
  name: string;
  sku?: string | null;
  price?: number;
  imageUrls?: string[] | null;
}

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Order | null;
  presetLeadId?: string;
  presetConversationId?: string;
  onSubmit: (values: OrderFormValues) => void;
  isSubmitting?: boolean;
}

export function OrderForm({
  open,
  onClose,
  initial,
  presetLeadId,
  presetConversationId,
  onSubmit,
  isSubmitting,
}: OrderFormProps) {
  const { data: leads } = useLeads();
  const { data: products } = useProducts();

  const leadOptions: ComboOption<Lead>[] = useMemo(
    () =>
      ((leads ?? []) as unknown as Lead[]).map((l) => ({
        value: l.id,
        search: `${l.name ?? ""} ${l.email ?? ""} ${l.phone ?? ""}`,
        data: l,
      })),
    [leads],
  );

  const productOptions: ComboOption<ProductRow>[] = useMemo(
    () =>
      ((products ?? []) as unknown as ProductRow[]).map((p) => ({
        value: p.id,
        search: `${p.name} ${p.sku ?? ""}`,
        data: p,
      })),
    [products],
  );

  const currencyOptions: ComboOption<{ code: string; name: string }>[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        search: `${c.code} ${c.name}`,
        data: c,
      })),
    [],
  );

  const defaults: OrderFormValues = useMemo(
    () =>
      initial
        ? {
            leadId: initial.leadId,
            conversationId: initial.conversationId ?? undefined,
            currency: initial.currency,
            discount: Number(initial.discount),
            notes: initial.notes ?? "",
            items: initial.items.map((it) => ({
              productId: it.productId ?? undefined,
              name: it.name,
              sku: it.sku ?? "",
              quantity: it.quantity,
              unitPrice: Number(it.unitPrice),
            })),
          }
        : {
            leadId: presetLeadId ?? "",
            conversationId: presetConversationId,
            currency: "PKR",
            discount: 0,
            notes: "",
            items: [{ name: "", sku: "", quantity: 1, unitPrice: 0 }],
          },
    [initial, presetLeadId, presetConversationId],
  );

  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    // Cast: zod `coerce`/`default` make the resolver's input type diverge from
    // the output (OrderFormValues); the resolver still produces this shape.
    resolver: zodResolver(orderFormSchema) as unknown as Resolver<OrderFormValues>,
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const discount = Number(watch("discount")) || 0;
  const currency = watch("currency") || "PKR";
  const subtotal = (items ?? []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0,
  );
  const total = Math.max(0, subtotal - discount);

  if (!open) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[480px] max-w-[calc(100vw-28px)] z-[75]">
        <div className="flex items-center justify-between p-[18px] border-b border-[var(--line)]">
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">
            {initial ? `Edit order #${initial.orderNumber}` : "New order"}
          </h3>
          <button className="btn btn-ghost p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((v) => onSubmit(v))}
          className="flex-1 overflow-y-auto scroll p-[18px] flex flex-col gap-4"
        >
          {/* Customer / lead */}
          <div>
            <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">
              Customer (lead)
            </label>
            <div className="mt-1">
              <SearchableSelect
                options={leadOptions}
                value={watch("leadId")}
                disabled={!!presetLeadId || !!initial}
                placeholder="Select a lead…"
                onChange={(id) => setValue("leadId", id, { shouldValidate: true })}
                renderRow={(l) => (
                  <>
                    <CRMAvatar name={l.name ?? l.phone ?? "?"} size={28} />
                    <div className="min-w-0">
                      <div className="text-[13px] text-[var(--ink)] truncate">
                        {l.name ?? l.phone ?? "Unknown"}
                      </div>
                      {(l.email || l.phone) && (
                        <div className="text-[11.5px] text-[var(--ink-mute)] truncate">
                          {l.email ?? l.phone}
                        </div>
                      )}
                    </div>
                  </>
                )}
                renderSelected={(l) => (
                  <span className="flex items-center gap-2 min-w-0">
                    <CRMAvatar name={l.name ?? l.phone ?? "?"} size={20} />
                    <span className="truncate text-[13px]">{l.name ?? l.phone}</span>
                  </span>
                )}
              />
            </div>
            {errors.leadId && (
              <p className="text-[11.5px] text-[#DC2626] mt-1">{errors.leadId.message}</p>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">Items</label>
              <button
                type="button"
                className="btn btn-ghost text-[12px] py-1 px-2"
                onClick={() => append({ name: "", sku: "", quantity: 1, unitPrice: 0 })}
              >
                <Plus size={13} /> Add item
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-1.5">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <SearchableSelect
                      options={productOptions}
                      value={items?.[i]?.productId}
                      fallbackSelected={items?.[i]?.name || ""}
                      placeholder="Select product…"
                      onChange={(pid, p) => {
                        setValue(`items.${i}.productId`, pid);
                        setValue(`items.${i}.name`, p.name, { shouldValidate: true });
                        setValue(`items.${i}.sku`, p.sku ?? "");
                        setValue(`items.${i}.unitPrice`, p.price ?? 0);
                      }}
                      renderRow={(p) => (
                        <>
                          {p.imageUrls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getImageUrl(p.imageUrls[0])}
                              alt={p.name}
                              className="w-8 h-8 rounded-md object-cover flex-shrink-0 border border-[var(--line)]"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] text-[var(--ink)] truncate">{p.name}</div>
                            <div className="text-[11.5px] text-[var(--ink-mute)]">
                              {formatMoney(p.price ?? 0, currency)}
                              {p.sku ? ` · ${p.sku}` : ""}
                            </div>
                          </div>
                        </>
                      )}
                      renderSelected={(p) => (
                        <span className="flex items-center gap-2 min-w-0">
                          {p.imageUrls?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getImageUrl(p.imageUrls[0])}
                              alt=""
                              className="w-5 h-5 rounded object-cover"
                            />
                          )}
                          <span className="truncate text-[13px]">{p.name}</span>
                        </span>
                      )}
                    />
                  </div>
                  <input
                    className="input w-[64px]"
                    type="number"
                    min={1}
                    placeholder="Qty"
                    {...register(`items.${i}.quantity`)}
                  />
                  <input
                    className="input w-[90px]"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Price"
                    {...register(`items.${i}.unitPrice`)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost p-2 text-[var(--ink-mute)]"
                    onClick={() => fields.length > 1 && remove(i)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {errors.items?.message && (
              <p className="text-[11.5px] text-[#DC2626] mt-1">{errors.items.message}</p>
            )}
          </div>

          {/* Currency + discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">Currency</label>
              <div className="mt-1">
                <SearchableSelect
                  options={currencyOptions}
                  value={watch("currency")}
                  placeholder="Currency"
                  onChange={(code) => setValue("currency", code, { shouldValidate: true })}
                  renderRow={(c) => (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[13px] text-[var(--ink)]">{c.code}</span>
                      <span className="text-[11.5px] text-[var(--ink-mute)] truncate">{c.name}</span>
                    </div>
                  )}
                  renderSelected={(c) => <span className="text-[13px]">{c.code}</span>}
                />
              </div>
            </div>
            <div>
              <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">Discount</label>
              <input
                className="input mt-1"
                type="number"
                min={0}
                step="0.01"
                {...register("discount")}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[12.5px] font-medium text-[var(--ink-soft)]">Notes</label>
            <textarea
              className="input mt-1 min-h-[60px]"
              placeholder="Optional notes…"
              {...register("notes")}
            />
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[13px]">
            <div className="flex justify-between text-[var(--ink-soft)]">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-soft)] mt-1">
              <span>Discount</span>
              <span>− {formatMoney(discount, currency)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--ink)] mt-2 pt-2 border-t border-[var(--line)]">
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>
        </form>

        <div className="p-[18px] border-t border-[var(--line)] flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-grad"
            onClick={handleSubmit((v) => onSubmit(v))}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {initial ? "Save changes" : "Create order"}
          </button>
        </div>
      </div>
    </>
  );
}
