import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: passwordSchema,
  tenantName: z.string().min(2, 'Workspace name is required'),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: 'Please accept the Terms and Privacy Policy to continue',
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const acceptInviteSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resendVerificationSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type AcceptInviteData = z.infer<typeof acceptInviteSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;

export interface LoginResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tenantId: string | null;
  role: string;
  onboardingStatus: 'EMAIL_UNVERIFIED' | 'COMPLETE';
  onboardingStep: 'CHANNEL' | 'CHATBOT' | 'DONE' | null;
  isTester: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  onboardingStatus: string;
  isTester: boolean;
  memberships: Array<{
    id: string;
    role: { id: string; name: string };
    tenant: { id: string; name: string; type: string };
    isActive?: boolean;
  }>;
}
