'use client';
import { FormControl, FormField, FormItem, FormMessage } from '@/shared/ui/form';
import { Label } from '@/shared/ui/Label';
import { Switch } from '@/shared/ui/Switch';
import type {
  PractitionerFormSectionProps,
  PractitionerVisibility,
} from '../../types';
import { PractitionerVisibilitySelect } from '../PractitionerVisibilitySelect';

interface PractitionerVisibilitySectionProps
  extends PractitionerFormSectionProps {
  workspaceVisibility: PractitionerVisibility;
}

export function PractitionerVisibilityFields({
  form,
  isSaving,
  workspaceVisibility,
}: PractitionerVisibilitySectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <PractitionerVisibilitySelect
              value={field.value ?? null}
              onChange={field.onChange}
              workspaceDefault={workspaceVisibility}
              disabled={isSaving}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          // `flex-row` is explicit: FormItem is flex-col, and tailwind-merge
          // only drops a conflicting display, not the direction.
          <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-muted-foreground text-sm">
                Inactive practitioners keep their history but are never offered.
              </p>
            </div>
            <FormControl>
              <Switch
                id="isActive"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={isSaving}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
