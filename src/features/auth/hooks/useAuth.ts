'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  login, register, createWorkspace, logout, forgotPassword, resetPassword,
  acceptInvite, verifyEmail, resendVerification, getMe, updateMe,
  getMembers, inviteUser, removeMember, changeMemberRole, getRoles, updateRolePermissions,
  validateInvite, getInvitations, cancelInvitation,
  getMyInvitations, acceptMyInvitation, declineMyInvitation,
} from '../services/authService';
import type { LoginData, RegisterData, CreateWorkspaceData, ForgotPasswordData, ResetPasswordData, AcceptInviteData } from '../types';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (user) => {
      // Drop any cache left by a previously signed-in user in this browser so
      // the new session never renders the prior identity, role, or permissions.
      queryClient.clear();
      if (user.onboardingStatus === 'EMAIL_UNVERIFIED') {
        router.push('/auth/verify-email');
        return;
      }
      if (!user.tenantId || user.onboardingStep === 'WORKSPACE') {
        router.push('/onboarding/workspace');
        return;
      }
      if (user.onboardingStep && user.onboardingStep !== 'DONE') {
        const step = user.onboardingStep.toLowerCase();
        router.push(`/onboarding/${step}`);
        return;
      }
      router.push('/inbox');
    },
    // Error surfaced inline via <AuthFormError /> in the view (mutation.error).
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: () => router.push('/auth/verify-email'),
    // Error surfaced inline via <AuthFormError /> in the view (mutation.error).
  });
}

export function useCreateWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspaceData) => createWorkspace(data),
    onSuccess: () => {
      // Fresh session cookies now carry the new tenantId — refetch identity.
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/onboarding/channel');
    },
    // Error surfaced inline via <AuthFormError /> in the view (mutation.error).
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Wipe the cache so the next user on this browser starts from a clean slate.
      queryClient.clear();
      router.push('/auth/login');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => router.push('/onboarding/workspace'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
    onSuccess: () => toast.success('Verification email sent — check your inbox.'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPassword(data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useResetPassword(token: string) {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(token, data),
    onSuccess: () => {
      toast.success('Password reset. Please sign in.');
      router.push('/auth/login');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useValidateInvite(token: string) {
  return useQuery({
    queryKey: ['invite-validate', token],
    queryFn: () => validateInvite(token),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  });
}

export function useAcceptInvite(token: string) {
  const router = useRouter();
  return useMutation({
    mutationFn: (data?: AcceptInviteData) => acceptInvite(token, data),
    onSuccess: () => router.push('/inbox'),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useMyInvitations() {
  return useQuery({ queryKey: ['my-invitations'], queryFn: getMyInvitations });
}

export function useAcceptMyInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptMyInvitation,
    onSuccess: (res) => {
      toast.success(res?.message ?? 'Joined the workspace.');
      qc.invalidateQueries({ queryKey: ['my-invitations'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to accept invitation')),
  });
}

export function useDeclineMyInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: declineMyInvitation,
    onSuccess: () => {
      toast.success('Invitation declined.');
      qc.invalidateQueries({ queryKey: ['my-invitations'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to decline invitation')),
  });
}

export function useMe() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return { user: data, isLoading, error };
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated);
      toast.success('Profile saved.');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useMembers() {
  return useQuery({ queryKey: ['members'], queryFn: getMembers });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: (res) => {
      toast.success(res?.message ?? 'Invitation sent.');
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to send invite')),
  });
}

export function useInvitations() {
  return useQuery({ queryKey: ['invitations'], queryFn: getInvitations });
}

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      toast.success('Invitation cancelled.');
      qc.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to cancel invitation')),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      toast.success('Member removed.');
      qc.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to remove member')),
  });
}

export function useChangeMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, roleId }: { membershipId: string; roleId: string }) =>
      changeMemberRole(membershipId, roleId),
    onSuccess: () => {
      toast.success('Role updated.');
      qc.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to change role')),
  });
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: getRoles });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      toast.success('Permissions saved.');
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to save permissions')),
  });
}
