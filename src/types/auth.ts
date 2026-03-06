import { z } from 'zod';

/**
 * Schema for the authenticated user response
 */
export const AuthUserResponseSchema = z.object({
  id: z.string().uuid(),
  cognitoUserId: z.string(),
  email: z.string().email(),
  username: z.string().nullable(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.enum(['BUYER', 'CREATOR', 'ADMIN']),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
  mobileVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;

/**
 * Schema for user registration/sync request
 */
export const SyncUserSchema = z.object({
  cognitoUserId: z.string().min(1, 'Cognito user ID is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
});

export type SyncUser = z.infer<typeof SyncUserSchema>;

/**
 * Schema for updating user profile
 */
export const UpdateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
