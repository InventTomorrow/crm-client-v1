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
import { Textarea } from '@/shared/ui/Textarea';
import type { PractitionerFormSectionProps } from '../../types';
import { DEFAULT_CURRENCY } from '../../utils/practitionerFormMapping';

export function PractitionerProfileFields({
  form,
  isSaving,
}: PractitionerFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Consultant physiotherapist with 12 years in post-surgical and sports rehabilitation. Treats knee, shoulder and spine cases."
                disabled={isSaving}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              The assistant describes this practitioner from here — it never
              writes a profile of its own.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="consultationFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consultation fee ({DEFAULT_CURRENCY})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="3000"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Leave blank and the assistant quotes nothing for this person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
