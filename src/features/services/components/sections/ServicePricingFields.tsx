'use client';
import { EnumAutocomplete } from '@/shared/ui/EnumAutocomplete';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { useWatch } from 'react-hook-form';
import {
  CURRENCIES,
  CURRENCY_LABELS,
  DELIVERY_TYPES,
  DELIVERY_TYPE_LABELS,
  PRICING_TYPES,
  PRICING_TYPE_LABELS,
  type ServiceFormSectionProps,
} from '../../types';

export function ServicePricingFields({ form, isSaving }: ServiceFormSectionProps) {
  const pricingType = useWatch({ control: form.control, name: 'pricingType' });
  const isQuoteOnly = pricingType === 'CUSTOM_QUOTE';

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="deliveryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery type</FormLabel>
              <FormControl>
                <EnumAutocomplete
                  options={DELIVERY_TYPES}
                  labels={DELIVERY_TYPE_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select delivery type…"
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pricingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing type</FormLabel>
              <FormControl>
                <EnumAutocomplete
                  options={PRICING_TYPES}
                  labels={PRICING_TYPE_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select pricing type…"
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="startingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="25000"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? null : Number(event.target.value))
                  }
                />
              </FormControl>
              <FormDescription>
                {isQuoteOnly
                  ? 'Optional — quote-only services are priced in conversation.'
                  : 'Leads ask this first. Leave it empty only by switching to Custom Quote.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <EnumAutocomplete
                  options={CURRENCIES}
                  labels={CURRENCY_LABELS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select currency…"
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
