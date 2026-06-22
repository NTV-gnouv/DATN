import * as simpleIcons from 'simple-icons';

type SimpleIcon = {
  title: string;
  slug: string;
  path: string;
  hex: string;
  svg: string;
};

const PLATFORM_TO_ICON_EXPORT: Record<string, string> = {
  tiktok: 'siTiktok',
  instagram: 'siInstagram',
  facebook: 'siFacebook',
  youtube: 'siYoutube',
  x: 'siX',
  twitter: 'siX',
  linkedin: 'siLinkedin',
  github: 'siGithub',
  gitlab: 'siGitlab',
  threads: 'siThreads',
  bluesky: 'siBluesky',
  discord: 'siDiscord',
  whatsapp: 'siWhatsapp',
  telegram: 'siTelegram',
  spotify: 'siSpotify',
  soundcloud: 'siSoundcloud',
  medium: 'siMedium',
  substack: 'siSubstack',
  vimeo: 'siVimeo',
  pinterest: 'siPinterest',
  reddit: 'siReddit',
  behance: 'siBehance',
  twitch: 'siTwitch',
  kick: 'siKick',
  snapchat: 'siSnapchat',
  tumblr: 'siTumblr',
  quora: 'siQuora',
  steam: 'siSteam',
  etsy: 'siEtsy',
  ebay: 'siEbay',
  mercari: 'siMercari',
  poshmark: 'siPoshmark',
  amazon: 'siAmazon',
  appstore: 'siAppstore',
  googleplay: 'siGoogleplay',
  applemusic: 'siApplemusic',
  appletv: 'siAppletv',
  applepodcasts: 'siApplepodcasts',
  deezer: 'siDeezer',
  pandora: 'siPandora',
  tidal: 'siTidal',
  bandcamp: 'siBandcamp',
  patreon: 'siPatreon',
  venmo: 'siVenmo',
  cashapp: 'siCashapp',
  mail: 'siGmail',
  email: 'siGmail',
  gmail: 'siGmail',
  website: 'siGooglechrome',
  web: 'siGooglechrome',
};

const FALLBACK_ICONS: Record<string, string> = {
  mail: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm2 0 8 6 8-6H4zm16 14V7l-8 6-8-6v12h16z"/></svg>`,
  website: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.02a15.38 15.38 0 0 0-1.47-5.03A8.02 8.02 0 0 1 19.93 11zM12 4.07c.95 1.28 1.95 3.53 2.35 6.93H9.65C10.05 7.6 11.05 5.35 12 4.07zM8.56 5.97A15.37 15.37 0 0 0 7.09 11H4.07a8.02 8.02 0 0 1 4.49-5.03zM4.07 13h3.02c.2 1.82.7 3.56 1.47 5.03A8.02 8.02 0 0 1 4.07 13zM12 19.93c-.95-1.28-1.95-3.53-2.35-6.93h4.7c-.4 3.4-1.4 5.65-2.35 6.93zm3.44-1.9A15.37 15.37 0 0 0 16.91 13h3.02a8.02 8.02 0 0 1-4.49 5.03z"/></svg>`,
};

function normalizePlatform(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[._-]/g, '');
}

function getSimpleIconByPlatform(platform: string): SimpleIcon | null {
  const normalized = normalizePlatform(platform);
  const exportName = PLATFORM_TO_ICON_EXPORT[normalized];
  if (!exportName) {
    return null;
  }

  const icon = (simpleIcons as Record<string, SimpleIcon | undefined>)[exportName];
  return icon ?? null;
}

function buildSimpleIconSvg(icon: SimpleIcon, color?: string): string {
  const fill = color || 'currentColor';
  return `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${fill}"><title>${icon.title}</title><path d="${icon.path}"/></svg>`;
}

export function getSocialPlatformIcon(platform: string, color?: string): string | null {
  const icon = getSimpleIconByPlatform(platform);
  if (icon) {
    return buildSimpleIconSvg(icon, color);
  }

  const fallbackKey = normalizePlatform(platform);
  const fallback = FALLBACK_ICONS[fallbackKey];
  if (!fallback) {
    return null;
  }

  return color ? fallback.replace(/currentColor/g, color) : fallback;
}

export function getSupportedPlatforms(): string[] {
  return Object.keys(PLATFORM_TO_ICON_EXPORT);
}
