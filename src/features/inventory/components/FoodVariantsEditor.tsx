"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Switch } from "@/shared/ui/Switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch, type Control } from "react-hook-form";
import type { ProductFormInput } from "../types";

/**
 * Repeatable size/portion rows for Food products — each variant carries its own
 * absolute price, optional discount, SKU, and an availability toggle. Bound to
 * the parent form's `variants` field array.
 */
export function FoodVariantsEditor({
  control,
  disabled,
}: {
  control: Control<ProductFormInput>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <FormLabel>Sizes &amp; pricing *</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            append({
              label: "",
              price: "",
              discountPercentage: "",
              available: true,
              variantSku: "",
            })
          }
        >
          <Plus size={12} /> Add size
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-[var(--line)] px-3 py-4 text-center text-[12px] text-[var(--ink-mute)]">
          No sizes yet — add at least one (e.g. Small, Medium, Family).
        </p>
      )}

      {fields.map((field, index) => (
        <VariantCard
          key={field.id}
          control={control}
          index={index}
          disabled={disabled}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
}

function VariantCard({
  control,
  index,
  disabled,
  onRemove,
}: {
  control: Control<ProductFormInput>;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const label = useWatch({
    control,
    name: `variants.${index}.label`,
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 p-2.5">
      <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-1.5 mb-1">
        <span className="text-[11px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
          {label ? `Size: ${label}` : `Size #${index + 1}`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={disabled}
          onClick={onRemove}
          title="Remove size"
        >
          <Trash2 size={13} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <FormField
          control={control}
          name={`variants.${index}.label`}
          render={({ field: labelField }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Size / label *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Small, Large, Family, 5pcs…"
                  {...labelField}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <FormField
          control={control}
          name={`variants.${index}.price`}
          render={({ field: priceField }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Price *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1200"
                  {...priceField}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`variants.${index}.discountPercentage`}
          render={({ field: discountField }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">Disc %</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...discountField}
                  value={discountField.value ?? ""}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`variants.${index}.variantSku`}
          render={({ field: skuField }) => (
            <FormItem>
              <FormLabel className="text-[11.5px]">SKU</FormLabel>
              <FormControl>
                <Input
                  placeholder="PIZZA-S"
                  {...skuField}
                  value={skuField.value ?? ""}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`variants.${index}.available`}
        render={({ field: availableField }) => (
          <FormItem className="flex flex-row items-center justify-between border-t border-[var(--line)]/50 pt-2 mt-1.5">
            <FormLabel className="text-[11px] text-[var(--ink-mute)]">
              Available for order
            </FormLabel>
            <FormControl>
              <Switch
                checked={availableField.value ?? true}
                onCheckedChange={availableField.onChange}
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
