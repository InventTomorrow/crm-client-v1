'use client';
import { EditableListField } from '@/shared/ui/EditableListField';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { MIN_KEY_OUTCOMES, type ServiceFormSectionProps } from '../../types';

export function ServicePositioningFields({ form, isSaving }: ServiceFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="keyOutcomes"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <EditableListField
                label="Key outcomes"
                values={field.value ?? []}
                onChange={field.onChange}
                placeholder="e.g. 3x engagement in 90 days"
                addLabel="Add outcome"
                emptyHint={`Add at least ${MIN_KEY_OUTCOMES} — these are what the bot argues with.`}
                disabled={isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="platformsCovered"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <EditableListField
                label="Platforms covered"
                values={field.value ?? []}
                onChange={field.onChange}
                placeholder="e.g. Instagram"
                addLabel="Add platform"
                emptyHint="No platforms listed — add them if this service is channel-specific."
                disabled={isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sampleWorkUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sample work link</FormLabel>
            <FormControl>
              <Input
                inputMode="url"
                placeholder="https://drive.google.com/…"
                disabled={isSaving}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>
              Portfolio or case study the bot can share on request.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
