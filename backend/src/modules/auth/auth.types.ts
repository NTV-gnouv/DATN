export type AuthUserRole = 'creator' | 'admin';

export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: AuthUserRole;
  passwordHash: string;
  onboardingCompleted: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type PasswordResetRecord = {
  userId: string;
  token: string;
  expiresAt: string;
};
