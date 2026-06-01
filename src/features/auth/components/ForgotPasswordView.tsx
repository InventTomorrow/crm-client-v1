'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/shared/ui/form';
import { forgotPasswordSchema, type ForgotPasswordData } from '../types';
import { useForgotPassword } from '../hooks/useAuth';

export function ForgotPasswordView() {
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors mb-6">
        <ArrowLeft size={13} />
        Back to sign in
      </Link>

      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle size={40} className="text-[#22C55E]" />
            <h1 className="text-[20px] font-semibold text-[var(--ink)]">Check your email</h1>
            <p className="text-[13px] text-[var(--ink-mute)]">
              We sent a password reset link to your email. It expires in 1 hour.
            </p>
            <Link href="/auth/login" className="btn btn-outline mt-2">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-[22px] font-semibold text-[var(--ink)]">Forgot password?</h1>
              <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
                Enter your work email and we&apos;ll send a reset link.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutate(d))} className="flex flex-col gap-3.5">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Work email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail size={13} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none" />
                        <input className="input pl-8" type="email" placeholder="you@company.pk" autoFocus {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <button type="submit" className="btn btn-grad w-full justify-center mt-1" disabled={isPending}>
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {isPending ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
