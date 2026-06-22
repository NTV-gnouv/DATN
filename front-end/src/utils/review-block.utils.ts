import type { ReviewBlockLayout, ReviewItem, ReviewPageBlock } from '@/models/content-blocks.model';
import type { PageBlock } from '@/models/page.model';

const REVIEW_LAYOUTS: ReviewBlockLayout[] = ['carousel', 'grid', 'featured'];

function clampRating(value: unknown): number {
  const rating = Number(value);
  if (!Number.isFinite(rating)) {
    return 5;
  }
  return Math.max(1, Math.min(5, Math.round(rating)));
}

function normalizeReviewItem(raw: unknown, index: number): ReviewItem | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const quote = String(item.quote ?? '').trim();
  if (!quote) {
    return null;
  }

  return {
    id: String(item.id ?? '').trim() || `review-${index}-${Date.now().toString(36)}`,
    quote,
    authorName: String(item.authorName ?? '').trim(),
    authorTitle: String(item.authorTitle ?? '').trim(),
    avatarUrl: String(item.avatarUrl ?? '').trim(),
    rating: clampRating(item.rating ?? 5),
  };
}

export function normalizeReviewBlock(block: ReviewPageBlock | PageBlock): ReviewPageBlock {
  const typed = block as Record<string, unknown>;
  const layout = REVIEW_LAYOUTS.includes(String(typed.layout ?? '') as ReviewBlockLayout)
    ? (String(typed.layout) as ReviewBlockLayout)
    : 'carousel';
  const rawReviews = Array.isArray(typed.reviews) ? typed.reviews : [];
  const reviews = rawReviews
    .map((item, index) => normalizeReviewItem(item, index))
    .filter((item): item is ReviewItem => item != null);

  return {
    type: 'review-block',
    id: String(typed.id ?? '').trim(),
    visible: typed.visible !== false,
    title: String(typed.title ?? '').trim(),
    subtitle: String(typed.subtitle ?? '').trim(),
    layout,
    reviews,
  };
}

export function getValidReviews(block: ReviewPageBlock | PageBlock): ReviewItem[] {
  return normalizeReviewBlock(block).reviews;
}
