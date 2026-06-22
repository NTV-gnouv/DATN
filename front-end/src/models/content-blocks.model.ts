import type { PageBlock } from './page.model';

export type TextPageBlock = PageBlock & {
  type: 'text';
  id: string;
  visible?: boolean;
  content: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption?: string;
  linkUrl?: string;
};

export type GalleryLayout = 'column' | 'carousel';
export type GalleryAppearance = 'exposed' | 'collapsible';
export type GalleryAspectRatio = 'auto' | '1:1' | '3:2' | '16:9' | '3:1';

export type GalleryPageBlock = PageBlock & {
  type: 'gallery';
  id: string;
  visible?: boolean;
  title?: string;
  subtitle?: string;
  layout: GalleryLayout;
  appearance: GalleryAppearance;
  aspectRatio: GalleryAspectRatio;
  imageScale: number;
  visibleCount: number;
  showMoreLabel?: string;
  images: GalleryImage[];
  /** @deprecated kept for backward compatibility */
  displayMode?: 'slider' | 'grid';
};

export type LinkItem = {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
};

export type LinkBlockLayout = 'classic' | 'carousel' | 'image-grid' | 'card';

export type LinkPageBlock = PageBlock & {
  type: 'link-block';
  id: string;
  visible?: boolean;
  layout: LinkBlockLayout;
  links: LinkItem[];
};

export type ReviewItem = {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  avatarUrl?: string;
  rating?: number;
};

export type ReviewBlockLayout = 'carousel' | 'grid' | 'featured';

export type ReviewPageBlock = PageBlock & {
  type: 'review-block';
  id: string;
  visible?: boolean;
  title?: string;
  subtitle?: string;
  layout: ReviewBlockLayout;
  reviews: ReviewItem[];
};

export type ContentBlockType = 'text' | 'gallery' | 'link-block' | 'review-block';

export function isTextBlock(block: PageBlock): block is TextPageBlock {
  return block.type === 'text';
}

export function isGalleryBlock(block: PageBlock): block is GalleryPageBlock {
  return block.type === 'gallery';
}

export function isLinkPageBlock(block: PageBlock): block is LinkPageBlock {
  return block.type === 'link-block';
}

export function isReviewPageBlock(block: PageBlock): block is ReviewPageBlock {
  return block.type === 'review-block';
}
