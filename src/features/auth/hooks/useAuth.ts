'use client';
import { setLoggingOut } from '@/lib/apiClient';
import { useAppStore } from '@/lib/appStore';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  acceptInvite,
  acceptMyInvitation,
  cancelInvitation,
  changeMemberRole,
  createWorkspace,
  declineMyInvitation,
  forgotPassword,
  getInvitations,
  getMe,
  getMembers,
  getMyInvitations,
  getPermissionCatalog,
  getRoles,
  inviteUser,
  login,
  logout,
  register,
  removeMember,
  resendVerification,
  resetPassword,
  switchWorkspace,
  updateMe,
  updateRolePermissions,
  validateInvite,
  verifyEmail,
} from '../services/authService';
import type { AcceptInviteData, CreateWorkspaceData, ForgotPasswordData, LoginData, RegisterData, ResetPasswordData } from '../types';
import { resolveAuthLanding } from '../utils/authLanding';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuthTransition = useAppStore((s) => s.setAuthTransition);
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: async (user) => {
      // Credentials verified — show the splash only now, while we redirect.
      setAuthTransition(true);
      // Drop any cache left by a previously signed-in user in this browser so
      // the new session never renders the prior identity, role, or permissions.
      queryClient.clear();
      // A non-dashboard landing means setup is unfinished; the tenantId check is
      // the same condition restated so the workspace calls below stay narrowed.
      const landing = resolveAuthLanding(user);
      if (landing !== '/dashboard' || !user.tenantId) {
        router.push(landing);
        return;
      }
      // Resume the workspace the user last worked in (persisted across logout).
      // Scope the server session here — under the splash, before entering the
      // app — so the initial load prepares the right tenant with no post-render
      // "switching" flash. Falls back to the login default if it's no longer
      // accessible (different user/browser, or membership removed).
      const lastWorkspaceId = useAppStore.getState().currentWorkspaceId;
      if (lastWorkspaceId && lastWorkspaceId !== user.tenantId) {
        try {
          await switchWorkspace(lastWorkspaceId);
          setCurrentWorkspace(lastWorkspaceId);
        } catch {
          setCurrentWorkspace(user.tenantId);
        }
      } else {
        setCurrentWorkspace(user.tenantId);
      }
      router.push('/dashboard');
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
      router.push('/onboarding/category');
    },
    // Error surfaced inline via <AuthFormError /> in the view (mutation.error).
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setAuthTransition = useAppStore((s) => s.setAuthTransition);
  return useMutation({
    mutationFn: logout,
    // Suppress the axios 401 interceptor so background requests firing after the
    // session is torn down don't bounce the user to /auth/login.
    onMutate: () => setLoggingOut(true),
    onSuccess: () => {
      // Logout succeeded — show the splash only now, while we redirect.
      setAuthTransition(true);
      // Wipe the cache so the next user on this browser starts from a clean slate,
      // then hard-redirect to the root landing page (not the login screen).
      queryClient.clear();
      window.location.replace('/');
    },
    onError: (error) => {
      setLoggingOut(false);
      toast.error(extractErrorMessage(error));
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      // The server signs the user in as part of verifying — drop any identity
      // cached while they were still unverified before the gate reads it.
      queryClient.removeQueries({ queryKey: ['me'] });
      router.push('/onboarding/workspace');
    },
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
  const queryClient = useQueryClient();
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  return useMutation({
    mutationFn: (data?: AcceptInviteData) => acceptInvite(token, data),
    onSuccess: (result) => {
      // An existing account joined without a session — sending it to a protected
      // page would only bounce it back out, so go straight to sign-in.
      if (result.requiresLogin || !result.user) {
        toast.success('You joined the workspace. Sign in to open it.');
        router.push('/auth/login');
        return;
      }
      // New account, already signed in by the server. Drop any cache from a
      // previous session in this browser before entering the workspace.
      queryClient.clear();
      if (result.user.tenantId) setCurrentWorkspace(result.user.tenantId);
      router.push('/inbox');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useMyInvitations() {
  return useQuery({ queryKey: ['my-invitations'], queryFn: getMyInvitations });
}

/** Accept a pending invitation, then switch into that workspace like a full switch. */
export function useAcceptMyInvitation() {
  const qc = useQueryClient();
  const { setCurrentWorkspace, setWorkspaceSwitching } = useAppStore();
  return useMutation({
    mutationFn: async (invite: { id: string; tenantId: string; tenantName: string | null }) => {
      setWorkspaceSwitching(true, invite.tenantName ?? 'workspace');
      await acceptMyInvitation(invite.id);
      await switchWorkspace(invite.tenantId);
      return invite;
    },
    onSuccess: async ({ tenantId, tenantName }) => {
      // Wipe stale cache while the overlay covers the UI, then load fresh identity.
      qc.clear();
      await qc.fetchQuery({ queryKey: ['me'], queryFn: getMe });
      setCurrentWorkspace(tenantId);
      await new Promise((r) => setTimeout(r, 80));
      setWorkspaceSwitching(false);
      toast.success(`Joined ${tenantName ?? 'the workspace'}.`);
    },
    onError: (error) => {
      setWorkspaceSwitching(false);
      toast.error(extractErrorMessage(error, 'Failed to accept invitation'));
    },
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

export function usePermissionCatalog() {
  // The catalogue only changes on deploy, so it never needs refetching mid-session.
  return useQuery({ queryKey: ['permission-catalog'], queryFn: getPermissionCatalog, staleTime: Infinity });
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
