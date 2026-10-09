"use client";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import type { OrderFormApi } from "../hooks/useOrderForm";
import type { OrderShippingFormValues } from "../validations.order";

interface DeliveryFieldsProps {
  form: OrderFormApi;
  isDeliveryRequired: boolean;
  disabled: boolean;
}

interface ShippingTextFieldProps {
  form: OrderFormApi;
  fieldName: Exclude<keyof OrderShippingFormValues, "notes">;
  label: string;
  placeholder?: string;
  isRequired?: boolean;
  type?: "text" | "tel" | "email";
  autoComplete?: string;
  disabled: boolean;
  className?: string;
}

function ShippingTextField({
  form,
  fieldName,
  label,
  placeholder,
  isRequired = false,
  type = "text",
  autoComplete,
  disabled,
  className,
}: ShippingTextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={`shipping.${fieldName}`}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {isRequired && " *"}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              aria-invalid={!!fieldState.error}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function OrderContactFields({
  form,
  isDeliveryRequired,
  disabled,
}: DeliveryFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ShippingTextField
        form={form}
        fieldName="customerName"
        label="Full name"
        placeholder="Ayesha Khan"
        autoComplete="name"
        isRequired={isDeliveryRequired}
        disabled={disabled}
        className="sm:col-span-2"
      />
      <ShippingTextField
        form={form}
        fieldName="customerPhone"
        label="Phone"
        type="tel"
        placeholder="+92 300 1234567"
        autoComplete="tel"
        isRequired={isDeliveryRequired}
        disabled={disabled}
      />
      <ShippingTextField
        form={form}
        fieldName="email"
        label="Email"
        type="email"
        placeholder="ayesha@example.com"
        autoComplete="email"
        disabled={disabled}
      />
    </div>
  );
}

export function OrderAddressFields({
  form,
  isDeliveryRequired,
  disabled,
}: DeliveryFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ShippingTextField
        form={form}
        fieldName="addressLine1"
        label="Address"
        placeholder="House 12, Street 4, Block B"
        autoComplete="address-line1"
        isRequired={isDeliveryRequired}
        disabled={disabled}
        className="sm:col-span-2"
      />
      <ShippingTextField
        form={form}
        fieldName="addressLine2"
        label="Area or landmark"
        placeholder="Near Main Market, DHA Phase 5"
        autoComplete="address-line2"
        disabled={disabled}
        className="sm:col-span-2"
      />
      <ShippingTextField
        form={form}
        fieldName="city"
        label="City"
        placeholder="Lahore"
        autoComplete="address-level2"
        disabled={disabled}
      />
      <ShippingTextField
        form={form}
        fieldName="state"
        label="Province / state"
        placeholder="Punjab"
        autoComplete="address-level1"
        disabled={disabled}
      />
      <ShippingTextField
        form={form}
        fieldName="postalCode"
        label="Postal code"
        placeholder="54000"
        autoComplete="postal-code"
        disabled={disabled}
      />
      <ShippingTextField
        form={form}
        fieldName="country"
        label="Country"
        placeholder="PK"
        autoComplete="country"
        isRequired
        disabled={disabled}
      />
      <FormField
        control={form.control}
        name="shipping.notes"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Delivery instructions</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={2}
                placeholder="Call before arriving, leave with the guard…"
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
