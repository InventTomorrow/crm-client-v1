'use client';
import { EditableListField } from '@/shared/ui/EditableListField';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import type { PractitionerFormSectionProps } from '../../types';

const LISTS = [
  {
    name: 'specialties',
    label: 'Specialties',
    placeholder: 'Post-surgical rehab',
    addLabel: 'Add specialty',
    emptyHint:
      'What this practitioner is known for — the assistant matches patients on these.',
  },
  {
    name: 'qualifications',
    label: 'Qualifications',
    placeholder: 'MBBS',
    addLabel: 'Add qualification',
    emptyHint: 'Shown on the profile patients see.',
  },
  {
    name: 'languages',
    label: 'Languages',
    placeholder: 'Urdu',
    addLabel: 'Add language',
    emptyHint: 'Helps the assistant suggest someone the patient can talk to.',
  },
] as const;

export function PractitionerExpertiseFields({
  form,
  isSaving,
}: PractitionerFormSectionProps) {
  return (
    <>
      {LISTS.map((list) => (
        <FormField
          key={list.name}
          control={form.control}
          name={list.name}
          render={({ field }) => (
            <FormItem>
              <EditableListField
                label={list.label}
                placeholder={list.placeholder}
                addLabel={list.addLabel}
                emptyHint={list.emptyHint}
                values={field.value ?? []}
                onChange={field.onChange}
                disabled={isSaving}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="yearsExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of experience</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="12"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ''}
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
