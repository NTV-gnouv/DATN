import { apiRequest } from './api';
import type { LandingPage, PageDraft } from '@/models/page.model';

export async function listPages() {
  return apiRequest<LandingPage[]>('/pages');
}

export async function getPageById(pageId: string) {
  return apiRequest<LandingPage>(`/pages/${pageId}`);
}

export async function updatePage(pageId: string, payload: Partial<LandingPage>) {
  return apiRequest<LandingPage>(`/pages/${encodeURIComponent(pageId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updatePageSlug(pageId: string, slug: string) {
  return apiRequest<LandingPage>(`/pages/${encodeURIComponent(pageId)}/slug`, {
    method: 'PATCH',
    body: JSON.stringify({ slug }),
  });
}

export async function updatePageSlugByUsername(username: string, slug: string) {
  return apiRequest<LandingPage>(`/pages/user/${encodeURIComponent(username)}/slug`, {
    method: 'PATCH',
    body: JSON.stringify({ slug }),
  });
}

export async function getPageBySlug(slug: string) {
  return apiRequest<LandingPage>(`/pages/slug/${encodeURIComponent(slug)}`);
}

export async function getPageByUsername(username: string) {
  return apiRequest<LandingPage>(`/pages/user/${encodeURIComponent(username)}`);
}

export async function checkSlugAvailability(slug: string, excludeId?: string) {
  const query = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : '';
  return apiRequest<{ slug: string; available: boolean }>(`/pages/slug/${encodeURIComponent(slug)}/available${query}`);
}

export async function createStarterPage(payload: PageDraft) {
  return apiRequest<LandingPage>('/pages/template', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPageEditorConfig(pageId: string) {
  return apiRequest<{
    pageId: string;
    themeId: string;
    themeTokens?: Record<string, unknown> | null;
    headerBlockId: string;
    headerBlock: Record<string, unknown> | null;
  }>(`/pages/${encodeURIComponent(pageId)}/editor-config`);
}

export async function updatePageEditorConfig(
  pageId: string,
  payload: {
    themeId: string;
    themeTokens?: Record<string, unknown> | null;
    headerBlockId: string;
    headerBlock: Record<string, unknown> | null;
  },
) {
  return apiRequest<{
    pageId: string;
    themeId: string;
    themeTokens?: Record<string, unknown> | null;
    headerBlockId: string;
    headerBlock: Record<string, unknown> | null;
  }>(`/pages/${encodeURIComponent(pageId)}/editor-config`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}