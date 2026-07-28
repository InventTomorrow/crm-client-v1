"use client";
import { usePresignedUpload } from "@/features/inventory/hooks/useProducts";
import { Button } from "@/shared/ui/Button";
import { FileUpload } from "@/shared/ui/FileUpload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { useMenuCategories } from "../hooks/useMenuCategories";
import { useMenuItemForm } from "../hooks/useMenuItemForm";
import { SERVING_SIZES, SERVING_SIZE_LABELS } from "../types";
import { FoodTypeAutocomplete } from "./FoodTypeAutocomplete";
import { MenuCategoryPicker } from "./MenuCategoryPicker";
import { MenuItemAddonsField } from "./MenuItemAddonsField";
import { MenuItemNameField } from "./MenuItemNameField";
import { MenuItemTagMultiPicker } from "./MenuItemTagMultiPicker";
import { MenuItemVariantsField } from "./MenuItemVariantsField";

export function MenuItemFormView({ menuItemId }: { menuItemId?: string }) {
  const router = useRouter();
  const {
    upload: uploadImage,
    isPending: isUploading,
    progress: uploadProgress,
    phase: uploadPhase,
  } = usePresignedUpload("menu");
  const {
    form,
    isEditMode,
    isLoadingItem,
    variantFields,
    addonFields,
    isSaving,
    handleSubmit,
  } = useMenuItemForm(menuItemId);

  // Only actual form submission disables the fields — an in-flight photo upload
  // shouldn't block typing elsewhere. The Save button separately guards against
  // submitting before the upload resolves.
  const busy = isSaving;
  const canSubmit = !isSaving && !isUploading;

  const { data: categories = [] } = useMenuCategories();
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const selectedCategoryName = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId)?.name,
    [categories, selectedCategoryId],
  );

  // Once variants exist, basePrice is no longer a free-standing number the admin
  // maintains by hand — it's kept in sync with the default variant's price, since
  // that's the price actually quoted once variants are in play.
  const variants = useWatch({ control: form.control, name: "variants" });
  const hasVariants = (variants?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasVariants) return;
    const defaultVariant = variants!.find((v) => v?.isDefault) ?? variants![0];
    if (!defaultVariant) return;
    if (String(defaultVariant.price) !== String(form.getValues("basePrice"))) {
      form.setValue("basePrice", defaultVariant.price, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (defaultVariant.servingSize !== form.getValues("servingSize")) {
      form.setValue("servingSize", defaultVariant.servingSize, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [variants, hasVariants, form]);

  // Serves is hidden by default — shown once the admin opts in via "+ Add serves",
  // or automatically once a value already exists (loaded from an existing item, or
  // synced down from a variant's serving size above).
  const [servesFieldOpened, setServesFieldOpened] = useState(false);
  const servingSizeValue = useWatch({ control: form.control, name: "servingSize" });
  const showServesField = hasVariants ? Boolean(servingSizeValue) : servesFieldOpened || Boolean(servingSizeValue);

  const handleRemoveServes = () => {
    setServesFieldOpened(false);
    form.setValue("servingSize", undefined, { shouldDirty: true });
  };

  // Cap the variants/addons column to the details column's rendered height so it
  // scrolls internally instead of stretching the page when there are many entries.
  const detailsCardRef = useRef<HTMLDivElement>(null);
  const [detailsCardHeight, setDetailsCardHeight] = useState<number>();

  useLayoutEffect(() => {
    const node = detailsCardRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setDetailsCardHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (isEditMode && isLoadingItem) {
    return (
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="scroll overflow-y-auto h-full">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/menu")}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {isEditMode ? "Edit menu item" : "Add menu item"}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">Menu</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              <div
                ref={detailsCardRef}
                className="card p-5 flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FileUpload
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? "")}
                      onUpload={uploadImage}
                      isUploading={isUploading}
                      uploadPhase={uploadPhase}
                      progress={uploadProgress}
                      disabled={busy}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024}
                      compact
                      compactHeight="h-[120px]"
                      description="Drop dish image or click to upload"
                      hint="PNG, JPG, WEBP — up to 5 MB"
                      tipsCollapsible
                      tipsTitle="Photo tips"
                      tips={[
                        "Use a well-lit, close-up shot of the finished dish",
                        "Square photos crop best on the menu and WhatsApp cards",
                        "Avoid text or logos overlaid on the image",
                      ]}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <MenuCategoryPicker
                            categoryId={field.value}
                            onChange={(categoryId) =>
                              field.onChange(categoryId)
                            }
                            disabled={busy}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {hasVariants ? "Base Price (auto)" : "Base Price *"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1200"
                            {...field}
                            disabled={busy || hasVariants}
                            readOnly={hasVariants}
                          />
                        </FormControl>
                        {hasVariants && (
                          <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                            Synced to the default variant&apos;s price
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="broadCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Type</FormLabel>
                      <FormControl>
                        <FoodTypeAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Dish Name *</FormLabel>
                        {!hasVariants && !showServesField && (
                          <button
                            type="button"
                            onClick={() => setServesFieldOpened(true)}
                            disabled={busy}
                            className="flex items-center gap-1 text-[11px] text-[var(--ink-mute)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Plus size={12} /> Add serves
                          </button>
                        )}
                      </div>
                      <FormControl>
                        <MenuItemNameField
                          value={field.value}
                          onChange={field.onChange}
                          categoryId={selectedCategoryId}
                          categoryName={selectedCategoryName}
                          excludeMenuItemId={menuItemId}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showServesField && (
                  <FormField
                    control={form.control}
                    name="servingSize"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>
                            {hasVariants ? "Serves (auto)" : "Serves"}
                          </FormLabel>
                          {!hasVariants && (
                            <button
                              type="button"
                              onClick={handleRemoveServes}
                              disabled={busy}
                              className="text-[var(--ink-mute)] hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={busy || hasVariants}
                        >
                          <FormControl>
                            <SelectTrigger size="lg" className="w-full">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SERVING_SIZES.map((size) => (
                              <SelectItem key={size} value={size}>
                                {SERVING_SIZE_LABELS[size]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasVariants && (
                          <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                            Synced to the default variant&apos;s serving size
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Spicy chicken karahi, Ingredients..."
                          {...field}
                          disabled={busy}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prep time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
                            {...field}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="650"
                            {...field}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <MenuItemTagMultiPicker
                          tagIds={field.value ?? []}
                          onChange={field.onChange}
                          disabled={busy}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-1 space-y-0">
                        <FormLabel className="mb-0">Featured item</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-1 space-y-0">
                        <FormLabel className="mb-0">
                          Available on the menu
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div
                className="card p-5 flex flex-col gap-5 overflow-y-auto"
                style={
                  detailsCardHeight
                    ? { maxHeight: detailsCardHeight }
                    : undefined
                }
              >
                <MenuItemVariantsField
                  form={form}
                  fieldArray={variantFields}
                  disabled={busy}
                />
                <MenuItemAddonsField
                  form={form}
                  fieldArray={addonFields}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/menu")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                title={
                  isUploading
                    ? "Waiting for photo upload to finish…"
                    : undefined
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save menu item"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
