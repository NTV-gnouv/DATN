import type { CSSProperties } from 'react';

import type {
  GalleryAppearance,
  GalleryAspectRatio,
  GalleryLayout,
  GalleryPageBlock,
} from '@/models/content-blocks.model';

export const GALLERY_IMAGE_SCALE_MIN = 50;
export const GALLERY_IMAGE_SCALE_MAX = 100;

export const GALLERY_ASPECT_RATIO_OPTIONS: Array<{ value: GalleryAspectRatio; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '3:1', label: '3:1' },
];

export function clampGalleryImageScale(value: unknown, fallback = 100): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(GALLERY_IMAGE_SCALE_MIN, Math.min(GALLERY_IMAGE_SCALE_MAX, Math.round(parsed)));
}

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  if (value === 'carousel' || value === 'column') {
    return value;
  }
  if (value === 'slider') {
    return 'carousel';
  }
  if (value === 'grid') {
    return 'column';
  }
  return 'column';
}

export function normalizeGalleryAppearance(value: unknown): GalleryAppearance {
  return value === 'collapsible' ? 'collapsible' : 'exposed';
}

export function normalizeGalleryAspectRatio(value: unknown): GalleryAspectRatio {
  const allowed = GALLERY_ASPECT_RATIO_OPTIONS.map((item) => item.value);
  return allowed.includes(value as GalleryAspectRatio) ? (value as GalleryAspectRatio) : 'auto';
}

export function normalizeGalleryBlock(block: Partial<GalleryPageBlock> | null | undefined): GalleryPageBlock {
  const images = Array.isArray(block?.images)
    ? block.images
        .filter((item) => item && typeof item === 'object' && String(item.url ?? '').trim())
        .map((item) => ({
          id: String(item.id ?? `img-${Math.random().toString(36).slice(2, 8)}`),
          url: String(item.url),
          caption: String(item.caption ?? ''),
          linkUrl: String(item.linkUrl ?? ''),
        }))
    : [];

  return {
    type: 'gallery',
    id: String(block?.id ?? ''),
    title: String(block?.title ?? ''),
    subtitle: String(block?.subtitle ?? ''),
    layout: normalizeGalleryLayout(block?.layout ?? block?.displayMode),
    appearance: normalizeGalleryAppearance(block?.appearance),
    aspectRatio: normalizeGalleryAspectRatio(block?.aspectRatio),
    imageScale: clampGalleryImageScale(block?.imageScale),
    visibleCount: Math.max(1, Number(block?.visibleCount ?? 6) || 6),
    showMoreLabel: String(block?.showMoreLabel ?? 'Xem thêm'),
    images,
    displayMode: normalizeGalleryLayout(block?.layout ?? block?.displayMode) === 'carousel' ? 'slider' : 'grid',
  };
}

export function getGalleryAspectRatioStyle(aspectRatio: GalleryAspectRatio): CSSProperties {
  if (aspectRatio === 'auto') {
    return {};
  }

  const [width, height] = aspectRatio.split(':').map((part) => Number(part));
  if (!width || !height) {
    return {};
  }

  return { aspectRatio: `${width} / ${height}` };
}

export function getGalleryImageScaleStyle(imageScale: number): CSSProperties {
  return {
    width: `${clampGalleryImageScale(imageScale)}%`,
    marginInline: 'auto',
  };
}
