'use client';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { acceptInviteSchema, type AcceptInviteData } from '../types';
import { useAcceptInvite } from '../hooks/useAuth';

export function AcceptInviteView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useAcceptInvite(token);

  const form = useForm<AcceptInviteData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { firstName: '', lastName: '', password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="w-full max-w-[400px] mx-auto">
        <div className="card p-6 flex items-center gap-3 border-[#FCA5A5] bg-[rgba(254,242,242,0.6)]">
          <AlertCircle size={18} className="text-[#DC2626] flex-shrink-0" />
          <div>
            <div className="text-[13.5px] font-medium text-[var(--ink)]">Invalid invite link</div>
            <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">This link is missing an invite token. Ask your admin to resend.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">Accept invitation</h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">Set up your account to join the workspace</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutate(d))} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">First name *</FormLabel>
                  <FormControl>
                    <input className="input" placeholder="Ali" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Last name</FormLabel>
                  <FormControl>
                    <input className="input" placeholder="Hassan" {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <input className="input pr-9" type={showPw ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" {...field} />
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
                <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">Confirm password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <input className="input pr-9" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" {...field} />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <button type="submit" className="btn btn-grad w-full justify-center mt-1" disabled={isPending}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? 'Joining…' : 'Join workspace'}
            </button>
          </form>
        </Form>

        <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
