import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { FileUpload } from "@/shared/ui/FileUpload";
import { Input } from "@/shared/ui/Input";
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
import { Check, Trash2, X } from "lucide-react";
import { useProductForm } from "../hooks/useProductForm";
import { usePresignedUpload } from "../hooks/useProducts";
import type { Product, ProductFormData } from "../types";
import { GENDERS } from "../types";
import { CreatableCategorySelect } from "./CreatableCategorySelect";
import { SizeSelector } from "./SizeSelector";

export function ProductFormDialog({
  open,
  initial,
  title,
  categoryOptions,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initial?: Product | null;
  title?: string;
  categoryOptions: string[];
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData & { imageUrls: string[] }) => void;
  onDelete?: () => void;
}) {
  const { upload: uploadImage, isPending: isUploading } = usePresignedUpload();
  const { form, imageUrl, setImageUrl, selectedCategory, discountedPrice } =
    useProductForm(open, initial);

  const handleSubmit = (data: ProductFormData) => {
    onSave({ ...data, imageUrls: imageUrl ? [imageUrl] : [] });
  };

  const busy = isSaving || isDeleting || isUploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-[540px] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 flex-row items-start justify-between gap-2 px-[18px] py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">
              {title || "Add Product"}
            </DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
              Tier 1 · Manual Catalog
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={busy}
          >
            <X size={18} />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-1 min-h-0 flex-col overflow-hidden"
          >
            <div className="scroll overflow-y-auto flex-1 min-h-0 flex flex-col gap-3 p-[18px]">
              <FileUpload
                value={imageUrl}
                onChange={setImageUrl}
                onUpload={uploadImage}
                isUploading={isUploading}
                accept="image/*"
                aspectRatio="aspect-square"
                title="Upload product photo"
                description="Drag and drop a photo here, or click to browse"
                hint="Recommended: square, 1000×1000px • Max size: 5MB"
                tipsTitle="Photo guidelines"
                tips={[
                  "Use a plain background so the product stands out",
                  "Shoot in good, even lighting — avoid harsh shadows",
                  "Show the actual product customers will receive",
                  "Supported formats: JPG, PNG, WebP",
                ]}
              />
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
            <div className="flex-shrink-0 flex justify-between gap-2 px-[18px] py-3 border-t border-[var(--line)] bg-[var(--surface)]">
              {onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={busy}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Removing...
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
                  onClick={onClose}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {isSaving ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
