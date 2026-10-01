"use client";
import { useElementHeight } from "@/shared/hooks/useElementHeight";
import { Button } from "@/shared/ui/Button";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import {
  useWatch,
  type FieldArrayWithId,
  type UseFormReturn,
} from "react-hook-form";
import { usePresignedUpload } from "../hooks/useProducts";
import {
  getVariantLabel,
  type ProductFormData,
  type ProductFormInput,
} from "../types";

const FIELD_LABEL_CLASS = "text-[12px] text-[var(--ink-soft)]";

/** Photo size before the field rows have been measured — close to two rows. */
const FALLBACK_PHOTO_SIZE = 126;

type ProductForm = UseFormReturn<ProductFormInput, unknown, ProductFormData>;

export function ProductVariantsField({
  form,
  fields,
  sizeOptions,
  onAppend,
  onRemove,
  onImageChange,
  disabled,
}: {
  form: ProductForm;
  fields: FieldArrayWithId<ProductFormInput, "variants">[];
  sizeOptions: string[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  onImageChange: (index: number, url: string | null) => void;
  disabled?: boolean;
}) {
  // Only `upload` is shared — each FileUpload tracks its own progress, so rows never race.
  const { upload: uploadVariantImage } = usePresignedUpload("products");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink)]">
            Variants
            {fields.length > 0 && (
              <span className="rounded-full bg-[var(--accent-soft)] px-1.5 text-[11px] font-semibold text-[var(--accent)]">
                {fields.length}
              </span>
            )}
          </span>
          <span className="block text-[12px] text-[var(--ink-mute)]">
            Each version a customer can buy, with its own photo, size, colour,
            price and stock. The cheapest one sets the product price.
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAppend}
          disabled={disabled}
        >
          <Plus size={13} /> Add variant
        </Button>
      </div>

      {fields.map((variantField, index) => (
        <ProductVariantCard
          key={variantField.id}
          form={form}
          index={index}
          sizeOptions={sizeOptions}
          onUpload={uploadVariantImage}
          onRemove={() => onRemove(index)}
          onImageChange={(url) => onImageChange(index, url)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function ProductVariantCard({
  form,
  index,
  sizeOptions,
  onUpload,
  onRemove,
  onImageChange,
  disabled,
}: {
  form: ProductForm;
  index: number;
  sizeOptions: string[];
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  const variant = useWatch({ control: form.control, name: `variants.${index}` });
  const productName = useWatch({ control: form.control, name: "name" });
  const autoLabel = getVariantLabel(
    { size: variant?.size, color: variant?.color },
    productName ?? "",
  );
  // The photo column is as wide as the field rows are tall, so the square fills the card's height.
  const { elementRef: fieldsRef, height: fieldsHeight } =
    useElementHeight<HTMLDivElement>();
  const photoSizeStyle = {
    "--variant-photo-size": `${fieldsHeight ?? FALLBACK_PHOTO_SIZE}px`,
  } as CSSProperties;

  return (
    <div
      role="group"
      aria-label={`Variant ${index + 1}`}
      style={photoSizeStyle}
      className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-3 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-[var(--variant-photo-size)_minmax(0,1fr)_auto]"
    >
      <div className="relative aspect-square w-full self-start">
        <span className="pointer-events-none absolute top-1.5 left-1.5 z-10 inline-flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-[var(--primary-foreground)] shadow-sm">
          {index + 1}
        </span>
        <FileUpload
          value={variant?.imageUrl || null}
          onChange={onImageChange}
          onUpload={onUpload}
          accept="image/*"
          maxSize={5 * 1024 * 1024}
          thumbnail
          imageFit="cover"
          compactHeight="h-full"
          className="h-full [&>div:first-child]:h-full"
          disabled={disabled}
        />
      </div>

      {/* self-start: measured at its own height, never stretched to the photo's. */}
      <div ref={fieldsRef} className="flex min-w-0 flex-col gap-2.5 self-start">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <FormField
            control={form.control}
            name={`variants.${index}.name`}
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel className={FIELD_LABEL_CLASS}>Name (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder={autoLabel || "e.g. Maroon, Large"}
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.size`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={FIELD_LABEL_CLASS}>Size</FormLabel>
                <FormControl>
                  <SearchSelect
                    options={sizeOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Select"
                    searchPlaceholder="Search or type a size…"
                    emptyMessage="Type to add your own size."
                    creatable
                    disabled={disabled}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.color`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={FIELD_LABEL_CLASS}>Colour</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Maroon"
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <FormField
            control={form.control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={FIELD_LABEL_CLASS}>Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="8999"
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.stock`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={FIELD_LABEL_CLASS}>Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="10"
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.sku`}
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel className={FIELD_LABEL_CLASS}>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="LWN-ML"
                    {...field}
                    value={field.value ?? ""}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Remove variant"
        aria-label="Remove variant"
        className="self-start text-[var(--ink-mute)] hover:text-destructive"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
