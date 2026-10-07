"use client";
import { getImageUrl } from "@/lib/utils";
import { useElementHeight } from "@/shared/hooks/useElementHeight";
import { Button } from "@/shared/ui/Button";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Link2, Plus, Trash2 } from "lucide-react";
import { useState, type CSSProperties } from "react";
import {
  useWatch,
  type FieldArrayWithId,
  type UseFormReturn,
} from "react-hook-form";
import { useCustomSizeOptions } from "../hooks/useCustomSizeOptions";
import { usePresignedUpload } from "../hooks/useProducts";
import {
  getVariantLabel,
  type ProductFormData,
  type ProductFormInput,
} from "../types";
import { ImageLinkField } from "./ImageLinkField";
import { VariantSizesPicker } from "./VariantSizesPicker";

const FIELD_LABEL_CLASS = "text-[12px] text-[var(--ink-soft)]";

/** Photo size before the field rows have been measured — close to two rows. */
const FALLBACK_PHOTO_SIZE = 126;

type ProductForm = UseFormReturn<ProductFormInput, unknown, ProductFormData>;

export function ProductVariantsField({
  form,
  fields,
  sizeCategory,
  coverImageUrl,
  skuSuggestions,
  onAppend,
  onRemove,
  onImageChange,
  onImageLink,
  disabled,
}: {
  form: ProductForm;
  fields: FieldArrayWithId<ProductFormInput, "variants">[];
  sizeCategory?: string;
  coverImageUrl?: string;
  skuSuggestions: (string | undefined)[];
  onAppend: () => void;
  onRemove: (index: number) => void;
  onImageChange: (index: number, url: string | null) => void;
  onImageLink: (index: number, url: string) => void;
  disabled?: boolean;
}) {
  // Only `upload` is shared — each FileUpload tracks its own progress, so rows never race.
  const { upload: uploadVariantImage } = usePresignedUpload("products");
  const { customSizeOptions, saveCustomSize } = useCustomSizeOptions(sizeCategory);

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
            Each version a customer can buy, with its own photo, sizes, colour,
            price and stock — all of a version&apos;s sizes share its stock. The
            cheapest one sets the product price.
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
          sizeCategory={sizeCategory}
          customSizeOptions={customSizeOptions}
          onCustomSizeAdded={saveCustomSize}
          coverImageUrl={coverImageUrl}
          skuSuggestion={skuSuggestions[index]}
          onUpload={uploadVariantImage}
          onRemove={() => onRemove(index)}
          onImageChange={(url) => onImageChange(index, url)}
          onImageLink={(url) => onImageLink(index, url)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function ProductVariantCard({
  form,
  index,
  sizeCategory,
  customSizeOptions,
  onCustomSizeAdded,
  coverImageUrl,
  skuSuggestion,
  onUpload,
  onRemove,
  onImageChange,
  onImageLink,
  disabled,
}: {
  form: ProductForm;
  index: number;
  sizeCategory?: string;
  customSizeOptions: readonly string[];
  onCustomSizeAdded: (size: string) => void;
  coverImageUrl?: string;
  skuSuggestion?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  onImageChange: (url: string | null) => void;
  onImageLink: (url: string) => void;
  disabled?: boolean;
}) {
  const variant = useWatch({
    control: form.control,
    name: `variants.${index}`,
  });
  const productName = useWatch({ control: form.control, name: "name" });
  const autoLabel = getVariantLabel(
    { sizes: variant?.sizes, color: variant?.color },
    productName ?? "",
  );
  // The photo column is as wide as the field rows are tall, so the square fills the card's height.
  const { elementRef: fieldsRef, height: fieldsHeight } =
    useElementHeight<HTMLDivElement>();
  const photoSizeStyle = {
    "--variant-photo-size": `${fieldsHeight ?? FALLBACK_PHOTO_SIZE}px`,
  } as CSSProperties;
  const showsCoverFallback = !variant?.imageUrl && Boolean(coverImageUrl);

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
        {/* Click-through, so the drop zone underneath still takes a click or a dropped file. */}
        {showsCoverFallback && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <ShimmerImage
              src={getImageUrl(coverImageUrl)}
              alt=""
              wrapperClassName="absolute inset-0"
              className="h-full w-full object-cover opacity-35"
            />
            <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-md bg-[var(--surface-2)]/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-[var(--ink-soft)]">
              Product photo
            </span>
          </div>
        )}
        {/* With a photo set, the uploader's own × sits in this corner — remove it first to link another. */}
        {!variant?.imageUrl && (
          <VariantPhotoLinkButton onSubmit={onImageLink} disabled={disabled} />
        )}
      </div>

      {/* self-start: measured at its own height, never stretched to the photo's. */}
      <div ref={fieldsRef} className="flex min-w-0 flex-col gap-2.5 self-start">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <FormField
            control={form.control}
            name={`variants.${index}.name`}
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel className={FIELD_LABEL_CLASS}>
                  Name (optional)
                </FormLabel>
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
            name={`variants.${index}.sizes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className={FIELD_LABEL_CLASS}>Sizes</FormLabel>
                <FormControl>
                  <VariantSizesPicker
                    category={sizeCategory}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    customSizeOptions={customSizeOptions}
                    onCustomSizeAdded={onCustomSizeAdded}
                    disabled={disabled}
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
                    placeholder={skuSuggestion ?? "Optional"}
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

/** The variant photo's other way in: a link, in a popover so the small thumbnail stays the upload target. */
function VariantPhotoLinkButton({
  onSubmit,
  disabled,
}: {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title="Add photo link"
          aria-label="Add photo link"
          className="absolute top-1.5 right-1.5 z-10 inline-flex size-6 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)] shadow-sm transition-colors hover:text-[var(--accent)] disabled:pointer-events-none disabled:opacity-50"
        >
          <Link2 size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <ImageLinkField
          onSubmit={(url) => {
            onSubmit(url);
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
