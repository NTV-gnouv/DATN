import type { AvatarDisplayStyle } from '@/models/avatar-display.model';

export type SocialItem = {
  platform: string;
  url: string;
  iconUrl: string;
};

export type PageBackgroundMode = 'solid' | 'gradient' | 'image' | 'ai';

export type PageBackgroundGradientType = 'linear' | 'radial' | 'diagonal';

export type PageBackground = {
  mode: PageBackgroundMode;
  solid: string;
  gradient: {
    start: string;
    end: string;
    type: PageBackgroundGradientType;
  };
  imageUrl: string;
  aiPrompt?: string;
  overlayColor?: string;
  overlayOpacity?: number;
};

export type HeaderBlockFields = {
  profile: {
    avatarUrl: string;
    displayName: string;
    bio: string;
    avatarShape: 'circle' | 'square';
    avatarDisplayStyle?: AvatarDisplayStyle;
    avatarSize: number; // width % of page container (18-72)
    displayNameSize?: number; // scale % of theme heading size (10-100)
  };
  theme: {
    defaultThemeId: string;
  };
  layout: {
    mode: string;
    config: Record<string, unknown>;
  };
  colors: {
    pageBackground: PageBackground;
    headerTextAndIcon: string;
    socialBlockBackground: string;
    socialBlockText: string;
    contentBlockBackground: string;
    contentBlockText: string;
    contentBlockButton: string;
  };
  typography: {
    fontFamily: string;
    displayFontFamily: string;
    bodyFontFamily: string;
    fontPairingId: string;
    fontSize: number;
    fontWeight: number;
    headingSize: number;
    headingWeight: number;
    headingLetterSpacing: number;
    headingTransform: 'none' | 'uppercase';
    lineHeight: number;
  };
  socials: {
    iconSize: number;
    displayMode: 'icons' | 'buttons' | 'both' | 'icon-only';
    items: SocialItem[];
    customFaviconEnabled: boolean;
  };
  divLayout: {
    widthPercent: number;
    border: {
      width: number;
      style: 'solid' | 'dashed' | 'none';
      color: string;
      radius: number;
    };
    boxShadow: {
      enabled: boolean;
      x: number;
      y: number;
      blur: number;
      spread: number;
      color: string;
    };
  };
};

export type HeaderBlock = {
  id: string;
  type: 'header';
  name: string;
  version: string;
  isDefault: boolean;
  fields: HeaderBlockFields;
};
