"use client";
import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/RadioGroup";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { usePresignedUpload } from "../hooks/useProducts";
import type { BulkItem, ProductFormData } from "../types";
import { CATEGORIES, GENDERS, productSchema } from "../types";
import { ImageLinkField } from "./ImageLinkField";
import { SizeSelector } from "./SizeSelector";

/** Radio groups have no empty value, so "no gender set" needs a stand-in. */
const NO_GENDER = "__none";

/**
 * Fixes up one imported row before it is saved.
 *
 * Deliberately the same fields, controls and order as the add-product form —
 * an imported row is a product like any other, and a seller who has filled that
 * form in once should not have to learn a second one here.
 */
export function ImportItemEditor({
  item,
  onSave,
  onDelete,
}: Readonly<{
  item: BulkItem;
  onSave: (item: BulkItem) => void;
  onDelete: () => void;
}>) {
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const {
    upload,
    isPending: isUploading,
    progress,
    phase,
  } = usePresignedUpload();

  const form = useForm<z.input<typeof productSchema>, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: toFormValues(item),
  });

  const selectedCategory = useWatch({ control: form.control, name: "cat" });
  const watchedPrice = useWatch({ control: form.control, name: "price" });
  const watchedDiscount = useWatch({
    control: form.control,
    name: "discountPercentage",
  });

  const price = Number(watchedPrice);
  const discount = Number(watchedDiscount);
  const discountedPrice =
    price && discount > 0 && discount <= 100
      ? price - (price * discount) / 100
      : null;

  const handleSubmit = form.handleSubmit((data: ProductFormData) => {
    onSave({ ...data, imageUrl, imageUrls: imageUrl ? [imageUrl] : [] });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
        <div className="text-[12px] font-semibold tracking-wide text-[var(--ink-mute)] uppercase">
          Edit product
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[180px]">
            <FileUpload
              value={imageUrl || null}
              onChange={(url) => setImageUrl(url ?? "")}
              onUpload={upload}
              isUploading={isUploading}
              uploadPhase={phase}
              progress={progress}
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              aspectRatio="aspect-square"
              title="Add a photo"
              description="Drop it here, or click to browse"
            />
            <ImageLinkField onSubmit={setImageUrl} disabled={isUploading} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="LWN-3P-001" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <SearchSelect
                    options={CATEGORIES}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Select category"
                    searchPlaceholder="Search categories..."
                    creatable
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Maroon" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value || NO_GENDER}
                  onValueChange={(value) =>
                    field.onChange(value === NO_GENDER ? "" : value)
                  }
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1"
                >
                  {[NO_GENDER, ...GENDERS].map((gender) => (
                    <label
                      key={gender}
                      className="flex items-center gap-1.5 text-[13px]"
                    >
                      <RadioGroupItem value={gender} />
                      {gender === NO_GENDER ? "Any" : gender}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="8999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Discount %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                {discountedPrice !== null && (
                  <p className="text-muted-foreground text-xs">
                    Discounted price: {pkr(discountedPrice)}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="47" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Sizes</FormLabel>
              <FormControl>
                <SizeSelector
                  category={selectedCategory}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mt-auto flex items-center gap-2 border-t border-[var(--line)] pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <X size={12} /> Remove
          </Button>
          <Button type="submit" size="sm" className="flex-1 justify-center">
            <Check size={12} /> Apply
          </Button>
        </div>
      </form>
    </Form>
  );
}

function toFormValues(item: BulkItem): z.input<typeof productSchema> {
  return {
    name: item.name,
    sku: item.sku ?? "",
    price: item.price,
    discountPercentage: item.discountPercentage ?? undefined,
    stock: item.stock,
    cat: item.cat,
    sizes: item.sizes ?? [],
    gender: item.gender ?? "",
    color: item.color ?? "",
    desc: item.desc ?? "",
  };
}
