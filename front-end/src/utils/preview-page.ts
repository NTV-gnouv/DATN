import type { LandingPage, PageBlock } from '@/models/page.model';
import { upsertContentBlock } from '@/utils/page-blocks';

export function buildPreviewPage(page: LandingPage | null, draftBlock?: PageBlock | null): LandingPage | null {
  if (!page) {
    return null;
  }

  if (!draftBlock) {
    return page;
  }

  return {
    ...page,
    blocks: upsertContentBlock(page, draftBlock),
  };
}
