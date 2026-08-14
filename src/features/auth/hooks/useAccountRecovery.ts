'use client';
import { extractApiErrorCode, extractErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  permanentlyDeleteAccount,
  requestAccountRecoveryOtp,
  restoreAccount,
} from '../services/authService';
import type { AccountRecoveryActionData, AccountRecoveryOtpData } from '../types';

const ACCOUNT_SCHEDULED_FOR_DELETION = 'auth/account_scheduled_for_deletion';

/**
 * Signing in or signing up with a soft-deleted address is a recoverable state,
 * not a dead end — send the owner to the page where they can restore the
 * account or close it early, instead of leaving them on an error banner.
 */
export function useDeletedAccountRedirect(error: unknown, email: string) {
  const router = useRouter();
  const isDeleted = extractApiErrorCode(error) === ACCOUNT_SCHEDULED_FOR_DELETION;

  useEffect(() => {
    if (!isDeleted) return;
    router.push(`/auth/account-recovery?email=${encodeURIComponent(email)}`);
  }, [isDeleted, email, router]);
}

/** Mails the one-time code that authorises both recovery actions. */
export function useRequestAccountRecoveryOtp() {
  return useMutation({
    mutationFn: (data: AccountRecoveryOtpData) => requestAccountRecoveryOtp(data),
    onSuccess: () => toast.success('Code sent — check your inbox.'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRestoreAccount() {
  return useMutation({
    mutationFn: (data: AccountRecoveryActionData) => restoreAccount(data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function usePermanentlyDeleteAccount() {
  return useMutation({
    mutationFn: (data: AccountRecoveryActionData) => permanentlyDeleteAccount(data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
