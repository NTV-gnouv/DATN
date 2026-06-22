import { useState, useCallback } from 'react';
import { loadSession } from '@/services/auth.service';
import { apiRequest } from '@/services/api';

export interface SocialLink {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'behance' | 'x' | 'snapchat' | 'linkedin';
  username: string;
  url?: string;
  profileData?: {
    displayName?: string;
    bio?: string;
    followers?: number;
    avatar?: string;
  };
}

export interface OnboardingSession {
  id: string;
  userId: string;
  pageId?: string;
  currentStep: 1 | 2 | 3 | 4;
  status: 'in_progress' | 'completed' | 'abandoned';
  step1: { socialLinks: SocialLink[] };
  step2: {
    isConfirmed?: boolean;
    avatar?: string;
    bio?: string;
    displayName?: string;
    interests?: string[];
  };
  step3: {
    generatedPrompt?: string;
    editedPrompt?: string;
    tags?: string[];
    selectedTemplate?: string;
  };
  step4: {
    landingPageId?: string;
    completedAt?: Date;
  };
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const API_BASE = '/onboarding';

export function useOnboarding() {
  const session = loadSession();
  const [onboardingSession, setOnboardingSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useCallback(
    async <T>(method: string, endpoint: string, body?: unknown): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await apiRequest<T>(`${API_BASE}${endpoint}`, {
          method,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const startSession = useCallback(
    async (pageId?: string): Promise<OnboardingSession> => {
      const data = await api<OnboardingSession>('POST', '/start', {
        userId: session?.user?.id,
        pageId,
      });
      setOnboardingSession(data);
      return data;
    },
    [api, session?.user?.id]
  );

  const submitStep = useCallback(
    async (step: 1 | 2 | 3 | 4, data: unknown): Promise<OnboardingSession> => {
      if (!onboardingSession) throw new Error('No active session');
      const updated = await api<OnboardingSession>('POST', `/${onboardingSession.id}/step/${step}`, data);
      setOnboardingSession(updated);
      return updated;
    },
    [api, onboardingSession]
  );

  const getProgress = useCallback(async (): Promise<{
    sessionId: string;
    currentStep: 1 | 2 | 3 | 4;
    status: string;
    stepsCompleted: number;
    progress: number;
  } | null> => {
    if (!onboardingSession) return null;
    return await api<{
      sessionId: string;
      currentStep: 1 | 2 | 3 | 4;
      status: string;
      stepsCompleted: number;
      progress: number;
    }>('GET', `/${onboardingSession.id}/progress`);
  }, [api, onboardingSession]);

  const regeneratePrompt = useCallback(async (): Promise<string> => {
    if (!onboardingSession) throw new Error('No active session');
    const result = await api<{ prompt: string }>('PATCH', `/${onboardingSession.id}/regenerate-prompt`);
    return result.prompt;
  }, [api, onboardingSession]);

  const cancel = useCallback(async () => {
    if (!onboardingSession) throw new Error('No active session');
    await api('POST', `/${onboardingSession.id}/cancel`);
    setOnboardingSession(null);
  }, [api, onboardingSession]);

  return {
    session: onboardingSession,
    loading,
    error,
    startSession,
    submitStep,
    getProgress,
    regeneratePrompt,
    cancel,
  };
}
