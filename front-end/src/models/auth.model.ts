export type UserRole = 'creator' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboardingCompleted?: boolean;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};