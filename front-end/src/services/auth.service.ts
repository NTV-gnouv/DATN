import { apiRequest } from './api';
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/models/auth.model';

const SESSION_KEY = 'shotvn.session';

export async function login(payload: LoginPayload) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return apiRequest<{ id: string; email: string; name: string; role: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(email: string) {
  return apiRequest<{ success: boolean }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<{ success: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function completeOnboarding(userId: string) {
  return apiRequest<AuthSession['user']>('/auth/complete-onboarding', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function syncUserProfile(userId: string) {
  return apiRequest<AuthSession['user']>('/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function updateSessionUser(user: AuthSession['user']) {
  const session = loadSession();
  if (!session) {
    return;
  }

  saveSession({
    ...session,
    user,
  });
}