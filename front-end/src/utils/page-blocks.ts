import type { AddableBlockType } from '@/config/block-catalog';
import type { PageBlock } from '@/models/page.model';
import type { LandingPage } from '@/models/page.model';

export type PageBlockMeta = {
  id: string;
  visible?: boolean;
};

const DEFAULT_HERO_BODY = 'A fast creator landing page with a clean Beacons-style flow.';
const STRUCTURED_BLOCK_TYPES = new Set(['contact-form', 'text', 'gallery', 'album-block', 'link-block', 'review-block']);
const HEADER_BLOCK_TYPE = 'header';

export function createBlockId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function isHeaderBlock(block: PageBlock): boolean {
  return String(block.type ?? '') === HEADER_BLOCK_TYPE;
}

export function getBlockId(block: PageBlock): string {
  const typed = block as Record<string, unknown>;
  const id = String(typed.id ?? typed.formId ?? '').trim();
  if (id) {
    return id;
  }
  return createBlockId(String(typed.type ?? 'block'));
}

export function normalizePageBlock(block: PageBlock, index = 0): PageBlock {
  if (isHeaderBlock(block)) {
    return block;
  }

  const typed = block as Record<string, unknown>;
  const type = String(typed.type ?? 'block');
  const id = String(typed.id ?? '').trim() || createBlockId(type.replace('-block', '') || 'block');

  return {
    ...block,
    id,
    visible: typed.visible !== false,
  };
}

export function normalizePageBlocks(blocks: PageBlock[] | undefined): PageBlock[] {
  return (blocks ?? []).map((block, index) => normalizePageBlock(block, index));
}

export function getHeaderBlock(blocks: PageBlock[] | undefined): PageBlock | null {
  return (blocks ?? []).find((block) => isHeaderBlock(block)) ?? null;
}

export function getContentBlocks(blocks: PageBlock[] | undefined): PageBlock[] {
  return normalizePageBlocks(blocks).filter((block) => !isHeaderBlock(block));
}

export function serializePageBlocks(headerBlock: PageBlock | null, contentBlocks: PageBlock[]): PageBlock[] {
  const normalizedContent = contentBlocks.map((block, index) => normalizePageBlock(block, index));
  return headerBlock ? [headerBlock, ...normalizedContent] : normalizedContent;
}

export function findPageBlockById<T extends PageBlock>(page: LandingPage | null, blockId: string): T | null {
  if (!page?.blocks || !blockId) {
    return null;
  }
  return (page.blocks.find((block) => getBlockId(block) === blockId) as T | undefined) ?? null;
}

/** @deprecated Prefer findPageBlockById for multi-instance blocks */
export function findPageBlockByType<T extends PageBlock>(page: LandingPage | null, type: string): T | null {
  if (!page?.blocks) {
    return null;
  }
  return (page.blocks.find((block) => block.type === type) as T | undefined) ?? null;
}

export function resolveEditorBlock<T extends PageBlock>(
  page: LandingPage | null,
  type: string,
  blockIdParam?: string | null,
): T | null {
  if (blockIdParam) {
    const byId = findPageBlockById<T>(page, blockIdParam);
    if (byId && byId.type === type) {
      return byId;
    }
    return null;
  }
  return findPageBlockByType<T>(page, type);
}

export function upsertContentBlock(page: LandingPage, block: PageBlock): PageBlock[] {
  const headerBlock = getHeaderBlock(page.blocks);
  const contentBlocks = getContentBlocks(page.blocks);
  const normalizedBlock = normalizePageBlock(block);
  const blockId = getBlockId(normalizedBlock);
  const index = contentBlocks.findIndex((item) => getBlockId(item) === blockId);

  if (index >= 0) {
    contentBlocks[index] = normalizedBlock;
  } else {
    contentBlocks.push(normalizedBlock);
  }

  return serializePageBlocks(headerBlock, contentBlocks);
}

/** @deprecated Prefer upsertContentBlock */
export function upsertPageBlock(page: LandingPage, block: PageBlock): PageBlock[] {
  return upsertContentBlock(page, block);
}

export function reorderContentBlocks(page: LandingPage, orderedIds: string[]): PageBlock[] {
  const headerBlock = getHeaderBlock(page.blocks);
  const contentBlocks = getContentBlocks(page.blocks);
  const blockMap = new Map(contentBlocks.map((block) => [getBlockId(block), block]));
  const reordered: PageBlock[] = [];

  for (const id of orderedIds) {
    const block = blockMap.get(id);
    if (block) {
      reordered.push(block);
      blockMap.delete(id);
    }
  }

  for (const block of blockMap.values()) {
    reordered.push(block);
  }

  return serializePageBlocks(headerBlock, reordered);
}

export function toggleContentBlockVisibility(page: LandingPage, blockId: string): PageBlock[] {
  const headerBlock = getHeaderBlock(page.blocks);
  const contentBlocks = getContentBlocks(page.blocks).map((block) => {
    if (getBlockId(block) !== blockId) {
      return block;
    }
    return {
      ...block,
      visible: !isBlockVisible(block),
    };
  });

  return serializePageBlocks(headerBlock, contentBlocks);
}

export function removeContentBlock(page: LandingPage, blockId: string): PageBlock[] {
  const headerBlock = getHeaderBlock(page.blocks);
  const contentBlocks = getContentBlocks(page.blocks).filter((block) => getBlockId(block) !== blockId);
  return serializePageBlocks(headerBlock, contentBlocks);
}

export function createDefaultBlock(type: AddableBlockType): PageBlock {
  const id = createBlockId(type === 'link-block' ? 'link' : type.replace('-block', ''));

  switch (type) {
    case 'text':
      return {
        type: 'text',
        id,
        visible: true,
        content: '<p></p>',
      };
    case 'gallery':
      return {
        type: 'gallery',
        id,
        visible: true,
        title: '',
        subtitle: '',
        layout: 'column',
        appearance: 'exposed',
        aspectRatio: '16:9',
        imageScale: 100,
        visibleCount: 6,
        showMoreLabel: 'Xem thêm',
        images: [],
      };
    case 'album-block':
      return {
        type: 'album-block',
        id,
        visible: true,
        title: '',
        subtitle: '',
        categories: [],
        albums: [],
      };
    case 'link-block':
      return {
        type: 'link-block',
        id,
        visible: true,
        layout: 'classic',
        links: [],
      };
    case 'review-block':
      return {
        type: 'review-block',
        id,
        visible: true,
        title: '',
        subtitle: '',
        layout: 'carousel',
        reviews: [],
      };
    case 'contact-form':
      return {
        type: 'contact-form',
        id,
        visible: true,
        formId: '',
        title: 'Form liên hệ',
        submitLabel: 'Gửi biểu mẫu',
        successMessage: 'Đã gửi thành công.',
        showFieldLabels: false,
        fields: [],
      };
    default:
      return { type, id, visible: true };
  }
}

export function isBlockVisible(block: PageBlock): boolean {
  return (block as Record<string, unknown>).visible !== false;
}

export function isRenderablePreviewBlock(
  block: PageBlock,
  pageTitle: string,
  defaultHeroBody: string = DEFAULT_HERO_BODY,
): boolean {
  if (!isBlockVisible(block)) {
    return false;
  }

  const typedBlock = block as Record<string, unknown>;
  const type = String(typedBlock.type ?? '');

  if (type === 'header') {
    return false;
  }

  if (type === 'contact-form') {
    return true;
  }

  if (type === 'text') {
    return String(typedBlock.content ?? '').trim().length > 0;
  }

  if (type === 'gallery') {
    const images = Array.isArray(typedBlock.images) ? typedBlock.images : [];
    return images.some((item) => item && typeof item === 'object' && String((item as { url?: string }).url ?? '').trim());
  }

  if (type === 'album-block') {
    const albums = Array.isArray(typedBlock.albums) ? typedBlock.albums : [];
    return albums.some((album) => {
      if (!album || typeof album !== 'object') {
        return false;
      }
      const images = Array.isArray((album as { images?: unknown[] }).images) ? (album as { images: unknown[] }).images : [];
      return images.some((item) => item && typeof item === 'object' && String((item as { url?: string }).url ?? '').trim());
    });
  }

  if (type === 'link-block') {
    const links = Array.isArray(typedBlock.links) ? typedBlock.links : [];
    return links.some((item) => item && typeof item === 'object' && String((item as { url?: string }).url ?? '').trim());
  }

  if (type === 'review-block') {
    const reviews = Array.isArray(typedBlock.reviews) ? typedBlock.reviews : [];
    return reviews.some((item) => item && typeof item === 'object' && String((item as { quote?: string }).quote ?? '').trim());
  }

  if (STRUCTURED_BLOCK_TYPES.has(type)) {
    return true;
  }

  const label = String(typedBlock.label ?? typedBlock.headline ?? '').trim();
  const detail = String(typedBlock.body ?? typedBlock.href ?? '').trim();
  const isTemplateHeadline = label.toLowerCase() === String(pageTitle ?? '').trim().toLowerCase();
  const isTemplateBody = detail.toLowerCase() === defaultHeroBody.toLowerCase();
  const hasMeaningfulLabel = label.length > 0 && !isTemplateHeadline;
  const hasMeaningfulDetail = detail.length > 0 && !isTemplateBody;
  return hasMeaningfulLabel || hasMeaningfulDetail;
}

export function countBlocksByType(blocks: PageBlock[] | undefined, type: string): number {
  return getContentBlocks(blocks).filter((block) => block.type === type).length;
}
