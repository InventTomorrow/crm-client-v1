"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import {
  shiftOptionFormSchema,
  type ShiftOptionFormInput,
  type ShiftOptionFormValues,
  type ShiftOptionInput,
} from "../types";

const EMPTY_SHIFT_FORM_VALUES: ShiftOptionFormInput = {
  label: "",
  hoursPerDay: null,
  price: null,
  priceMin: null,
  priceMax: null,
  billingPeriod: "PER_MONTH",
  availableCities: "",
};

/** "12-hour day" → "12_hour_day", so the key is stable without the admin typing one. */
const slugify = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toFormValues = (shift: ShiftOptionInput | null): ShiftOptionFormInput =>
  shift
    ? {
        label: shift.label,
        hoursPerDay: (shift.hoursPerDay ?? null) as number | null,
        price: (shift.price ?? null) as number | null,
        priceMin: (shift.priceMin ?? null) as number | null,
        priceMax: (shift.priceMax ?? null) as number | null,
        billingPeriod: shift.billingPeriod ?? "PER_MONTH",
        availableCities: (shift.availableCities ?? []).join(", "),
      }
    : EMPTY_SHIFT_FORM_VALUES;

const toShiftOption = (
  values: ShiftOptionFormValues,
  existingShift: ShiftOptionInput | null,
): ShiftOptionInput => ({
  // The key follows the label until someone has given it a custom one.
  key:
    existingShift?.key && existingShift.key !== slugify(existingShift.label)
      ? existingShift.key
      : slugify(values.label),
  label: values.label,
  hoursPerDay: values.hoursPerDay,
  price: values.price,
  priceMin: values.priceMin,
  priceMax: values.priceMax,
  billingPeriod: values.billingPeriod,
  availableCities: values.availableCities
    .split(",")
    .map((city) => city.trim())
    .filter(Boolean),
  isDefault: existingShift?.isDefault ?? false,
});

interface UseShiftOptionFormOptions {
  isOpen: boolean;
  /** null while adding a new arrangement. */
  initialShift: ShiftOptionInput | null;
  onSave: (shift: ShiftOptionInput) => void;
}

/** Drives the add/edit arrangement dialog. */
export function useShiftOptionForm({
  isOpen,
  initialShift,
  onSave,
}: UseShiftOptionFormOptions) {
  const form = useForm<ShiftOptionFormInput, unknown, ShiftOptionFormValues>({
    resolver: zodResolver(shiftOptionFormSchema),
    defaultValues: toFormValues(initialShift),
  });

  useEffect(() => {
    if (isOpen) form.reset(toFormValues(initialShift));
  }, [isOpen, initialShift, form]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    // The dialog is portaled but still sits inside the page's <form> in the React tree, so its submit would bubble up and save the service.
    event.stopPropagation();
    return form.handleSubmit((values) =>
      onSave(toShiftOption(values, initialShift)),
    )(event);
  };

  return { form, submit };
}
