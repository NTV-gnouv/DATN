import { useEffect, useState } from 'react';

import type { HeaderBlock } from '@/models/editor.model';
import { getDefaultHeaderBlock } from '@/services/editor.service';
import { getPageEditorConfig } from '@/services/pages.service';
import { normalizeHeaderBlock } from '@/utils/normalize-header-block';

export function useDashboardPreviewData(pageId?: string) {
  const [headerBlock, setHeaderBlock] = useState<HeaderBlock | null>(null);
  const [themeTokens, setThemeTokens] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(Boolean(pageId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pageId) {
      setHeaderBlock(null);
      setThemeTokens(null);
      setLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    void (async () => {
      try {
        const config = await getPageEditorConfig(pageId);
        if (cancelled) {
          return;
        }

        const fallbackHeader = await getDefaultHeaderBlock();
        const resolvedHeader = config?.headerBlock
          ? (config.headerBlock as HeaderBlock)
          : fallbackHeader;
        setHeaderBlock(normalizeHeaderBlock(resolvedHeader));
        setThemeTokens((config?.themeTokens as Record<string, unknown> | null | undefined) ?? null);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải preview');
          const fallbackHeader = await getDefaultHeaderBlock();
          if (!cancelled) {
            setHeaderBlock(normalizeHeaderBlock(fallbackHeader));
            setThemeTokens(null);
          }
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
  }, [pageId]);

  return { headerBlock, themeTokens, loading, error };
}
