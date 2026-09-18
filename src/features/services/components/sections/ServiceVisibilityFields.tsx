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
import { useWatch } from 'react-hook-form';
import { isPricedPlan, type ServiceFormSectionProps } from '../../types';

export function ServiceVisibilityFields({ form, isSaving }: ServiceFormSectionProps) {
  const plans = useWatch({ control: form.control, name: 'plans' }) ?? [];
  const hasPricedPlan = plans.some(isPricedPlan);

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
        name="closeMode"
        render={({ field }) => {
          const closesInChat = field.value === 'CHAT';
          return (
            <FormItem>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                <div>
                  <FormLabel>Close in chat</FormLabel>
                  <p className="mt-0.5 text-xs text-[var(--ink-mute)]">
                    {closesInChat
                      ? 'The bot takes the order in chat once the customer picks a plan, then alerts you. You collect payment.'
                      : 'The bot books a call with your team instead of taking an order.'}
                  </p>
                  {!closesInChat && !hasPricedPlan && (
                    <p className="mt-1 text-xs text-[var(--ink-mute)]">
                      Add a plan with a price under Plans to turn this on.
                    </p>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={closesInChat}
                    // Stays enabled while on, so it can always be switched off again.
                    disabled={isSaving || (!closesInChat && !hasPricedPlan)}
                    onCheckedChange={(checked) => field.onChange(checked ? 'CHAT' : 'CALL')}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
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
