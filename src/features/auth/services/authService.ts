import { apiClient } from '@/lib/apiClient';
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData, AcceptInviteData, LoginResponse, UserResponse } from '../types';

export async function login(data: LoginData): Promise<LoginResponse> {
  const res = await apiClient.post<{ success: true; data: LoginResponse }>('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterData) {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
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

export async function acceptInvite(token: string, data: AcceptInviteData) {
  const res = await apiClient.post('/auth/accept-invite', {
    token,
    firstName: data.firstName,
    lastName: data.lastName,
    password: data.password,
  });
  return res.data;
}
export async function getMe(): Promise<UserResponse> {
  const res = await apiClient.get<{ success: true; data: UserResponse }>('/auth/me');
  return res.data.data;
}

export async function switchWorkspace(tenantId: string) {
  const res = await apiClient.post('/auth/switch-workspace', { tenantId });
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

export async function inviteUser(data: { email: string; roleId?: string }) {
  const res = await apiClient.post('/auth/invite', data);
  return res.data;
}

export async function removeMember(membershipId: string) {
  const res = await apiClient.delete(`/auth/members/${membershipId}`);
  return res.data;
}

export async function changeMemberRole(membershipId: string, roleId: string) {
  const res = await apiClient.put(`/auth/members/${membershipId}/role`, { roleId });
  return res.data;
}
