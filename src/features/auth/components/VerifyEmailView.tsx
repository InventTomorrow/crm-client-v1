'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useResendVerification } from '../hooks/useAuth';

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { mutate, isPending } = useResendVerification();
  const [sent, setSent] = useState(false);

  const handleResend = () => {
    if (!email) return;
    mutate(email, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="w-full max-w-[440px] mx-auto text-center">
      <div className="card p-8 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[rgba(79,195,247,0.12)] flex items-center justify-center">
          <Mail size={26} className="text-[var(--accent)]" />
        </div>

        <div>
          <h1 className="text-[20px] font-semibold text-[var(--ink)]">Check your inbox</h1>
          <p className="text-[13px] mt-2 text-[var(--ink-mute)] leading-relaxed">
            We sent a verification link to
            {email && <b className="text-[var(--ink-soft)] block mt-0.5">{email}</b>}
            Click the link in that email to activate your account.
          </p>
        </div>

        <p className="text-[12px] text-[var(--ink-mute)]">
          Can't find it? Check your spam folder.
        </p>

        {email && (
          <button
            type="button"
            className="btn btn-outline w-full justify-center"
            onClick={handleResend}
            disabled={isPending || sent}
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
            {sent ? 'Email sent!' : isPending ? 'Sending…' : 'Resend verification email'}
          </button>
        )}
      </div>

      <p className="text-center text-[12.5px] mt-4 text-[var(--ink-mute)]">
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium">
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
