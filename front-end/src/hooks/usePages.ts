import { useEffect, useState } from 'react';

import {
  checkSlugAvailability,
  createStarterPage,
  getPageById,
  getPageBySlug,
  listPages,
} from '@/services/pages.service';
import type { LandingPage, PageDraft } from '@/models/page.model';

export function usePages() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshPages() {
    setLoading(true);
    setError('');
    try {
      const data = await listPages();
      setPages(data);
      return data;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Không thể tải danh sách trang';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function createPage(payload: PageDraft) {
    setLoading(true);
    setError('');
    try {
      const page = await createStarterPage(payload);
      setPages((current) => [page, ...current]);
      setMessage('Đã tạo trang mẫu thành công.');
      return page;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Không thể tạo trang';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function verifySlug(slug: string) {
    const result = await checkSlugAvailability(slug);
    return result.available;
  }

  async function loadPage(pageId: string) {
    return getPageById(pageId);
  }

  async function loadPublicPage(slug: string) {
    return getPageBySlug(slug);
  }

  useEffect(() => {
    void refreshPages();
  }, []);

  return {
    pages,
    loading,
    message,
    error,
    setMessage,
    refreshPages,
    createPage,
    verifySlug,
    loadPage,
    loadPublicPage,
  };
}
