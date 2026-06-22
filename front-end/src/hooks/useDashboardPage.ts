import { useEffect, useState } from 'react';

import type { LandingPage } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import { getPageByUsername } from '@/services/pages.service';
import { getAccountUsernames } from '@/utils/onboarding';

export function useDashboardPage() {
  const session = loadSession();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const accountUsernames = getAccountUsernames(session);

        let loadedPage: LandingPage | null = null;
        for (const username of accountUsernames) {
          const byUsername = await getPageByUsername(username);
          if (byUsername && byUsername.status !== 'missing') {
            loadedPage = byUsername;
            break;
          }
        }

        if (!loadedPage) {
          if (!cancelled) {
            setPage(null);
          }
          return;
        }

        if (!cancelled) {
          setPage(loadedPage);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải page');
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
  }, [session?.user?.email, session?.user?.name]);

  const ownerId =
    String((session?.user as { id?: string } | undefined)?.id ?? session?.user?.email ?? 'anonymous').trim() || 'anonymous';

  return { page, setPage, loading, error, setError, ownerId, session };
}
