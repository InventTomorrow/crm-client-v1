'use client';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useVerifyEmail } from '../hooks/useAuth';
import { extractErrorMessage } from '@/lib/utils';

export function VerifyEmailConfirmView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { mutate, isSuccess, isError, error } = useVerifyEmail();
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
          <Button asChild variant="outline" className="mt-1">
            <Link href="/auth/login">
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </Button>
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

  if (isError) {
    return (
      <div className="w-full max-w-[400px] mx-auto text-center">
        <div className="card p-8 flex flex-col items-center gap-4">
          <XCircle size={40} className="text-[#DC2626]" />
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--ink)]">Verification failed</h2>
            <p className="text-[13px] mt-1.5 text-[var(--ink-mute)]">
              {extractErrorMessage(error, 'This link may have expired or already been used.')}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-1">
            <Link href="/auth/login">
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default: idle (before the request fires) and pending — never flash failure.
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="card p-8 flex flex-col items-center gap-4">
        <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
        <p className="text-[14px] text-[var(--ink-mute)]">Verifying your email…</p>
      </div>
    </div>
  );
}
