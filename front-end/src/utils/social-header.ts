import type { HeaderBlock, SocialItem } from '@/models/editor.model';
import type { SocialDisplayMode } from '@/models/social-display.model';
import { normalizeHeaderBlock } from '@/utils/normalize-header-block';

export type SocialHandleMap = {
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
};

const PLATFORM_ENTRIES: Array<{ platform: string; key: keyof SocialHandleMap }> = [
  { platform: 'TikTok', key: 'tiktok' },
  { platform: 'Instagram', key: 'instagram' },
  { platform: 'YouTube', key: 'youtube' },
  { platform: 'X', key: 'x' },
];

function normalizeSocialHandle(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/^@+/, '');
}

export function buildSocialProfileUrl(platform: string, handle: string): string {
  const username = normalizeSocialHandle(handle);
  if (!username) {
    return '';
  }

  switch (platform.toLowerCase()) {
    case 'tiktok':
      return `https://www.tiktok.com/@${username}`;
    case 'instagram':
      return `https://www.instagram.com/${username}/`;
    case 'youtube':
      return `https://www.youtube.com/@${username}`;
    case 'x':
      return `https://x.com/${username}`;
    default:
      return '';
  }
}

export function buildSocialItemsFromHandles(
  handles: SocialHandleMap,
  existingItems: SocialItem[] = [],
): SocialItem[] {
  const templateByPlatform = new Map(
    existingItems.map((item) => [String(item.platform ?? '').toLowerCase(), item]),
  );

  return PLATFORM_ENTRIES.map(({ platform, key }) => {
    const handle = handles[key] ?? '';
    const url = buildSocialProfileUrl(platform, handle);
    const template = templateByPlatform.get(platform.toLowerCase());
    return {
      platform,
      url,
      iconUrl: template?.iconUrl ?? '',
    };
  }).filter((item) => Boolean(item.url.trim()));
}

export function socialHandlesFromAnswers(answers?: Record<string, string>): SocialHandleMap {
  if (!answers) {
    return {};
  }

  return {
    tiktok: answers.social_tiktok ?? '',
    instagram: answers.social_instagram ?? '',
    youtube: answers.social_youtube ?? '',
    x: answers.social_x ?? '',
  };
}

export function applySocialHandlesToHeaderBlock(
  headerBlock: HeaderBlock,
  handles: SocialHandleMap,
  options?: { displayMode?: SocialDisplayMode },
): HeaderBlock {
  const normalized = normalizeHeaderBlock(headerBlock);
  if (!normalized) {
    return headerBlock;
  }

  const items = buildSocialItemsFromHandles(handles, normalized.fields.socials.items);
  const hasSocial = items.length > 0;

  return {
    ...normalized,
    fields: {
      ...normalized.fields,
      socials: {
        ...normalized.fields.socials,
        displayMode: options?.displayMode ?? (hasSocial ? 'both' : normalized.fields.socials.displayMode),
        items: hasSocial ? items : normalized.fields.socials.items,
      },
    },
  };
}
