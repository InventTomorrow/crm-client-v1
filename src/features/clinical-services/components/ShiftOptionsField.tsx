"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";
import { NativeSelect } from "@/shared/ui/NativeSelect";
import { Plus, Trash2 } from "lucide-react";
import {
  BILLING_PERIOD_LABELS,
  SHIFT_BILLING_PERIODS,
  type ShiftBillingPeriod,
  type ShiftOptionInput,
} from "../types";

interface ShiftOptionsFieldProps {
  value: ShiftOptionInput[];
  onChange: (shiftOptions: ShiftOptionInput[]) => void;
  currency: string;
  disabled?: boolean;
}

const NEW_SHIFT: ShiftOptionInput = {
  key: "",
  label: "",
  hoursPerDay: null,
  price: null,
  priceMin: null,
  priceMax: null,
  billingPeriod: "PER_MONTH",
  availableCities: [],
  isDefault: false,
};

/** "12-hour day" → "12_hour_day", so the key is stable without the admin typing one. */
const slugify = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

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
  const patch = (index: number, changes: Partial<ShiftOptionInput>) => {
    onChange(
      value.map((shift, i) => (i === index ? { ...shift, ...changes } : shift)),
    );
  };

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <Label>Duty arrangements</Label>
        <p className="text-muted-foreground text-sm">
          Optional. Add one per shift the clinic offers — live-in, 12-hour day,
          a short visit. Leave the cities blank to offer a shift everywhere the
          service is covered.
        </p>
      </div>

      {value.map((shift, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px]">
              <div className="space-y-1.5">
                <Label htmlFor={`shift-label-${index}`}>Label</Label>
                <Input
                  id={`shift-label-${index}`}
                  placeholder="12-hour day shift"
                  value={shift.label}
                  disabled={disabled}
                  onChange={(event) =>
                    patch(index, {
                      label: event.target.value,
                      // Key follows the label until someone edits it directly.
                      key:
                        shift.key && shift.key !== slugify(shift.label)
                          ? shift.key
                          : slugify(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`shift-hours-${index}`}>Hours/day</Label>
                <Input
                  id={`shift-hours-${index}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="12"
                  value={(shift.hoursPerDay as number | null) ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    patch(index, {
                      hoursPerDay:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive mt-6 shrink-0"
              disabled={disabled}
              onClick={() => remove(index)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_150px]">
            <div className="space-y-1.5">
              <Label htmlFor={`shift-price-${index}`}>Price ({currency})</Label>
              <Input
                id={`shift-price-${index}`}
                type="number"
                inputMode="numeric"
                placeholder="120000"
                value={(shift.price as number | null) ?? ""}
                disabled={disabled}
                onChange={(event) =>
                  patch(index, {
                    price:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`shift-range-${index}`}>Or a range</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id={`shift-range-${index}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={(shift.priceMin as number | null) ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    patch(index, {
                      priceMin:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    })
                  }
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={(shift.priceMax as number | null) ?? ""}
                  disabled={disabled}
                  onChange={(event) =>
                    patch(index, {
                      priceMax:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`shift-period-${index}`}>Billed</Label>
              <NativeSelect
                id={`shift-period-${index}`}
                value={shift.billingPeriod}
                disabled={disabled}
                onChange={(event) =>
                  patch(index, {
                    billingPeriod: event.target.value as ShiftBillingPeriod,
                  })
                }
              >
                {SHIFT_BILLING_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {BILLING_PERIOD_LABELS[period]}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`shift-cities-${index}`}>
              Offered only in these cities
            </Label>
            <Input
              id={`shift-cities-${index}`}
              placeholder="Lahore, Islamabad — leave blank for everywhere"
              value={(shift.availableCities ?? []).join(", ")}
              disabled={disabled}
              onChange={(event) =>
                patch(index, {
                  availableCities: event.target.value
                    .split(",")
                    .map((city) => city.trim())
                    .filter(Boolean),
                })
              }
            />
            <p className="text-muted-foreground text-xs">
              The assistant will not quote this arrangement to a patient outside
              these cities.
            </p>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...value, { ...NEW_SHIFT }])}
      >
        <Plus className="size-4" />
        Add arrangement
      </Button>
    </div>
  );
}
