import { useEffect, useState } from 'react';

import type { LandingPage } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import { getMyPage } from '@/services/pages.service';

export function useDashboardPage() {
  const session = loadSession();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const loadedPage = await getMyPage();
        if (!cancelled) {
          setPage(loadedPage?.id ? loadedPage : null);
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
  }, [session?.user?.id]);

  const ownerId =
    String((session?.user as { id?: string } | undefined)?.id ?? session?.user?.email ?? 'anonymous').trim() || 'anonymous';

  return { page, setPage, loading, error, setError, ownerId, session };
}
