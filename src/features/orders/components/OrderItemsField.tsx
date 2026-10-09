"use client";
import { cn, getImageUrl } from "@/lib/utils";
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
import { Package, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { OrderFormApi } from "../hooks/useOrderForm";
import { formatMoney } from "../lib/format";
import type {
  CatalogLineOption,
  LineCatalogMatch,
} from "../utils/catalogLineOptions";
import {
  getOrderLineTotal,
  type OrderFormInput,
  type OrderItemFormInput,
} from "../validations.order";
import { SearchableSelect, type ComboOption } from "./SearchableSelect";

interface OrderItemsFieldProps {
  form: OrderFormApi;
  lineFields: FieldArrayWithId<OrderFormInput, "items">[];
  watchedLines: OrderItemFormInput[];
  catalogLineOptions: CatalogLineOption[];
  lineCatalogMatches: LineCatalogMatch[];
  isLoadingProducts: boolean;
  currency: string;
  onSelectLine: (lineIndex: number, option: CatalogLineOption) => void;
  onSelectSize: (lineIndex: number, option: CatalogLineOption, size: string) => void;
  onAppendLine: () => void;
  onRemoveLine: (lineIndex: number) => void;
  disabled: boolean;
}

export function OrderItemsField({
  form,
  lineFields,
  watchedLines,
  catalogLineOptions,
  lineCatalogMatches,
  isLoadingProducts,
  currency,
  onSelectLine,
  onSelectSize,
  onAppendLine,
  onRemoveLine,
  disabled,
}: OrderItemsFieldProps) {
  const comboOptions: ComboOption<CatalogLineOption>[] = useMemo(
    () =>
      catalogLineOptions.map((option) => ({
        value: option.optionId,
        search: option.searchText,
        data: option,
      })),
    [catalogLineOptions],
  );

  const linesError = form.formState.errors.items?.root?.message ??
    form.formState.errors.items?.message;

  return (
    <div className="flex flex-col gap-3">
      {lineFields.map((lineField, lineIndex) => {
        const line = watchedLines[lineIndex];
        const catalogMatch = lineCatalogMatches[lineIndex];
        const selectedOption = catalogMatch?.option;
        const hasSizeChoice = (selectedOption?.sizes.length ?? 0) > 1;
        const quantity = Number(line?.quantity) || 0;

        return (
          <div
            key={lineField.id}
            className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name={`items.${lineIndex}.name`}
                render={({ fieldState }) => (
                  <FormItem className="min-w-0 flex-1">
                    <FormLabel>Item {lineIndex + 1}</FormLabel>
                    <SearchableSelect
                      options={comboOptions}
                      value={selectedOption?.optionId}
                      highlightedValues={catalogMatch?.highlightedOptionIds}
                      fallbackSelected={
                        line?.name ? (
                          <span className="flex min-w-0 items-center gap-2">
                            <CatalogThumb
                              imageUrl={catalogMatch?.imageUrl}
                              className="size-5 rounded"
                            />
                            <span className="truncate text-[13px]">{line.name}</span>
                          </span>
                        ) : undefined
                      }
                      invalid={!!fieldState.error}
                      disabled={disabled}
                      placeholder={
                        isLoadingProducts
                          ? "Loading products…"
                          : "Search products, variants or SKU…"
                      }
                      emptyText={
                        catalogLineOptions.length
                          ? "No matching products"
                          : "Your catalog is empty — add products in Inventory first"
                      }
                      onChange={(_optionId, option) => onSelectLine(lineIndex, option)}
                      renderRow={(option) => (
                        <CatalogOptionRow option={option} currency={currency} />
                      )}
                      renderSelected={(option) => (
                        <span className="flex min-w-0 items-center gap-2">
                          <CatalogThumb imageUrl={option.imageUrl} className="size-5 rounded" />
                          <span className="truncate text-[13px]">{option.productName}</span>
                          {option.variantLabel && <VariantChip label={option.variantLabel} />}
                        </span>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xl"
                aria-label={`Remove item ${lineIndex + 1}`}
                className="mt-[22px] text-[var(--ink-mute)] hover:text-destructive"
                onClick={() => onRemoveLine(lineIndex)}
                disabled={disabled || lineFields.length <= 1}
              >
                <Trash2 size={15} />
              </Button>
            </div>

            <div
              className={cn(
                "grid grid-cols-2 gap-3",
                hasSizeChoice ? "sm:grid-cols-4" : "sm:grid-cols-3",
              )}
            >
              {hasSizeChoice && selectedOption && (
                <FormField
                  control={form.control}
                  name={`items.${lineIndex}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(size) => onSelectSize(lineIndex, selectedOption, size)}
                        disabled={disabled}
                      >
                        <SelectTrigger size="lg" className="w-full">
                          <SelectValue placeholder="Pick a size" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedOption.sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name={`items.${lineIndex}.quantity`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        aria-invalid={!!fieldState.error}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${lineIndex}.unitPrice`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Unit price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        aria-invalid={!!fieldState.error}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
                <span className="text-sm leading-none font-medium text-[var(--ink)]">
                  Line total
                </span>
                <output className="flex h-10 items-center justify-end rounded-lg bg-[var(--surface-2)]/60 px-2.5 text-sm font-semibold text-[var(--ink)]">
                  {formatMoney(line ? getOrderLineTotal(line) : 0, currency)}
                </output>
              </div>
            </div>

            {selectedOption && quantity > selectedOption.stock && (
              <p className="text-[11.5px] text-[var(--warning-foreground)]">
                {selectedOption.stock > 0
                  ? `Only ${selectedOption.stock} in stock`
                  : "Out of stock"}{" "}
                — the order can still be saved.
              </p>
            )}

            {!!line?.customOptions?.length && (
              <p className="text-[12px] text-[var(--ink-mute)]">
                Customized:{" "}
                {line.customOptions
                  .map((option) => `${option.label}: ${option.value}`)
                  .join(" · ")}
                {!!line.customizationTotal &&
                  ` (+${formatMoney(line.customizationTotal, currency)} / unit)`}
              </p>
            )}
          </div>
        );
      })}

      {linesError && <p className="text-[11.5px] text-[#DC2626]">{linesError}</p>}

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={onAppendLine}
        disabled={disabled}
      >
        <Plus size={14} /> Add another item
      </Button>
    </div>
  );
}

function CatalogThumb({
  imageUrl,
  className,
}: {
  imageUrl: string | undefined;
  className: string;
}) {
  if (!imageUrl) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-[var(--surface-2)] text-[var(--ink-mute)]",
          className,
        )}
      >
        <Package size={12} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getImageUrl(imageUrl)}
      alt=""
      className={cn("shrink-0 border border-[var(--line)] object-cover", className)}
    />
  );
}

function VariantChip({ label }: { label: string }) {
  return (
    <span className="shrink-0 truncate rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--ink-soft)]">
      {label}
    </span>
  );
}

function CatalogOptionRow({
  option,
  currency,
}: {
  option: CatalogLineOption;
  currency: string;
}) {
  const isInStock = option.stock > 0;
  return (
    <>
      <CatalogThumb imageUrl={option.imageUrl} className="size-9 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] text-[var(--ink)]">{option.productName}</span>
          {option.variantLabel && <VariantChip label={option.variantLabel} />}
        </div>
        <div className="truncate text-[11.5px] text-[var(--ink-mute)]">
          {[
            formatMoney(option.price, currency),
            option.sku,
            option.sizes.length > 1 ? `Sizes ${option.sizes.join(", ")}` : option.sizes[0],
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-[11px]",
          isInStock ? "text-[var(--ink-mute)]" : "text-destructive",
        )}
      >
        {isInStock ? `${option.stock} in stock` : "Out of stock"}
      </span>
    </>
  );
}
