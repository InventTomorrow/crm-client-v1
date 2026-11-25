"use client";
import { Button } from "@/shared/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/Dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Slider } from "@/shared/ui/Slider";
import { Loader2 } from "lucide-react";
import { useCreateOwnCodeForm } from "../../hooks/useCreateOwnCode";

interface CreateOwnCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxDiscountPercent: number;
}

export function CreateOwnCodeDialog({ open, onOpenChange, maxDiscountPercent }: CreateOwnCodeDialogProps) {
  const { form, onSubmit, isSubmitting } = useCreateOwnCodeForm(maxDiscountPercent, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create a referral code</DialogTitle>
          <DialogDescription>
            Customers enter it during sign-up and get the discount on their first payment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ALI10" className="font-mono uppercase" autoFocus {...field} />
                  </FormControl>
                  <p className="text-[11.5px] text-[var(--ink-mute)]">
                    Leave blank to make one from your name. Codes can&apos;t be renamed later.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountPercent"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-baseline justify-between">
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                      Discount for the customer
                    </FormLabel>
                    <span className="text-[18px] font-semibold text-[var(--accent)]">{field.value}% off</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={maxDiscountPercent}
                      step={1}
                      value={[field.value]}
                      onValueChange={([discountPercent]) => field.onChange(discountPercent)}
                      disabled={maxDiscountPercent <= 1}
                    />
                  </FormControl>
                  <p className="text-[11.5px] text-[var(--ink-mute)]">You can give up to {maxDiscountPercent}% off.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Create code
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
