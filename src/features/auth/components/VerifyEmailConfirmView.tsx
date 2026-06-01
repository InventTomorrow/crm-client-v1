'use client';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useVerifyEmail } from '../hooks/useAuth';

export function VerifyEmailConfirmView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { mutate, isPending, isSuccess, isError, error } = useVerifyEmail();
  const called = useRef(false);

  useEffect(() => {
    if (token && !called.current) {
      called.current = true;
      mutate(token);
    }
  }, [token, mutate]);

  if (!token) {
    return (
      <div className="w-full max-w-[400px] mx-auto text-center">
        <div className="card p-8 flex flex-col items-center gap-4">
          <XCircle size={40} className="text-[#DC2626]" />
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--ink)]">Invalid link</h2>
            <p className="text-[13px] mt-1.5 text-[var(--ink-mute)]">This verification link is missing a token.</p>
          </div>
          <Link href="/auth/login" className="btn btn-outline mt-1">
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="w-full max-w-[400px] mx-auto text-center">
        <div className="card p-8 flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
          <p className="text-[14px] text-[var(--ink-mute)]">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-[400px] mx-auto text-center">
        <div className="card p-8 flex flex-col items-center gap-4">
          <CheckCircle size={40} className="text-[#15803D]" />
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--ink)]">Email verified!</h2>
            <p className="text-[13px] mt-1.5 text-[var(--ink-mute)]">
              Your account is active. Taking you to setup…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="card p-8 flex flex-col items-center gap-4">
        <XCircle size={40} className="text-[#DC2626]" />
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--ink)]">Verification failed</h2>
          <p className="text-[13px] mt-1.5 text-[var(--ink-mute)]">
            {isError && error instanceof Error ? error.message : 'This link may have expired or already been used.'}
          </p>
        </div>
        <Link href="/auth/login" className="btn btn-outline mt-1">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
