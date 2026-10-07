"use client";
import { ProductCustomOptions } from "@/features/product-custom-options/components/ProductCustomOptions";
import { useCustomOptionEditor } from "@/features/product-custom-options/hooks/useCustomOptionEditor";
import { Button } from "@/shared/ui/Button";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Plus } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { ProductFormData, ProductFormInput } from "../types";

type ProductForm = UseFormReturn<ProductFormInput, unknown, ProductFormData>;

/** Made-to-order customization: the switch, the options this product offers, and notes for the assistant. */
export function ProductCustomOptionsField({
  form,
  disabled,
}: {
  form: ProductForm;
  disabled: boolean;
}) {
  const isEnabled = useWatch({
    control: form.control,
    name: "customOptionsEnabled",
  });
  const optionEditor = useCustomOptionEditor();

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <FormField
          control={form.control}
          name="customOptionsEnabled"
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <label className="flex items-start gap-3">
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                    className="mt-0.5"
                  />
                </FormControl>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-[var(--ink)]">
                    Custom options
                  </span>
                  <span className="block text-[12px] text-[var(--ink-mute)]">
                    Let customers ask for something specific on this product — a
                    size, a colour, a name to add. The assistant collects what
                    you tick below before it takes the order.
                  </span>
                </span>
              </label>
            </FormItem>
          )}
        />
        {isEnabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={optionEditor.startAdding}
            disabled={disabled || optionEditor.isLoading}
          >
            <Plus size={13} /> Add option
          </Button>
        )}
      </div>

      {isEnabled && (
        <>
          <FormField
            control={form.control}
            name="customOptionKeys"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ProductCustomOptions
                    editor={optionEditor}
                    selectedKeys={field.value ?? []}
                    onSelectedKeysChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customOptionNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for the assistant</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="e.g. Printing on the back only, maximum two colours."
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <p className="text-[12px] text-[var(--ink-mute)]">
                  Limits specific to this product. Not shown to the customer.
                </p>
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
