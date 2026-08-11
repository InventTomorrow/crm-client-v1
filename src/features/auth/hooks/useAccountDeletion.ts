'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { confirmAccountDeletion, requestAccountDeletion } from '../services/authService';

/** Step 1 — mails the code that authorises the deletion. */
export function useRequestAccountDeletion() {
  return useMutation({
    mutationFn: () => requestAccountDeletion(),
    onSuccess: () => toast.success('Confirmation code sent to your email.'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Step 2 — the code is what actually closes the account. */
export function useConfirmAccountDeletion() {
  return useMutation({
    mutationFn: (otp: string) => confirmAccountDeletion(otp),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
