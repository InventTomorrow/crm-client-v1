import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Check, Trash2, X } from "lucide-react";
import { Form } from "@/shared/ui/form";
import { useProductForm } from "../hooks/useProductForm";
import { usePresignedUpload } from "../hooks/useProducts";
import type { Product, ProductFormData } from "../types";
import { ProductFormBody } from "./ProductFormBody";

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
  const { form, imageUrl, setImageUrl } = useProductForm(open, initial);

  const handleSubmit = (data: ProductFormData) => {
    onSave({ ...data, imageUrls: imageUrl ? [imageUrl] : [] });
  };

  // Inputs lock only while a save/delete is in flight — an uploading image must
  // not block filling out the rest of the form.
  const isMutationPending = isSaving || isDeleting;
  // Submit and close also wait for the image upload to settle.
  const isActionPending = isMutationPending || isUploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isActionPending) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-[540px] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-[18px] py-3.5 border-b border-[var(--line)]">
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
            disabled={isMutationPending}
          >
            <X size={18} />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-1 min-h-0 flex-col overflow-hidden"
          >
            <div className="scroll overflow-y-auto flex-1 min-h-0 p-[18px]">
              <ProductFormBody
                form={form}
                categoryOptions={categoryOptions}
                imageUrl={imageUrl}
                onImageChange={setImageUrl}
                onUpload={uploadImage}
                isUploading={isUploading}
                disabled={isMutationPending}
              />
            </div>
            <div className="shrink-0 flex justify-between gap-2 px-[18px] py-3 border-t border-[var(--line)] bg-[var(--surface)]">
              {onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isMutationPending}
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
                  disabled={isMutationPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isActionPending}>
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
