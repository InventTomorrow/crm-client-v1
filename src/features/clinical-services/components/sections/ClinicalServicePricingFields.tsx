"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { NativeSelect } from "@/shared/ui/NativeSelect";
import { useWatch } from "react-hook-form";
import {
  CLINICAL_PRICING_MODELS,
  PRICING_MODEL_LABELS,
  type ClinicalServiceFormSectionProps,
} from "../../types";
import { DEFAULT_CURRENCY } from "../../utils/clinicalServiceFormMapping";
import { ShiftOptionsField } from "../ShiftOptionsField";

/** Human-readable label for the primary price field, per model. */
const PRICE_FIELD_LABEL: Record<string, string> = {
  FIXED: "Price",
  PER_SESSION: "Follow-up price",
  PER_SHIFT: "Price per shift",
  PER_DAY: "Price per day",
  PER_MONTH: "Price per month",
};

export function ClinicalServicePricingFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  const pricingModel = useWatch({
    control: form.control,
    name: "pricingModel",
  });

  // Which price inputs make sense depends entirely on the model chosen.
  const showsRange = pricingModel === "RANGE";
  const showsFirstSession = pricingModel === "PER_SESSION";
  const quotable = pricingModel !== "ON_ENQUIRY";

  const priceLabel = PRICE_FIELD_LABEL[pricingModel] ?? "Price";

  return (
    <>
      {/* Currency is not asked for — the product is PKR-only, and the form
          carries DEFAULT_CURRENCY through to the server on its own. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="pricingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing</FormLabel>
              <FormControl>
                <NativeSelect size="lg" disabled={isSaving} {...field}>
                  {CLINICAL_PRICING_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {PRICING_MODEL_LABELS[model]}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {!quotable && (
        <p className="text-muted-foreground text-sm">
          The assistant will never state a figure for this service — it tells
          the family a coordinator will confirm pricing, and hands the
          conversation over.
        </p>
      )}

      {quotable && (
        <div className="grid gap-5 sm:grid-cols-2">
          {!showsRange && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {priceLabel} ({DEFAULT_CURRENCY})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="3500"
                      disabled={isSaving}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showsRange && (
            <>
              <FormField
                control={form.control}
                name="priceMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From ({DEFAULT_CURRENCY})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="2500"
                        disabled={isSaving}
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
                name="priceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To ({DEFAULT_CURRENCY})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="8000"
                        disabled={isSaving}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {showsFirstSession && (
            <FormField
              control={form.control}
              name="firstSessionPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First session ({DEFAULT_CURRENCY})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="5000"
                      disabled={isSaving}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      <FormField
        control={form.control}
        name="pricingNote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pricing note</FormLabel>
            <FormControl>
              <Input
                placeholder="Final price depends on the consultant seen and any tests advised."
                disabled={isSaving}
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
        name="shiftOptions"
        render={({ field }) => (
          <FormItem>
            <ShiftOptionsField
              value={field.value ?? []}
              onChange={field.onChange}
              currency={DEFAULT_CURRENCY}
              disabled={isSaving}
            />
            <FormDescription>
              A shift restricted to certain cities is never quoted anywhere
              else.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
