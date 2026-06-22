import type { SocialItem } from '@/models/editor.model';

export const FEATURED_SOCIAL_PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X'] as const;

function hasSocialValue(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizePlatform(value: string): string {
  return String(value ?? '').trim();
}

function isFeaturedPlatform(platform: string): boolean {
  const normalized = normalizePlatform(platform).toLowerCase();
  return FEATURED_SOCIAL_PLATFORMS.some((item) => item.toLowerCase() === normalized);
}

export function getFeaturedSocialItems(items: SocialItem[]): SocialItem[] {
  return FEATURED_SOCIAL_PLATFORMS.map((platform) => {
    const existing = items.find((item) => normalizePlatform(item.platform).toLowerCase() === platform.toLowerCase());
    return existing ?? { platform, url: '', iconUrl: '' };
  });
}

export function getExtraSocialItems(items: SocialItem[]): SocialItem[] {
  return items.filter((item) => !isFeaturedPlatform(item.platform));
}

export function getFilledExtraSocialItems(items: SocialItem[]): SocialItem[] {
  return getExtraSocialItems(items).filter(
    (item) => hasSocialValue(item.url) || hasSocialValue(item.iconUrl),
  );
}

export function mergeEditorSocialItems(items: SocialItem[]): SocialItem[] {
  return [...getFeaturedSocialItems(items), ...getExtraSocialItems(items)];
}

export function compactSocialItems(items: SocialItem[]): SocialItem[] {
  return [...getFeaturedSocialItems(items), ...getFilledExtraSocialItems(items)];
}

export function upsertSocialItem(items: SocialItem[], platform: string, patch: Partial<SocialItem>): SocialItem[] {
  const normalizedPlatform = normalizePlatform(platform);
  const index = items.findIndex(
    (item) => normalizePlatform(item.platform).toLowerCase() === normalizedPlatform.toLowerCase(),
  );

  if (index >= 0) {
    const next = [...items];
    next[index] = { ...next[index], ...patch, platform: normalizedPlatform };
    return next;
  }

  return [...items, { platform: normalizedPlatform, url: '', iconUrl: '', ...patch }];
}

export function removeSocialItemAt(items: SocialItem[], index: number): SocialItem[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function removeExtraSocialItem(items: SocialItem[], extraItem: SocialItem): SocialItem[] {
  let removed = false;
  return items.filter((item) => {
    if (removed) {
      return true;
    }
    if (
      normalizePlatform(item.platform).toLowerCase() === normalizePlatform(extraItem.platform).toLowerCase() &&
      item.url === extraItem.url &&
      item.iconUrl === extraItem.iconUrl
    ) {
      removed = true;
      return false;
    }
    return true;
  });
}

export function addExtraSocialItem(items: SocialItem[], platform: string): SocialItem[] {
  return mergeEditorSocialItems([...items, { platform, url: '', iconUrl: '' }]);
}

export function resolveEditorSocialItems(items: SocialItem[] | undefined | null): SocialItem[] {
  if (!items?.length) {
    return getFeaturedSocialItems([]);
  }
  return items;
}

export function shouldExpandExtraSocialItems(items: SocialItem[]): boolean {
  return getFilledExtraSocialItems(items).length > 0;
}
