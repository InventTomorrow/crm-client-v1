"use client";
import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
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
import { CreatableCategorySelect } from "./CreatableCategorySelect";
import { SizeSelector } from "./SizeSelector";

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
    categoryOptions,
    selectedCategory,
    discountedPrice,
    isSaving,
    isDeleting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleSubmit,
    confirmDelete,
  } = useProductForm(productId);

  // Only an actual save/delete disables the fields — an in-flight photo upload
  // shouldn't block typing elsewhere. The Save button separately waits for it.
  const busy = isSaving || isDeleting;
  const canSubmit = !busy && !isUploading;

  if (isEditMode && isLoadingProducts && !editingProduct) {
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory")}
          >
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Details */}
              <div className="card p-5 flex flex-col gap-4">
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
                <div className="grid grid-cols-2 gap-2.5">
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
                          <CreatableCategorySelect
                            options={categoryOptions}
                            value={field.value ?? ""}
                            onChange={(v) => field.onChange(v)}
                            disabled={busy}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={busy}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDERS?.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                <div className="grid grid-cols-3 gap-2.5">
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

              {/* Image */}
              <div className="card p-5 flex flex-col gap-2">
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
                  compact
                  compactHeight="h-[180px]"
                  description="Drop product photo or click to upload"
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
                <p className="text-[12px] text-[var(--ink-mute)]">
                  This photo is used on lists, the product preview and WhatsApp
                  cards.
                </p>
              </div>
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
                  onClick={() => router.push("/inventory")}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  title={
                    isUploading ? "Waiting for photo upload to finish…" : undefined
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
