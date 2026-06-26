import type { LandingPage } from '@/models/page.model';

export function pageOwnedByUser(page: LandingPage | null | undefined, userId: string): page is LandingPage {
  if (!page?.id || page.status === 'missing' || !userId) {
    return false;
  }

  return String(page.ownerId ?? '').trim() === userId;
}
