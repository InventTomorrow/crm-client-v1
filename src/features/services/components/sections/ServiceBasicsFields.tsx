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
import type { ServiceFormSectionProps } from '../../types';
import { ServiceCategoryAutocomplete } from '../ServiceCategoryAutocomplete';

export function ServiceBasicsFields({ form, isSaving }: ServiceFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service name</FormLabel>
            <FormControl>
              <Input placeholder="Social Media Management" disabled={isSaving} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short description</FormLabel>
            <FormControl>
              <Input
                placeholder="We run your social channels end to end."
                disabled={isSaving}
                {...field}
              />
            </FormControl>
            <FormDescription>Shown to leads first — keep it under one line.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fullDescription"
        render={({ field }) => {
          const characterCount = field.value?.trim().length ?? 0;
          return (
            <FormItem>
              <FormLabel>
                Full description
                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                  Optional
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Detailed breakdown of scope, process and what the client receives…"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Indexed for the bot&apos;s knowledge search — more detail answers more questions
                without a human.{characterCount > 0 && ` ${characterCount} characters`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <ServiceCategoryAutocomplete
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
