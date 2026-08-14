'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, Mail, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/ui/InputOtp';
import {
  usePermanentlyDeleteAccount,
  useRequestAccountRecoveryOtp,
  useRestoreAccount,
} from '../hooks/useAccountRecovery';
import {
  accountRecoveryActionSchema,
  accountRecoveryOtpSchema,
  type AccountRecoveryActionData,
  type AccountRecoveryOtpData,
} from '../types';
import { AuthFormError } from './AuthFormError';

type RecoveryIntent = 'RESTORE' | 'DELETE_PERMANENTLY';

export function AccountRecoveryView() {
  const searchParams = useSearchParams();
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [intent, setIntent] = useState<RecoveryIntent | null>(null);

  const requestOtp = useRequestAccountRecoveryOtp();
  const restore = useRestoreAccount();
  const permanentlyDelete = usePermanentlyDeleteAccount();

  const emailForm = useForm<AccountRecoveryOtpData>({
    resolver: zodResolver(accountRecoveryOtpSchema),
    defaultValues: { email: searchParams.get('email') ?? '' },
  });

  const codeForm = useForm<AccountRecoveryActionData>({
    resolver: zodResolver(accountRecoveryActionSchema),
    defaultValues: { email: '', otp: '' },
  });

  const sendCode = (data: AccountRecoveryOtpData) => {
    requestOtp.mutate(data, {
      onSuccess: () => {
        setVerifiedEmail(data.email);
        codeForm.reset({ email: data.email, otp: '' });
      },
    });
  };

  const submitCode = (data: AccountRecoveryActionData) => {
    if (intent === 'RESTORE') restore.mutate(data);
    if (intent === 'DELETE_PERMANENTLY') permanentlyDelete.mutate(data);
  };

  if (restore.isSuccess) {
    return (
      <Panel>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <CheckCircle size={40} className="text-[#22C55E]" />
          <h1 className="text-[20px] font-semibold text-[var(--ink)]">Account restored</h1>
          <p className="text-[13px] text-[var(--ink-mute)]">
            Your account is active again
            {restore.data.restoredWorkspaces > 0
              ? ` and ${restore.data.restoredWorkspaces} workspace(s) are back online.`
              : '.'}
          </p>
          {restore.data.whatsappReconnectRequired && (
            <p className="text-[12.5px] text-[var(--ink-mute)]">
              WhatsApp was disconnected during the deletion — reconnect it by scanning the QR code again in
              settings.
            </p>
          )}
          <Button asChild className="mt-2">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </Panel>
    );
  }

  if (permanentlyDelete.isSuccess) {
    return (
      <Panel>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <Trash2 size={40} className="text-[var(--ink-mute)]" />
          <h1 className="text-[20px] font-semibold text-[var(--ink)]">Account closed</h1>
          <p className="text-[13px] text-[var(--ink-mute)]">
            Your account is permanently closed and can no longer be restored. This email address stays
            reserved and cannot be used to sign up again.
          </p>
        </div>
      </Panel>
    );
  }

  const isConfirming = restore.isPending || permanentlyDelete.isPending;

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        Back to sign in
      </Link>

      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">This account was deleted</h1>
          <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
            {verifiedEmail
              ? 'Choose what to do with it, then confirm with the code we emailed you.'
              : 'Enter the account email and we’ll send a one-time code so you can restore it — or close it for good.'}
          </p>
        </div>

        {!verifiedEmail ? (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(sendCode)} className="flex flex-col gap-3.5">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                      Account email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail
                          size={13}
                          className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                        />
                        <Input className="pl-8" type="email" placeholder="you@company.pk" autoFocus {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full mt-1" disabled={requestOtp.isPending}>
                {requestOtp.isPending && <Loader2 size={14} className="animate-spin" />}
                {requestOtp.isPending ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(submitCode)} className="flex flex-col gap-4">
              <AuthFormError error={restore.error ?? permanentlyDelete.error} />

              <div className="flex flex-col gap-2">
                <IntentOption
                  selected={intent === 'RESTORE'}
                  onSelect={() => setIntent('RESTORE')}
                  icon={<RotateCcw size={15} />}
                  title="Restore my account"
                  description="Bring back the account and every workspace it owns, exactly as they were."
                />
                <IntentOption
                  selected={intent === 'DELETE_PERMANENTLY'}
                  onSelect={() => setIntent('DELETE_PERMANENTLY')}
                  icon={<Trash2 size={15} />}
                  title="Delete permanently now"
                  description="Close the account immediately instead of waiting. This cannot be undone by you or our team."
                  destructive
                />
              </div>

              {intent === 'DELETE_PERMANENTLY' && (
                <div className="flex items-start gap-2 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-3 py-2.5 text-[12.5px] text-[var(--destructive)]">
                  <AlertTriangle size={15} className="mt-px flex-shrink-0" />
                  <span>
                    This ends the recovery window. The account can never be reopened and this email address can
                    never be used to sign up again.
                  </span>
                </div>
              )}

              <FormField
                control={codeForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                      6-digit code sent to {verifiedEmail}
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((slotIndex) => (
                            <InputOTPSlot key={slotIndex} index={slotIndex} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                variant={intent === 'DELETE_PERMANENTLY' ? 'destructive' : 'default'}
                className="w-full"
                disabled={!intent || isConfirming}
              >
                {isConfirming && <Loader2 size={14} className="animate-spin" />}
                {intent === 'DELETE_PERMANENTLY' ? 'Delete permanently' : 'Restore account'}
              </Button>

              <button
                type="button"
                onClick={() => sendCode({ email: verifiedEmail })}
                disabled={requestOtp.isPending}
                className="text-[12.5px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
              >
                Didn&apos;t get the code? Send another
              </button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="card p-8 flex flex-col gap-5 shadow-[var(--shadow-2)]">{children}</div>
    </div>
  );
}

function IntentOption({
  selected,
  onSelect,
  icon,
  title,
  description,
  destructive = false,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  destructive?: boolean;
}) {
  const accent = destructive ? 'var(--destructive)' : 'var(--ink)';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: selected ? accent : 'var(--line)',
        backgroundColor: selected ? `color-mix(in srgb, ${accent} 8%, transparent)` : 'transparent',
      }}
    >
      <span className="mt-px flex-shrink-0" style={{ color: accent }}>
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium" style={{ color: accent }}>
          {title}
        </span>
        <span className="text-[12px] text-[var(--ink-mute)]">{description}</span>
      </span>
    </button>
  );
}
