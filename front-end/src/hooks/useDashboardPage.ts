import { useEffect, useState } from 'react';

import type { LandingPage } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import { getPageById, getPageByUsername } from '@/services/pages.service';

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function useDashboardPage() {
  const session = loadSession();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const usernameFromName = normalizeSlug(session?.user?.name || '');
        const usernameFromEmail = normalizeSlug(session?.user?.email?.split('@')[0] || '');
        const accountUsernames = [usernameFromName, usernameFromEmail].filter(
          (value, index, all) => Boolean(value) && all.indexOf(value) === index,
        );

        let loadedPage: LandingPage | null = null;
        for (const username of accountUsernames) {
          const byUsername = await getPageByUsername(username);
          if (byUsername && byUsername.status !== 'missing') {
            loadedPage = byUsername;
            break;
          }
        }
        if (!loadedPage) {
          loadedPage = await getPageById('p-demo');
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
