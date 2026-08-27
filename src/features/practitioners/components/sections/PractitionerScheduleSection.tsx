'use client';
import { FormField, FormItem, FormMessage } from '@/shared/ui/form';
import type { PractitionerFormSectionProps } from '../../types';
import { PractitionerScheduleFields } from '../PractitionerScheduleFields';

interface PractitionerScheduleSectionProps extends PractitionerFormSectionProps {
  clinicDefaults: {
    durationMinutes: number;
    bufferMinutes: number;
    maxPerDay: number;
  };
}

export function PractitionerScheduleSection({
  form,
  isSaving,
  clinicDefaults,
}: PractitionerScheduleSectionProps) {
  return (
    <FormField
      control={form.control}
      name="schedule"
      render={({ field }) => (
        <FormItem>
          <PractitionerScheduleFields
            value={field.value ?? null}
            onChange={field.onChange}
            clinicDefaults={clinicDefaults}
            disabled={isSaving}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
