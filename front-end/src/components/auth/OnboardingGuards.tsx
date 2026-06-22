import { type PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { loadSession } from '@/services/auth.service';
import {
  isOnboardingRequired,
  refreshSessionFromServer,
  resolveOnboardingPath,
  resolveOnboardingPathFromSession,
} from '@/utils/onboarding';

export function RequireOnboardingComplete({ children }: PropsWithChildren) {
  const location = useLocation();
  const session = loadSession();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!session) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const activeSession = (await refreshSessionFromServer()) ?? session;
        const nextPath = await resolveOnboardingPathFromSession(activeSession);
        if (!cancelled && nextPath !== '/dashboard') {
          setRedirectTo(nextPath);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (loading) {
    return (
      <main className="onboarding-shell">
        <p className="muted-copy">Đang kiểm tra tiến trình thiết lập...</p>
      </main>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export function RequireOnboardingStep({
  step,
  children,
}: PropsWithChildren<{ step: 'domain' | 'chat' }>) {
  const session = loadSession();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!session) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const activeSession = (await refreshSessionFromServer()) ?? session;

        if (!isOnboardingRequired(activeSession.user)) {
          if (!cancelled) {
            setRedirectTo('/dashboard');
          }
          return;
        }

        const nextPath = await resolveOnboardingPathFromSession(activeSession);
        const expectedPath = step === 'domain' ? '/onboarding/domain' : '/onboarding/chat';
        if (!cancelled && nextPath !== expectedPath) {
          setRedirectTo(nextPath);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, step]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <main className="onboarding-shell">
        <p className="muted-copy">Đang tải...</p>
      </main>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
