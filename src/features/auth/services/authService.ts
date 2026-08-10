import { apiClient, runExclusiveAuthOp } from '@/lib/apiClient';
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, AcceptInviteData, CreateWorkspaceData, LoginResponse, UserResponse } from '../types';

export async function login(data: LoginData): Promise<LoginResponse> {
  const res = await apiClient.post<{ success: true; data: LoginResponse }>('/auth/login', {
    email: data.email,
    password: data.password,
  });
  return res.data.data;
}


export async function register(data: RegisterData) {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function createWorkspace(data: CreateWorkspaceData): Promise<LoginResponse> {
  const res = await apiClient.post<{ success: true; data: LoginResponse }>('/auth/workspace', data);
  return res.data.data;
}

export async function logout() {
  const res = await apiClient.post('/auth/logout');
  return res.data;
}

export async function verifyEmail(token: string) {
  const res = await apiClient.get('/auth/verify-email', { params: { token } });
  return res.data;
}

export async function resendVerification(email: string) {
  const res = await apiClient.post('/auth/resend-verification', { email });
  return res.data;
}

export async function forgotPassword(data: ForgotPasswordData) {
  const res = await apiClient.post('/auth/forgot-password', data);
  return res.data;
}

export async function resetPassword(token: string, data: ResetPasswordData) {
  const res = await apiClient.post('/auth/reset-password', { token, password: data.password });
  return res.data;
}

export interface InviteValidation {
  status: 'VALID' | 'EXPIRED' | 'ACCEPTED' | 'NOT_FOUND';
  email?: string;
  tenantName?: string | null;
  roleName?: string | null;
  expiresAt?: string;
  accountExists?: boolean;
}

export async function validateInvite(token: string): Promise<InviteValidation> {
  const res = await apiClient.get<{ success: true; data: InviteValidation }>('/auth/invite/validate', {
    params: { token },
  });
  return res.data.data;
}

export async function acceptInvite(token: string, data?: AcceptInviteData) {
  const res = await apiClient.post('/auth/accept-invite', {
    token,
    ...(data
      ? { firstName: data.firstName, lastName: data.lastName, password: data.password }
      : {}),
  });
  return res.data;
}

export interface MyInvitationItem {
  id: string;
  tenantId: string;
  tenantName: string | null;
  roleName: string;
  invitedByName: string | null;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}

export async function getMyInvitations(): Promise<MyInvitationItem[]> {
  const res = await apiClient.get<{ success: true; data: MyInvitationItem[] }>('/auth/my-invitations');
  return res.data.data;
}

export async function acceptMyInvitation(id: string) {
  const res = await apiClient.post(`/auth/my-invitations/${id}/accept`);
  return res.data;
}

export async function declineMyInvitation(id: string) {
  const res = await apiClient.post(`/auth/my-invitations/${id}/decline`);
  return res.data;
}
export async function getMe(): Promise<UserResponse> {
  const res = await apiClient.get<{ success: true; data: UserResponse }>('/auth/me');
  return res.data.data;
}

export interface LeftMemberItem {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  leftAt: string;
}

export async function leaveWorkspace(tenantId: string) {
  const res = await apiClient.post('/auth/leave-workspace', { tenantId });
  return res.data;
}

export async function getLeftMembers(): Promise<LeftMemberItem[]> {
  const res = await apiClient.get<{ success: true; data: LeftMemberItem[] }>('/auth/left-members');
  return res.data.data;
}

export async function switchWorkspace(tenantId: string) {
  // Shares the exclusive lock with refreshAccessToken() — see apiClient.ts —
  // so a concurrent /auth/refresh can't resolve after this and overwrite the
  // new tenant's cookies with re-issued old-tenant ones.
  const res = await runExclusiveAuthOp(() =>
    apiClient.post('/auth/switch-workspace', { tenantId }),
  );
  return res.data;
}

export async function updateMe(data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
  const res = await apiClient.patch<{ success: true; data: UserResponse }>('/auth/me', data);
  return res.data.data;
}

export interface MemberItem {
  membershipId: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleName: string;
  roleId: string;
  joinedAt: string;
}

export async function getMembers(): Promise<MemberItem[]> {
  const res = await apiClient.get<{ success: true; data: MemberItem[] }>('/auth/members');
  return res.data.data;
}

export async function inviteUser(data: { email: string; roleId: string }) {
  const res = await apiClient.post('/auth/invite', data);
  return res.data;
}

export async function removeMember(membershipId: string) {
  const res = await apiClient.delete(`/auth/members/${membershipId}`);
  return res.data;
}

export interface InvitationItem {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  invitedByName: string | null;
  expiresAt: string;
  createdAt: string;
  expired: boolean;
}

export async function getInvitations(): Promise<InvitationItem[]> {
  const res = await apiClient.get<{ success: true; data: InvitationItem[] }>('/auth/invitations');
  return res.data.data;
}

export async function cancelInvitation(id: string) {
  const res = await apiClient.delete(`/auth/invitations/${id}`);
  return res.data;
}

export async function changeMemberRole(membershipId: string, roleId: string) {
  const res = await apiClient.put(`/auth/members/${membershipId}/role`, { roleId });
  return res.data;
}
export interface RoleItem {
  id: string;
  name: string;
  permissions: string[];
  tenantId: string;
}

export async function getRoles(): Promise<RoleItem[]> {
  const res = await apiClient.get<{ success: true; data: RoleItem[] }>('/auth/roles');
  return res.data.data;
}

export async function updateRolePermissions(roleId: string, permissions: string[]): Promise<RoleItem> {
  const res = await apiClient.put<{ success: true; data: RoleItem }>(`/auth/roles/${roleId}/permissions`, { permissions });
  return res.data.data;
}
