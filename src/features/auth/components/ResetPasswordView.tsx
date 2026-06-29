'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { resetPasswordSchema, type ResetPasswordData } from '../types';
import { useResetPassword } from '../hooks/useAuth';

export function ResetPasswordView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useResetPassword(token);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="w-full max-w-[400px] mx-auto">
        <div className="card p-6 flex items-center gap-3 border-[#FCA5A5] bg-[rgba(254,242,242,0.6)]">
          <AlertCircle size={18} className="text-[#DC2626] flex-shrink-0" />
          <div>
            <div className="text-[13.5px] font-medium text-[var(--ink)]">Invalid reset link</div>
            <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">This link is missing a token. Request a new one.</div>
          </div>
        </div>
        <p className="text-center mt-4 text-[12.5px]">
          <Link href="/auth/forgot-password" className="text-[var(--accent)] hover:underline font-medium">Request new link</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">Reset password</h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">Choose a strong new password</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutate(d))} className="flex flex-col gap-3.5">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input className="pr-9" type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" autoFocus {...field} />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Confirm new password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input className="pr-9" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" {...field} />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" size="lg" className="w-full mt-1" disabled={isPending}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
