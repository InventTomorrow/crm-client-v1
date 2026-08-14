'use client';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import type { ServiceFormSectionProps } from '../../types';

export function ServiceVisibilityFields({ form, isSaving }: ServiceFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
              <div>
                <FormLabel>Active</FormLabel>
                <p className="mt-0.5 text-xs text-[var(--ink-mute)]">
                  Inactive services stay saved but are never quoted to leads.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  disabled={isSaving}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="displayOrder"
        render={({ field }) => (
          <FormItem className="max-w-[200px]">
            <FormLabel>Display order</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                disabled={isSaving}
                {...field}
                value={field.value ?? 0}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormDescription>Lower numbers appear first.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
