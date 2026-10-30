"use client";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { NativeSelect } from "@/shared/ui/NativeSelect";
import { Check } from "lucide-react";
import { useShiftOptionForm } from "../hooks/useShiftOptionForm";
import {
  BILLING_PERIOD_LABELS,
  SHIFT_BILLING_PERIODS,
  type ShiftOptionInput,
} from "../types";

interface ShiftOptionDialogProps {
  isOpen: boolean;
  /** null while adding a new arrangement. */
  initialShift: ShiftOptionInput | null;
  currency: string;
  onClose: () => void;
  onSave: (shift: ShiftOptionInput) => void;
}

export function ShiftOptionDialog({
  isOpen,
  initialShift,
  currency,
  onClose,
  onSave,
}: ShiftOptionDialogProps) {
  const { form, submit } = useShiftOptionForm({
    isOpen,
    initialShift,
    onSave,
  });
  const isEditing = initialShift !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-[16px] font-semibold">
            {isEditing ? "Edit arrangement" : "Add arrangement"}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            One shift the clinic offers: live-in, 12-hour day, a short visit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={submit} className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-5">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12-hour day shift"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="hoursPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours/day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="12"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billed</FormLabel>
                      <FormControl>
                        <NativeSelect size="lg" {...field}>
                          {SHIFT_BILLING_PERIODS.map((period) => (
                            <option key={period} value={period}>
                              {BILLING_PERIOD_LABELS[period]}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ({currency})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="120000"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <FormLabel>Or a range</FormLabel>
                  <div className="flex items-start gap-1.5">
                    <FormField
                      control={form.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Min"
                              aria-label="Minimum price"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground mt-2"> to </span>
                    <FormField
                      control={form.control}
                      name="priceMax"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Max"
                              aria-label="Maximum price"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="availableCities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offered only in these cities</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lahore, Islamabad. Leave blank for everywhere"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The assistant will not quote this arrangement to a patient
                      outside these cities.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 border-t px-5 py-3.5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Check size={13} />
                {isEditing ? "Save arrangement" : "Add arrangement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
