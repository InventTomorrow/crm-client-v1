"use client";
import { Button } from "@/shared/ui/Button";
import { Label } from "@/shared/ui/Label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BILLING_PERIOD_LABELS, type ShiftOptionInput } from "../types";
import { ShiftOptionDialog } from "./ShiftOptionDialog";

interface ShiftOptionsFieldProps {
  value: ShiftOptionInput[];
  onChange: (shiftOptions: ShiftOptionInput[]) => void;
  currency: string;
  disabled?: boolean;
}

const formatAmount = (currency: string, amount: unknown): string =>
  `${currency} ${Number(amount).toLocaleString("en-US")}`;

const describePrice = (
  shift: ShiftOptionInput,
  currency: string,
): string | null => {
  if (shift.price != null) return formatAmount(currency, shift.price);
  if (shift.priceMin != null && shift.priceMax != null)
    return `${formatAmount(currency, shift.priceMin)} to ${Number(shift.priceMax).toLocaleString("en-US")}`;
  return null;
};

const describeShift = (shift: ShiftOptionInput, currency: string): string =>
  [
    describePrice(shift, currency) ?? "No price set",
    BILLING_PERIOD_LABELS[shift.billingPeriod ?? "PER_MONTH"],
    shift.hoursPerDay != null ? `${Number(shift.hoursPerDay)} h/day` : null,
    shift.availableCities?.length
      ? shift.availableCities.join(", ")
      : "All covered cities",
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * Priced duty arrangements. Clinics price the shift, not the service: the same
 * nursing service costs one thing live-in and another as a 12-hour day shift,
 * and 12-hour arrangements often exist only in the larger cities.
 */
export function ShiftOptionsField({
  value,
  onChange,
  currency,
  disabled,
}: ShiftOptionsFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedShiftIndex, setEditedShiftIndex] = useState<number | null>(null);
  const editedShift =
    editedShiftIndex === null ? null : (value[editedShiftIndex] ?? null);

  const openDialogFor = (shiftIndex: number | null) => {
    setEditedShiftIndex(shiftIndex);
    setIsDialogOpen(true);
  };

  const saveShift = (shift: ShiftOptionInput) => {
    onChange(
      editedShiftIndex === null
        ? [...value, shift]
        : value.map((existing, index) =>
            index === editedShiftIndex ? shift : existing,
          ),
    );
    setIsDialogOpen(false);
  };

  const removeShiftAt = (shiftIndex: number) =>
    onChange(value.filter((_, index) => index !== shiftIndex));

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={value.length === 0 ? undefined : "self-start"}
      disabled={disabled}
      onClick={() => openDialogFor(null)}
    >
      <Plus className="size-4" />
      Add arrangement
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-0.5">
        <Label>Duty arrangements</Label>
        <p className="text-muted-foreground text-sm">
          Optional. Add one per shift the clinic offers: live-in, 12-hour day,
          a short visit. Leave the cities blank to offer a shift everywhere the
          service is covered.
        </p>
      </div>

      {value.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--line)] px-3 py-5">
          <p className="text-center text-[11px] text-[var(--ink-mute)]">
            No arrangements added yet.
          </p>
          {addButton}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {value.map((shift, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{shift.label}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {describeShift(shift, currency)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Edit ${shift.label}`}
                  disabled={disabled}
                  onClick={() => openDialogFor(index)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remove ${shift.label}`}
                  className="text-destructive"
                  disabled={disabled}
                  onClick={() => removeShiftAt(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          {addButton}
        </>
      )}

      <ShiftOptionDialog
        isOpen={isDialogOpen}
        initialShift={editedShift}
        currency={currency}
        onClose={() => setIsDialogOpen(false)}
        onSave={saveShift}
      />
    </div>
  );
}
