"use client";
import { ProductCustomOptions } from "@/features/product-custom-options/components/ProductCustomOptions";
import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/RadioGroup";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductForm } from "../hooks/useProductForm";
import { usePresignedUpload } from "../hooks/useProducts";
import { GENDERS } from "../types";
import { ImageLinkField } from "./ImageLinkField";
import { ProductFormSkeleton } from "./InventorySkeletons";
import { SizeSelector } from "./SizeSelector";

/** Radio groups have no empty value, so "no gender set" needs a stand-in. */
const NO_GENDER = "__none";

export function ProductFormView({ productId }: { productId?: string }) {
  const router = useRouter();
  const {
    upload: uploadImage,
    isPending: isUploading,
    progress: uploadProgress,
    phase: uploadPhase,
  } = usePresignedUpload();
  const {
    form,
    isEditMode,
    isLoadingProducts,
    notFound,
    editingProduct,
    imageUrls,
    setCoverImage,
    setLinkedCoverImage,
    discardUnsavedUploads,
    categoryOptions,
    selectedCategory,
    discountedPrice,
    isSaving,
    isDeleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleSubmit,
    confirmDelete,
    customOptionsEnabled,
  } = useProductForm(productId);

  // Only an actual save/delete disables the fields — an in-flight photo upload
  // shouldn't block typing elsewhere. The Save button separately waits for it.
  const busy = isSaving || isDeleting;
  const canSubmit = !busy && !isUploading;

  // Leaving without saving strands any photo uploaded here in S3.
  const leaveForm = () => {
    discardUnsavedUploads();
    router.push("/inventory");
  };

  // Same placeholder the route shows, so waiting on the product doesn't swap
  // one shape of loading for another.
  if (isEditMode && isLoadingProducts && !editingProduct) {
    return <ProductFormSkeleton />;
  }

  if (notFound) {
    return (
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory")}
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">
            Product not found
          </h1>
        </div>
        <p className="text-[13px] text-[var(--ink-mute)]">
          This product no longer exists or you don&apos;t have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="scroll overflow-y-auto h-full">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={leaveForm}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {isEditMode ? "Edit product" : "Add product"}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              Inventory · Manual Catalog
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Details and photo are one product: one card, two columns. */}
            <div className="card p-4 md:p-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <div className="flex min-w-0 flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Lawn Suit 3-Piece Unstitched"
                          autoFocus
                          {...field}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="LWN-3P-001"
                            {...field}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <SearchSelect
                            options={categoryOptions}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Select category"
                            searchPlaceholder="Search categories..."
                            emptyMessage="No categories yet."
                            creatable
                            disabled={busy}
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
                          <Input
                            placeholder="Maroon"
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
                          disabled={busy}
                          className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1"
                        >
                          {[NO_GENDER, ...GENDERS].map((gender) => (
                            <label
                              key={gender}
                              className="flex items-center gap-1.5 text-[13px]"
                            >
                              <RadioGroupItem value={gender} disabled={busy} />
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
                          <Input
                            type="number"
                            placeholder="8999"
                            {...field}
                            value={field.value ?? ""}
                            disabled={busy}
                          />
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
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                field.onChange(raw);
                                return;
                              }
                              const clamped = Math.min(
                                100,
                                Math.max(0, Number(raw)),
                              );
                              field.onChange(String(clamped));
                            }}
                            disabled={busy}
                          />
                        </FormControl>
                        {discountedPrice !== null && (
                          <p className="text-xs text-muted-foreground">
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
                          <Input
                            type="number"
                            placeholder="47"
                            {...field}
                            value={field.value ?? ""}
                            disabled={busy}
                          />
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
                        <Textarea
                          rows={3}
                          placeholder="Premium unstitched lawn fabric, 3-piece set..."
                          {...field}
                          disabled={busy}
                        />
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
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Photo: beside the fields on desktop, under them on mobile. */}
              <div className="flex min-w-0 flex-col gap-2">
                <span className="text-[12px] font-medium text-[var(--ink-soft)]">
                  Product photo
                </span>
                <FileUpload
                  value={imageUrls[0] ?? null}
                  onChange={setCoverImage}
                  onUpload={uploadImage}
                  isUploading={isUploading}
                  uploadPhase={uploadPhase}
                  progress={uploadProgress}
                  disabled={busy}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  aspectRatio="aspect-square"
                  // Capped so the square doesn't tower over the fields column.
                  className="max-w-[300px]"
                  title="Add a product photo"
                  description="Drop it here, or click to browse"
                  hint="PNG, JPG, WEBP — up to 5 MB"
                  tipsCollapsible
                  tipsTitle="Photo guidelines"
                  tips={[
                    "Use a plain background so the product stands out",
                    "Shoot in good, even lighting — avoid harsh shadows",
                    "Show the actual product customers will receive",
                    "Recommended: square, 1000×1000px",
                  ]}
                />
                <ImageLinkField
                  onSubmit={setLinkedCoverImage}
                  disabled={busy || isUploading}
                />
                <p className="max-w-[300px] text-[12px] text-[var(--ink-mute)]">
                  Used on lists, the product preview and WhatsApp cards.
                </p>
              </div>
            </div>

            {/* Made-to-order customization */}
            <div className="card p-5 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="customOptionsEnabled"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-start gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={busy}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-[var(--ink)]">
                          Custom options
                        </span>
                        <span className="block text-[12px] text-[var(--ink-mute)]">
                          Let customers ask for something specific on this
                          product — a size, a colour, a name to add. The
                          assistant collects what you tick below before it takes
                          the order.
                        </span>
                      </span>
                    </label>
                  </FormItem>
                )}
              />

              {customOptionsEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="customOptionKeys"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ProductCustomOptions
                            selectedKeys={field.value ?? []}
                            onSelectedKeysChange={field.onChange}
                            disabled={busy}
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
                            disabled={busy}
                          />
                        </FormControl>
                        <p className="text-[12px] text-[var(--ink-mute)]">
                          Limits specific to this product. Not shown to the
                          customer.
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="flex justify-between gap-2">
              {isEditMode ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={busy}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Removing…
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} /> Remove
                    </>
                  )}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={leaveForm}
                  disabled={busy}
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
                  ) : isEditMode ? (
                    "Save changes"
                  ) : (
                    "Add product"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete product?"
          description={
            editingProduct
              ? `"${editingProduct.name}" will be permanently removed from your catalog. This can't be undone.`
              : undefined
          }
          confirmLabel="Delete product"
          loading={isDeleting}
        />
      </div>
    </div>
  );
}
