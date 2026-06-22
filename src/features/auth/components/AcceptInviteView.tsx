'use client';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { acceptInviteSchema, type AcceptInviteData } from '../types';
import { useAcceptInvite, useValidateInvite } from '../hooks/useAuth';

const INVALID_COPY: Record<string, { title: string; body: string }> = {
  NOT_FOUND: {
    title: 'Invalid invite link',
    body: 'This invitation could not be found. Ask your admin to resend it.',
  },
  EXPIRED: {
    title: 'Invitation expired',
    body: 'This invite link has expired. Ask your admin to send a new one.',
  },
  ACCEPTED: {
    title: 'Invitation already used',
    body: 'This invite has already been accepted. Try signing in instead.',
  },
};

function InviteError({ title, body }: { title: string; body: string }) {
  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="card p-6 flex items-start gap-3 border-[#FCA5A5] bg-[rgba(254,242,242,0.6)]">
        <AlertCircle size={18} className="text-[#DC2626] flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[13.5px] font-medium text-[var(--ink)]">{title}</div>
          <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">{body}</div>
          <Link href="/auth/login" className="text-[12px] text-[var(--accent)] hover:underline font-medium mt-2 inline-block">
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AcceptInviteView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useAcceptInvite(token);
  const { data: validation, isLoading: isValidating } = useValidateInvite(token);

  const form = useForm<AcceptInviteData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { firstName: '', lastName: '', password: '', confirmPassword: '' },
  });

  if (!token) {
    return <InviteError title="Invalid invite link" body="This link is missing an invite token. Ask your admin to resend." />;
  }

  // Verify the token server-side before showing the form.
  if (isValidating) {
    return (
      <div className="w-full max-w-[420px] mx-auto">
        <div className="card p-8 flex items-center justify-center gap-2.5 text-[var(--ink-mute)]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[13px]">Verifying your invitation…</span>
        </div>
      </div>
    );
  }

  if (validation && validation.status !== 'VALID') {
    const copy = INVALID_COPY[validation.status] ?? INVALID_COPY.NOT_FOUND;
    return <InviteError title={copy.title} body={copy.body} />;
  }

  // Existing account → no sign-up form, just a one-click accept.
  const accountExists = !!validation?.accountExists;

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">Accept invitation</h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
            {accountExists ? 'Join this workspace with your existing account' : 'Set up your account to join the workspace'}
          </p>
        </div>

        {validation?.status === 'VALID' && (
          <div className="flex items-start gap-2.5 rounded-[10px] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.22)] px-3.5 py-3">
            <ShieldCheck size={16} className="text-[#059669] flex-shrink-0 mt-0.5" />
            <div className="text-[12.5px] text-[var(--ink-soft)] leading-snug">
              You&apos;ve been invited to{' '}
              <strong className="text-[var(--ink)]">{validation.tenantName ?? 'a workspace'}</strong>
              {validation.roleName && <> as <strong className="text-[var(--ink)]">{validation.roleName}</strong></>}.
              <div className="text-[11.5px] text-[var(--ink-mute)] mt-0.5">{validation.email}</div>
            </div>
          </div>
        )}

        {accountExists ? (
          <>
            <button type="button" className="btn btn-grad w-full justify-center" disabled={isPending} onClick={() => mutate(undefined)}>
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? 'Joining…' : 'Accept & join workspace'}
            </button>
            <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
              You may need to{' '}
              <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">sign in</Link>{' '}
              with {validation?.email} first.
            </p>
          </>
        ) : (
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
        )}

        {!accountExists && (
          <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
