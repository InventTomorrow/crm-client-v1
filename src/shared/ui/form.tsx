'use client';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { cn } from '@/lib/utils';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) throw new Error('useFormField must be used within <FormField>');
  return { name: fieldContext.name, ...fieldState };
}

const FormItemContext = React.createContext<{ id: string }>({ id: '' });

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('flex flex-col gap-1.5', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { id } = React.useContext(FormItemContext);
  const { error } = useFormField();
  return (
    <label
      htmlFor={id}
      className={cn(
        'text-sm font-medium leading-none',
        error ? 'text-[#DC2626]' : 'text-[var(--ink)]',
        className,
      )}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { id } = React.useContext(FormItemContext);
  const { error } = useFormField();
  return (
    <div
      id={id}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[11.5px] text-[var(--ink-mute)]', className)} {...props} />
  );
}

/** Array and object fields keep their message on a nested entry, never on the root. */
function resolveErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const { message } = error as { message?: unknown };
  if (typeof message === 'string' && message.length > 0) return message;
  for (const [key, nested] of Object.entries(error)) {
    if (key === 'ref' || key === 'types') continue;
    const nestedMessage = resolveErrorMessage(nested);
    if (nestedMessage) return nestedMessage;
  }
  return undefined;
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField();
  const body = resolveErrorMessage(error) ?? children;
  if (!body) return null;
  return (
    <p
      className={cn('text-[11.5px] text-[#DC2626] mt-0.5', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
