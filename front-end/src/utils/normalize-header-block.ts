import type { HeaderBlock, PageBackground } from '@/models/editor.model';

export function createDefaultPageBackground(): PageBackground {
  return {
    mode: 'solid',
    solid: '#ffffff',
    gradient: {
      start: '#ffffff',
      end: '#cbd5e1',
      type: 'linear',
    },
    imageUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0,
  };
}

export function normalizeHeaderBlock(headerBlock: HeaderBlock | null | undefined): HeaderBlock | null {
  if (!headerBlock) {
    return null;
  }

  const fields = (headerBlock.fields ?? {}) as Partial<HeaderBlock['fields']>;
  const colors = (fields.colors ?? {}) as Partial<HeaderBlock['fields']['colors']>;
  const profile = (fields.profile ?? {}) as Partial<HeaderBlock['fields']['profile']>;
  const socials = (fields.socials ?? {}) as Partial<HeaderBlock['fields']['socials']>;
  const typography = (fields.typography ?? {}) as Partial<HeaderBlock['fields']['typography']>;
  const divLayout = (fields.divLayout ?? {}) as Partial<HeaderBlock['fields']['divLayout']>;
  const border = divLayout.border ?? { width: 1, style: 'solid' as const, color: '#cccccc', radius: 2 };
  const boxShadow = divLayout.boxShadow ?? {
    enabled: false,
    x: 0,
    y: 0,
    blur: 5,
    spread: 0,
    color: 'rgba(0,0,0,0.3)',
  };

  return {
    ...headerBlock,
    fields: {
      profile: {
        avatarUrl: profile.avatarUrl ?? '',
        displayName: profile.displayName ?? '',
        bio: profile.bio ?? '',
        avatarShape: profile.avatarShape ?? 'circle',
        avatarDisplayStyle: profile.avatarDisplayStyle ?? profile.avatarShape ?? 'circle',
        avatarSize: profile.avatarSize ?? 32,
        displayNameSize: profile.displayNameSize ?? 100,
      },
      theme: {
        defaultThemeId: fields.theme?.defaultThemeId ?? 'minimal',
      },
      layout: {
        mode: fields.layout?.mode ?? 'default',
        config: fields.layout?.config ?? {},
      },
      colors: {
        pageBackground: colors.pageBackground ?? createDefaultPageBackground(),
        headerTextAndIcon: colors.headerTextAndIcon ?? '#111111',
        socialBlockBackground: colors.socialBlockBackground ?? '#f5f5f5',
        socialBlockText: colors.socialBlockText ?? '#111111',
        contentBlockBackground: colors.contentBlockBackground ?? '#ffffff',
        contentBlockText: colors.contentBlockText ?? '#111111',
        contentBlockButton: colors.contentBlockButton ?? '#111111',
      },
      typography: {
        fontFamily: typography.fontFamily ?? 'Inter',
        displayFontFamily: typography.displayFontFamily ?? typography.fontFamily ?? 'Inter',
        bodyFontFamily: typography.bodyFontFamily ?? typography.fontFamily ?? 'Inter',
        fontPairingId: typography.fontPairingId ?? 'modern-inter',
        fontSize: typography.fontSize ?? 16,
        fontWeight: typography.fontWeight ?? 400,
        headingSize: typography.headingSize ?? 32,
        headingWeight: typography.headingWeight ?? 700,
        headingLetterSpacing: typography.headingLetterSpacing ?? -0.02,
        headingTransform: typography.headingTransform ?? 'none',
        lineHeight: typography.lineHeight ?? 1.5,
      },
      socials: {
        iconSize: socials.iconSize ?? 24,
        displayMode: socials.displayMode ?? 'icons',
        items: Array.isArray(socials.items) ? socials.items : [],
        customFaviconEnabled: socials.customFaviconEnabled ?? true,
      },
      divLayout: {
        widthPercent: divLayout.widthPercent ?? 100,
        border,
        boxShadow,
      },
    },
  };
}
