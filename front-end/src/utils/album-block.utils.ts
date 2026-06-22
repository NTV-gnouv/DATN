import type { AlbumImage, AlbumItem, AlbumPageBlock } from '@/models/content-blocks.model';
import {
  ALBUM_BLOCK_MAX_ALBUMS,
  ALBUM_BLOCK_MAX_CATEGORIES,
  ALBUM_BLOCK_MAX_IMAGES,
  ALBUM_DESCRIPTION_MAX_LENGTH,
} from '@/models/content-blocks.model';
import { createBlockId } from '@/utils/page-blocks';

export {
  ALBUM_BLOCK_MAX_ALBUMS,
  ALBUM_BLOCK_MAX_CATEGORIES,
  ALBUM_BLOCK_MAX_IMAGES,
  ALBUM_DESCRIPTION_MAX_LENGTH,
};

function normalizeCategoryName(value: unknown): string {
  return String(value ?? '').trim();
}

function dedupeCategories(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeCategoryName(value);
    if (!normalized) {
      continue;
    }

    const key = normalized.toLocaleLowerCase('vi');
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result.slice(0, ALBUM_BLOCK_MAX_CATEGORIES);
}

export function clampAlbumDescription(value: string): string {
  return String(value ?? '').trim().slice(0, ALBUM_DESCRIPTION_MAX_LENGTH);
}

function normalizeAlbumImage(raw: unknown, index: number): AlbumImage | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const url = String(record.url ?? '').trim();
  if (!url) {
    return null;
  }

  const id = String(record.id ?? '').trim() || `album-img-${index}`;
  const caption = String(record.caption ?? '').trim();

  return {
    id,
    url,
    caption: caption || undefined,
  };
}

function normalizeAlbumItem(raw: unknown, index: number): AlbumItem | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const title = String(record.title ?? '').trim();
  if (!title) {
    return null;
  }

  const images = (Array.isArray(record.images) ? record.images : [])
    .map((item, imageIndex) => normalizeAlbumImage(item, imageIndex))
    .filter((item): item is AlbumImage => Boolean(item))
    .slice(0, ALBUM_BLOCK_MAX_IMAGES);

  const description = clampAlbumDescription(String(record.description ?? ''));
  const category = String(record.category ?? '').trim();

  return {
    id: String(record.id ?? '').trim() || `album-${index}`,
    title,
    description: description || undefined,
    category: category || undefined,
    images,
  };
}

export function normalizeAlbumBlock(block: AlbumPageBlock): AlbumPageBlock {
  const albums = (Array.isArray(block.albums) ? block.albums : [])
    .map((item, index) => normalizeAlbumItem(item, index))
    .filter((item): item is AlbumItem => Boolean(item))
    .slice(0, ALBUM_BLOCK_MAX_ALBUMS);

  const explicitCategories = Array.isArray(block.categories)
    ? block.categories.map((item) => normalizeCategoryName(item)).filter(Boolean)
    : [];
  const albumCategories = albums.map((album) => normalizeCategoryName(album.category)).filter(Boolean);
  const categories = dedupeCategories([...explicitCategories, ...albumCategories]);

  return {
    ...block,
    type: 'album-block',
    id: String(block.id ?? '').trim() || createBlockId('album'),
    visible: block.visible !== false,
    title: String(block.title ?? '').trim() || undefined,
    subtitle: String(block.subtitle ?? '').trim() || undefined,
    categories,
    albums,
  };
}

export function getAlbumPreviewImage(album: AlbumItem): string {
  return album.images[0]?.url ?? '';
}

export function createEmptyAlbum(): AlbumItem {
  return {
    id: createBlockId('album'),
    title: '',
    description: '',
    category: '',
    images: [],
  };
}

export function getAlbumCategoriesForFilter(categories: string[], albums: AlbumItem[]): string[] {
  const used = new Set(
    albums
      .map((album) => normalizeCategoryName(album.category))
      .filter(Boolean)
      .map((item) => item.toLocaleLowerCase('vi')),
  );

  return categories.filter((category) => used.has(category.toLocaleLowerCase('vi')));
}

export function filterAlbumsByCategory(albums: AlbumItem[], category: string | 'all'): AlbumItem[] {
  if (category === 'all') {
    return albums;
  }

  const key = category.toLocaleLowerCase('vi');
  return albums.filter((album) => normalizeCategoryName(album.category).toLocaleLowerCase('vi') === key);
}
