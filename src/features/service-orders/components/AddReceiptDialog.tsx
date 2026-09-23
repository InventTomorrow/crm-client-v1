'use client';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/Dialog';
import { FileUpload } from '@/shared/ui/FileUpload';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Textarea } from '@/shared/ui/Textarea';
import { Loader2, Paperclip } from 'lucide-react';
import { useAddReceiptForm } from '../hooks/useAddReceiptForm';

interface AddReceiptDialogProps {
  /** Null keeps the dialog closed. */
  serviceOrderId: string | null;
  orderLabel: string;
  onClose: () => void;
}

/** Shared by the orders table and the order sheet, so a receipt is attached the same way from both. */
export function AddReceiptDialog({ serviceOrderId, orderLabel, onClose }: AddReceiptDialogProps) {
  const isOpen = !!serviceOrderId;
  const { form, handleSubmit, receiptUpload, isSaving } = useAddReceiptForm(serviceOrderId, isOpen, onClose);
  const isBusy = isSaving || receiptUpload.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && !isBusy && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">Add payment receipt — {orderLabel}</DialogTitle>
          <DialogDescription className="text-[12.5px] text-[var(--ink-mute)]">
            Attaching a receipt marks the order as paid.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              // The sheet can sit inside other forms; keep this submit to the dialog.
              event.stopPropagation();
              void handleSubmit(event);
            }}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt image</FormLabel>
                  <FormControl>
                    <FileUpload
                      compact
                      compactHeight="h-[120px]"
                      accept="image/*"
                      maxSize={10 * 1024 * 1024}
                      title="Upload receipt image"
                      description="Drag and drop, or click to browse — up to 10 MB"
                      value={field.value || null}
                      onChange={(uploadedUrl) => field.onChange(uploadedUrl ?? '')}
                      onUpload={receiptUpload.upload}
                      isUploading={receiptUpload.isPending}
                      progress={receiptUpload.progress}
                      uploadPhase={receiptUpload.phase}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[72px] resize-y text-[13px]"
                      placeholder="e.g. Paid PKR 50,000 via Meezan, ref 88213"
                      maxLength={500}
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
                Attach receipt
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
